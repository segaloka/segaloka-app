"use server";

import { createClient } from "@/lib/supabase/server";
import { requireUser, hasPermission, getOrgBySlug } from "@/lib/auth";
import { revalidatePath } from "next/cache";

export async function updateBookingStatusAction(formData: FormData) {
  const orgSlug = String(formData.get("org_slug"));
  const bookingId = String(formData.get("booking_id"));
  const status = String(formData.get("status"));
  const org = await getOrgBySlug(orgSlug);
  if (!org) return;

  const permKey = status === "cancelled" ? "booking.cancel" : "booking.manage";
  const allowed = await hasPermission(org.id, permKey);
  if (!allowed) return;

  const supabase = await createClient();
  await supabase.from("bookings").update({ status }).eq("id", bookingId).eq("org_id", org.id);
  revalidatePath(`/dashboard/${orgSlug}/booking/${bookingId}`);
  revalidatePath(`/dashboard/${orgSlug}/booking`);
}

export async function verifyPaymentDocumentAction(formData: FormData) {
  const orgSlug = String(formData.get("org_slug"));
  const bookingId = String(formData.get("booking_id"));
  const docId = String(formData.get("doc_id"));
  const nextStatus = String(formData.get("next_status"));
  const org = await getOrgBySlug(orgSlug);
  if (!org) return;

  const allowed = await hasPermission(org.id, "payment.manage");
  if (!allowed) return;

  const supabase = await createClient();
  await supabase.from("documents").update({ status: nextStatus }).eq("id", docId);

  if (nextStatus === "verified") {
    const user = await requireUser();
    await supabase.from("invoices").update({ status: "paid" }).eq("booking_id", bookingId);
    const { data: booking } = await supabase.from("bookings").select("total_amount").eq("id", bookingId).single();
    if (booking) {
      await supabase.from("payments").insert({
        booking_id: bookingId,
        provider: "manual_transfer",
        method: "bank_transfer",
        gross_amount: booking.total_amount,
        fee_amount: 0,
        net_amount: booking.total_amount,
        status: "paid",
        paid_at: new Date().toISOString(),
      });
      await supabase.from("ledger_entries").insert([
        { org_id: org.id, ref_type: "payment", ref_id: bookingId, account: "revenue", direction: "credit", amount: booking.total_amount, description: "Pembayaran booking terverifikasi", created_by: user.id },
      ]);
      await supabase.from("bookings").update({ status: "confirmed" }).eq("id", bookingId).eq("status", "pending");
    }
  }

  revalidatePath(`/dashboard/${orgSlug}/booking/${bookingId}`);
}
