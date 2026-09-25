"use server";

import { createClient } from "@/lib/supabase/server";
import { requireUser } from "@/lib/auth";
import { redirect } from "next/navigation";

export type FormState = { error?: string } | null;

export async function createSegaDealsRequestAction(_prev: FormState, formData: FormData): Promise<FormState> {
  const user = await requireUser();
  const type = String(formData.get("type") ?? "");
  if (!["umrah", "haji", "halal_tour", "tour"].includes(type)) return { error: "Pilih jenis perjalanan." };

  const pax = Number(formData.get("pax") ?? 1);
  if (pax < 1) return { error: "Jumlah pax minimal 1." };

  const supabase = await createClient();
  const { data, error } = await supabase
    .from("segadeals_requests")
    .insert({
      traveler_user_id: user.id,
      type,
      origin_city: String(formData.get("origin_city") ?? "").trim() || null,
      destination: String(formData.get("destination") ?? "").trim() || null,
      date_from: String(formData.get("date_from") ?? "") || null,
      date_to: String(formData.get("date_to") ?? "") || null,
      flex_days: Number(formData.get("flex_days") ?? 0),
      pax,
      budget_min: formData.get("budget_min") ? Number(formData.get("budget_min")) : null,
      budget_max: formData.get("budget_max") ? Number(formData.get("budget_max")) : null,
      hotel_pref: String(formData.get("hotel_pref") ?? "").trim() || null,
      airline_pref: String(formData.get("airline_pref") ?? "").trim() || null,
      room_config: String(formData.get("room_config") ?? "").trim() || null,
      additional_request: String(formData.get("additional_request") ?? "").trim() || null,
    })
    .select("id")
    .single();

  if (error || !data) return { error: error?.message ?? "Gagal mengirim permintaan." };
  redirect(`/akun/segadeals/${data.id}?created=1`);
}
