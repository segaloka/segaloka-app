"use server";

import { createClient } from "@/lib/supabase/server";
import { requireUser } from "@/lib/auth";
import { bookingCode } from "@/lib/utils";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

export type FormState =
  | { error?: string; success?: boolean }
  | null;

export async function acceptOfferAction(
  _prev: FormState,
  formData: FormData
): Promise<FormState> {
  const user = await requireUser();
  const offerId = String(formData.get("offer_id") ?? "");

  if (!offerId) {
    return { error: "Penawaran tidak valid." };
  }

  const supabase = await createClient();

  const { data: offer, error: offerError } = await supabase
    .from("segadeals_offers")
    .select("*, segadeals_requests(*)")
    .eq("id", offerId)
    .single();

  if (offerError || !offer) {
    return { error: "Penawaran tidak ditemukan." };
  }

  const req = offer.segadeals_requests as any;

  if (!req || req.traveler_user_id !== user.id) {
    return {
      error: "Anda tidak berhak menerima penawaran ini.",
    };
  }

  if (!["open", "offered"].includes(req.status)) {
    return {
      error: "Permintaan ini sudah tidak dapat menerima penawaran.",
    };
  }

  if (offer.status !== "pending") {
    return {
      error: "Penawaran ini sudah tidak berlaku.",
    };
  }

  if (
    offer.expires_at &&
    new Date(offer.expires_at).getTime() < Date.now()
  ) {
    return {
      error: "Masa berlaku penawaran ini telah berakhir.",
    };
  }

  const { data: existingBooking } = await supabase
    .from("bookings")
    .select("id")
    .eq("segadeals_offer_id", offer.id)
    .maybeSingle();

  if (existingBooking) {
    redirect(
      `/akun/booking/${existingBooking.id}?fromOffer=1`
    );
  }

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
      custom_package_name: `${req.type.replace("_", " ")} — ${
        req.destination ?? "tujuan sesuai kesepakatan"
      }`,
      notes: offer.notes,
    })
    .select("id")
    .single();

  if (bookingError || !booking) {
    return {
      error:
        bookingError?.message ??
        "Gagal membuat booking.",
    };
  }

  const { error: invoiceError } = await supabase
    .from("invoices")
    .insert({
      booking_id: booking.id,
      number: `INV-${bookingCode()}`,
      amount: offer.price,
      due_date: new Date(
        Date.now() + 3 * 24 * 3600 * 1000
      )
        .toISOString()
        .slice(0, 10),
    });

  if (invoiceError) {
    return {
      error:
        "Booking berhasil dibuat, tetapi invoice belum berhasil dibuat. Silakan hubungi tim Segaloka.",
    };
  }

  const { error: acceptError } = await supabase
    .from("segadeals_offers")
    .update({ status: "accepted" })
    .eq("id", offer.id)
    .eq("status", "pending");

  if (acceptError) {
    return {
      error: "Gagal memperbarui status penawaran.",
    };
  }

  const { error: declineOthersError } = await supabase
    .from("segadeals_offers")
    .update({ status: "declined" })
    .eq("request_id", req.id)
    .neq("id", offer.id)
    .eq("status", "pending");

  if (declineOthersError) {
    return {
      error: "Booking dibuat, tetapi penawaran lain belum berhasil ditutup.",
    };
  }

  const { error: requestError } = await supabase
    .from("segadeals_requests")
    .update({ status: "converted" })
    .eq("id", req.id)
    .in("status", ["open", "offered"]);

  if (requestError) {
    return {
      error: "Booking dibuat, tetapi status SegaDeals belum berhasil diperbarui.",
    };
  }

  redirect(`/akun/booking/${booking.id}?fromOffer=1`);
}

export async function declineOfferAction(
  _prev: FormState,
  formData: FormData
): Promise<FormState> {
  const user = await requireUser();

  const offerId = String(formData.get("offer_id") ?? "");
  const requestId = String(formData.get("request_id") ?? "");

  if (!offerId || !requestId) {
    return { error: "Penawaran tidak valid." };
  }

  const supabase = await createClient();

  const { data: offer } = await supabase
    .from("segadeals_offers")
    .select("id, status, request_id, segadeals_requests(traveler_user_id)")
    .eq("id", offerId)
    .eq("request_id", requestId)
    .single();

  if (!offer) {
    return { error: "Penawaran tidak ditemukan." };
  }

  const request = offer.segadeals_requests as any;

  if (!request || request.traveler_user_id !== user.id) {
    return {
      error: "Anda tidak berhak menolak penawaran ini.",
    };
  }

  if (offer.status !== "pending") {
    return {
      error: "Penawaran ini sudah tidak dapat ditolak.",
    };
  }

  const { error } = await supabase
    .from("segadeals_offers")
    .update({ status: "declined" })
    .eq("id", offerId)
    .eq("status", "pending");

  if (error) {
    return {
      error: "Gagal menolak penawaran.",
    };
  }

  revalidatePath(`/akun/segadeals/${requestId}`);

  return { success: true };
}