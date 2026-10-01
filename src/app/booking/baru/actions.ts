"use server";

import { createClient } from "@/lib/supabase/server";
import { requireUser } from "@/lib/auth";
import { bookingCode } from "@/lib/utils";
import { redirect } from "next/navigation";

export type FormState = { error?: string } | null;

export async function createBookingAction(_prev: FormState, formData: FormData): Promise<FormState> {
  const user = await requireUser();
  const departureId = String(formData.get("departure_id") ?? "");
  const paxCount = Number(formData.get("pax_count") ?? 1);
  const notes = String(formData.get("notes") ?? "").trim() || null;

  const names = formData.getAll("passenger_name").map((v) => String(v).trim());

  if (!departureId) {
    return { error: "Jadwal keberangkatan tidak valid." };
  }

  if (!Number.isInteger(paxCount) || paxCount < 1 || paxCount > 100) {
    return { error: "Jumlah jamaah tidak valid." };
  }

  if (names.length !== paxCount || names.some((n) => !n)) {
    return { error: "Data seluruh jamaah wajib diisi dengan lengkap." };
  }

  const supabase = await createClient();

  const { data: departure } = await supabase
    .from("departures")
    .select("id, quota, filled, package_id, packages(org_id, base_price, status)")
    .eq("id", departureId)
    .in("status", ["open", "almost_full"])
    .single();

  if (!departure) return { error: "Jadwal keberangkatan tidak ditemukan." };
  const pkg = departure.packages as any;
  if (pkg?.status !== "published") return { error: "Paket ini belum tersedia untuk dipesan." };
  if (departure.quota - departure.filled < paxCount) return { error: "Kuota tidak mencukupi untuk jumlah jamaah ini." };

  const { data: booking, error: bookingError } = await supabase
    .from("bookings")
    .insert({
      code: bookingCode(),
      org_id: pkg.org_id,
      departure_id: departureId,
      traveler_user_id: user.id,
      pax_count: paxCount,
      total_amount: pkg.base_price * paxCount,
      notes,
    })
    .select("id")
    .single();

  if (bookingError || !booking) return { error: bookingError?.message ?? "Gagal membuat booking." };

  const passengerRows = names.map((full_name) => ({
    booking_id: booking.id,
    full_name,
  }));

  const { error: paxError } = await supabase
    .from("booking_passengers")
    .insert(passengerRows);

  if (paxError) {
    return {
      error:
        "Booking tercatat, tetapi data jamaah belum berhasil disimpan. Silakan buka Booking Saya atau hubungi tim Segaloka.",
    };
  }

  const { error: invoiceError } = await supabase.from("invoices").insert({
    booking_id: booking.id,
    number: `INV-${bookingCode()}`,
    amount: pkg.base_price * paxCount,
    due_date: new Date(Date.now() + 3 * 24 * 3600 * 1000)
      .toISOString()
      .slice(0, 10),
  });

  if (invoiceError) {
    return {
      error:
        "Booking dan data jamaah berhasil disimpan, tetapi invoice belum berhasil dibuat. Silakan buka Booking Saya atau hubungi tim Segaloka.",
    };
  }

  redirect(`/akun/booking/${booking.id}?created=1`);
}
