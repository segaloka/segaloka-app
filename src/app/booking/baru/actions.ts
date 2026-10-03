"use server";

import { createClient } from "@/lib/supabase/server";
import { requireUser } from "@/lib/auth";
import { redirect } from "next/navigation";

export type FormState = { errorCode?: string } | null;

const BOOKING_ERROR_CODES = ["AUTH_REQUIRED", "INVALID_PAX_COUNT", "PASSENGER_NAME_REQUIRED", "DEPARTURE_NOT_AVAILABLE", "PACKAGE_NOT_AVAILABLE", "INSUFFICIENT_QUOTA"] as const;

export async function createBookingAction(_prev: FormState, formData: FormData): Promise<FormState> {
  await requireUser();

  const departureId = String(formData.get("departure_id") ?? "").trim();
  const paxCount = Number(formData.get("pax_count") ?? 1);
  const notes = String(formData.get("notes") ?? "").trim() || null;
  const names = formData.getAll("passenger_name").map((value) => String(value).trim());

  if (!departureId) return { errorCode: "INVALID_DEPARTURE" };
  if (!Number.isInteger(paxCount) || paxCount < 1 || paxCount > 100) {
    return { errorCode: "INVALID_PAX_COUNT" };
  }
  if (names.length !== paxCount || names.some((name) => !name)) {
    return { errorCode: "PASSENGER_NAME_REQUIRED" };
  }

  const supabase = await createClient();
  const { data: bookingId, error } = await supabase.rpc("create_marketplace_booking", {
    p_departure_id: departureId,
    p_passenger_names: names,
    p_notes: notes,
  } as never);

  if (error || !bookingId) {
    const knownError = BOOKING_ERROR_CODES.find((code) => error?.message?.includes(code));
    return { errorCode: knownError ?? "BOOKING_FAILED" };
  }

  redirect(`/akun/booking/${bookingId}?created=1`);
}
