"use server";

import { createClient } from "@/lib/supabase/server";
import { requireUser } from "@/lib/auth";
import { redirect } from "next/navigation";

export type FormState = { error?: string } | null;

function optionalText(formData: FormData, key: string) {
  return String(formData.get(key) ?? "").trim() || null;
}

function optionalNumber(formData: FormData, key: string) {
  const raw = String(formData.get(key) ?? "").trim();
  if (!raw) return null;

  const value = Number(raw);
  return Number.isFinite(value) && value >= 0 ? value : null;
}

export async function createSegaDealsRequestAction(
  _prev: FormState,
  formData: FormData
): Promise<FormState> {
  const user = await requireUser();

  const type = String(formData.get("type") ?? "");
  if (!["umrah", "haji", "halal_tour", "tour"].includes(type)) {
    return { error: "Pilih jenis perjalanan." };
  }

  const pax = Number(formData.get("pax") ?? 1);
  if (!Number.isInteger(pax) || pax < 1) {
    return { error: "Jumlah pax minimal 1." };
  }

  const flexDays = Number(formData.get("flex_days") ?? 0);
  if (!Number.isInteger(flexDays) || flexDays < 0) {
    return { error: "Fleksibilitas hari tidak valid." };
  }

  const budgetMin = optionalNumber(formData, "budget_min");
  const budgetMax = optionalNumber(formData, "budget_max");

  if (
    budgetMin !== null &&
    budgetMax !== null &&
    budgetMin > budgetMax
  ) {
    return {
      error: "Budget minimum tidak boleh lebih besar dari budget maksimum.",
    };
  }

  const dateFrom = optionalText(formData, "date_from");
  const dateTo = optionalText(formData, "date_to");

  if (dateFrom && dateTo && dateFrom > dateTo) {
    return {
      error: "Tanggal selesai tidak boleh lebih awal dari tanggal mulai.",
    };
  }

  const supabase = await createClient();

  const { data, error } = await supabase
    .from("segadeals_requests")
    .insert({
      traveler_user_id: user.id,
      type,
      origin_city: optionalText(formData, "origin_city"),
      destination: optionalText(formData, "destination"),
      date_from: dateFrom,
      date_to: dateTo,
      flex_days: flexDays,
      pax,
      budget_min: budgetMin,
      budget_max: budgetMax,
      hotel_pref: optionalText(formData, "hotel_pref"),
      airline_pref: optionalText(formData, "airline_pref"),
      room_config: optionalText(formData, "room_config"),
      additional_request: optionalText(formData, "additional_request"),
    })
    .select("id")
    .single();

  if (error || !data) {
    return {
      error: error?.message ?? "Gagal mengirim permintaan.",
    };
  }

  redirect(`/akun/segadeals/${data.id}?created=1`);
}