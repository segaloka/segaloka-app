"use server";

import { createClient } from "@/lib/supabase/server";
import { requireUser } from "@/lib/auth";
import { redirect } from "next/navigation";

export type FormState = { error?: string } | null;

const BOOKING_ERRORS: Record<string, string> = {
  AUTH_REQUIRED: "Silakan masuk kembali sebelum membuat booking.",
  INVALID_PAX_COUNT: "Jumlah jamaah tidak valid.",
  PASSENGER_NAME_REQUIRED: "Data seluruh jamaah wajib diisi dengan lengkap.",
  DEPARTURE_NOT_AVAILABLE: "Jadwal keberangkatan sudah tidak tersedia.",
  PACKAGE_NOT_AVAILABLE: "Paket ini belum tersedia untuk dipesan.",
  INSUFFICIENT_QUOTA: "Kuota tidak mencukupi untuk jumlah jamaah ini.",
};

export async function createBookingAction(_prev: FormState, formData: FormData): Promise<FormState> {
  await requireUser();

  const departureId = String(formData.get("departure_id") ?? "").trim();
  const paxCount = Number(formData.get("pax_count") ?? 1);
  const notes = String(formData.get("notes") ?? "").trim() || null;
  const names = formData.getAll("passenger_name").map((value) => String(value).trim());

  if (!departureId) return { error: "Jadwal keberangkatan tidak valid." };
  if (!Number.isInteger(paxCount) || paxCount < 1 || paxCount > 100) {
    return { error: "Jumlah jamaah tidak valid." };
  }
  if (names.length !== paxCount || names.some((name) => !name)) {
    return { error: "Data seluruh jamaah wajib diisi dengan lengkap." };
  }

  const supabase = await createClient();
  const { data: bookingId, error } = await supabase.rpc("create_marketplace_booking", {
    p_departure_id: departureId,
    p_passenger_names: names,
    p_notes: notes,
  });

  if (error || !bookingId) {
    const knownError = Object.entries(BOOKING_ERRORS).find(([code]) =>
      error?.message?.includes(code)
    );
    return { error: knownError?.[1] ?? "Booking belum berhasil dibuat. Silakan coba kembali." };
  }

  redirect(`/akun/booking/${bookingId}?created=1`);
}
