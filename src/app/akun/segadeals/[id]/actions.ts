"use server";

import { createClient } from "@/lib/supabase/server";
import { requireUser } from "@/lib/auth";
import { bookingCode } from "@/lib/utils";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

export type FormState = { error?: string; success?: boolean } | null;

export async function acceptOfferAction(_prev: FormState, formData: FormData): Promise<FormState> {
  const user = await requireUser();
  const offerId = String(formData.get("offer_id") ?? "");
  const supabase = await createClient();

  const { data: offer } = await supabase
    .from("segadeals_offers")
    .select("*, segadeals_requests(*)")
    .eq("id", offerId)
    .single();

  if (!offer) return { error: "Penawaran tidak ditemukan." };
  const req = offer.segadeals_requests as any;
  if (req.traveler_user_id !== user.id) return { error: "Anda tidak berhak menerima penawaran ini." };
  if (offer.status !== "pending") return { error: "Penawaran ini sudah tidak berlaku." };

  const { data: booking, error: bookingError } = await supabase
    .from("bookings")
    .insert({
      code: bookingCode(),
      org_id: offer.org_id,
      traveler_user_id: user.id,
      pax_count: req.pax,
      total_amount: offer.price,
      segadeals_offer_id: offer.id,
      custom_departure_date: req.date_from,
      custom_package_name: `${req.type.replace("_", " ")} — ${req.destination ?? "tujuan sesuai kesepakatan"}`,
      notes: offer.notes,
    })
    .select("id")
    .single();

  if (bookingError || !booking) return { error: bookingError?.message ?? "Gagal membuat booking." };

  await supabase.from("invoices").insert({
    booking_id: booking.id,
    number: `INV-${bookingCode()}`,
    amount: offer.price,
    due_date: new Date(Date.now() + 3 * 24 * 3600 * 1000).toISOString().slice(0, 10),
  });

  await supabase.from("segadeals_offers").update({ status: "accepted" }).eq("id", offer.id);
  await supabase.from("segadeals_offers").update({ status: "declined" }).eq("request_id", req.id).neq("id", offer.id).eq("status", "pending");
  await supabase.from("segadeals_requests").update({ status: "converted" }).eq("id", req.id);

  redirect(`/akun/booking/${booking.id}?fromOffer=1`);
}

export async function declineOfferAction(_prev: FormState, formData: FormData): Promise<FormState> {
  await requireUser();
  const offerId = String(formData.get("offer_id") ?? "");
  const requestId = String(formData.get("request_id") ?? "");
  const supabase = await createClient();
  await supabase.from("segadeals_offers").update({ status: "declined" }).eq("id", offerId);
  revalidatePath(`/akun/segadeals/${requestId}`);
  return { success: true };
}
