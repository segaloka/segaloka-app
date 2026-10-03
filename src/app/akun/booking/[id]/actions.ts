"use server";

import { revalidatePath } from "next/cache";
import { requireUser } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";

type PaymentProofResult =
  | { ok: true }
  | { ok: false; error: string };

export async function submitPaymentProofAction(input: {
  bookingId: string;
  path: string;
  fileName: string;
}): Promise<PaymentProofResult> {
  const user = await requireUser();

  const bookingId = String(input.bookingId ?? "").trim();
  const path = String(input.path ?? "").trim();
  const fileName = String(input.fileName ?? "").trim();

  if (!bookingId || !path || !fileName) {
    return { ok: false, error: "Data bukti pembayaran tidak lengkap." };
  }

  const expectedPrefix = `${user.id}/booking/${bookingId}/`;
  if (!path.startsWith(expectedPrefix)) {
    return { ok: false, error: "Lokasi file bukti pembayaran tidak valid." };
  }

  const supabase = await createClient();

  const { data: booking, error: bookingError } = await supabase
    .from("bookings")
    .select("id")
    .eq("id", bookingId)
    .eq("traveler_user_id", user.id)
    .single();

  if (bookingError || !booking) {
    return { ok: false, error: "Booking tidak ditemukan atau bukan milik akun Anda." };
  }

  const { data: invoice, error: invoiceError } = await supabase
    .from("invoices")
    .select("id, status")
    .eq("booking_id", booking.id)
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle();

  if (invoiceError) {
    console.error("submitPaymentProofAction invoice lookup failed", {
      bookingId,
      userId: user.id,
      message: invoiceError.message,
    });
    return { ok: false, error: "Invoice belum dapat diperiksa. Silakan coba lagi." };
  }

  if (!invoice) {
    return { ok: false, error: "Invoice booking belum tersedia." };
  }

  if (invoice.status === "paid") {
    return { ok: false, error: "Invoice ini sudah lunas." };
  }

  const { data: duplicate, error: duplicateError } = await supabase
    .from("documents")
    .select("id")
    .eq("owner_type", "booking")
    .eq("owner_id", booking.id)
    .eq("category", "bukti_transfer")
    .eq("file_url", path)
    .maybeSingle();

  if (duplicateError) {
    console.error("submitPaymentProofAction duplicate check failed", {
      bookingId,
      userId: user.id,
      message: duplicateError.message,
    });
    return { ok: false, error: "Bukti pembayaran belum dapat diproses. Silakan coba lagi." };
  }

  if (duplicate) {
    revalidatePath(`/akun/booking/${booking.id}`);
    return { ok: true };
  }

  const { error: documentError } = await supabase.from("documents").insert({
    owner_type: "booking",
    owner_id: booking.id,
    category: "bukti_transfer",
    file_url: path,
    file_name: fileName,
    uploaded_by: user.id,
  });

  if (documentError) {
    console.error("submitPaymentProofAction insert failed", {
      bookingId,
      userId: user.id,
      message: documentError.message,
    });
    return { ok: false, error: "Gagal menyimpan bukti pembayaran. Silakan coba lagi." };
  }

  revalidatePath(`/akun/booking/${booking.id}`);
  revalidatePath("/akun/booking");
  revalidatePath("/akun");

  return { ok: true };
}
