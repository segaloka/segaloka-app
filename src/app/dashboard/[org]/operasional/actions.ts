"use server";

import { createClient } from "@/lib/supabase/server";
import { requireUser, hasPermission, getOrgBySlug } from "@/lib/auth";
import { revalidatePath } from "next/cache";

export type FormState = { error?: string } | null;

export async function generateManifestAction(formData: FormData) {
  const orgSlug = String(formData.get("org_slug"));
  const departureId = String(formData.get("departure_id"));
  const templateType = String(formData.get("template_type") ?? "standard");
  const org = await getOrgBySlug(orgSlug);
  if (!org) return;
  const user = await requireUser();
  const allowed = await hasPermission(org.id, "operations.manage");
  if (!allowed) return;

  const supabase = await createClient();

  const { data: bookings } = await supabase
    .from("bookings")
    .select("id, booking_passengers(id, full_name, passport_number, dob, gender)")
    .eq("departure_id", departureId)
    .in("status", ["confirmed", "completed"]);

  const { data: manifest, error } = await supabase
    .from("manifests")
    .insert({ departure_id: departureId, template_type: templateType, fields_schema: { columns: ["full_name", "passport_number", "dob", "gender"] }, generated_by: user.id })
    .select("id")
    .single();

  if (error || !manifest) return;

  const entries = (bookings ?? []).flatMap((b: any) =>
    (b.booking_passengers ?? []).map((p: any) => ({
      manifest_id: manifest.id,
      booking_passenger_id: p.id,
      data: { full_name: p.full_name, passport_number: p.passport_number, dob: p.dob, gender: p.gender },
    }))
  );

  if (entries.length > 0) await supabase.from("manifest_entries").insert(entries);

  revalidatePath(`/dashboard/${orgSlug}/operasional/manifest/${departureId}`);
}

export async function createRoomAction(_prev: FormState, formData: FormData): Promise<FormState> {
  const orgSlug = String(formData.get("org_slug") ?? "");
  const departureId = String(formData.get("departure_id") ?? "");
  const org = await getOrgBySlug(orgSlug);
  if (!org) return { error: "Organisasi tidak ditemukan." };
  const allowed = await hasPermission(org.id, "operations.manage");
  if (!allowed) return { error: "Anda tidak memiliki izin operations.manage." };

  const hotelName = String(formData.get("hotel_name") ?? "").trim() || null;
  const roomType = String(formData.get("room_type") ?? "").trim() || null;
  const roomNumber = String(formData.get("room_number") ?? "").trim() || null;
  const capacity = Number(formData.get("capacity") ?? 2);

  const supabase = await createClient();
  const { error } = await supabase.from("rooms").insert({ departure_id: departureId, hotel_name: hotelName, room_type: roomType, room_number: roomNumber, capacity });
  if (error) return { error: error.message };
  revalidatePath(`/dashboard/${orgSlug}/operasional/roomlist/${departureId}`);
  return { error: undefined };
}

export async function assignRoomOccupantAction(formData: FormData) {
  const orgSlug = String(formData.get("org_slug"));
  const departureId = String(formData.get("departure_id"));
  const roomId = String(formData.get("room_id"));
  const passengerId = String(formData.get("passenger_id"));
  const org = await getOrgBySlug(orgSlug);
  if (!org) return;
  const allowed = await hasPermission(org.id, "operations.manage");
  if (!allowed || !passengerId) return;

  const supabase = await createClient();
  await supabase.from("room_occupants").insert({ room_id: roomId, booking_passenger_id: passengerId });
  revalidatePath(`/dashboard/${orgSlug}/operasional/roomlist/${departureId}`);
}

export async function removeRoomOccupantAction(formData: FormData) {
  const orgSlug = String(formData.get("org_slug"));
  const departureId = String(formData.get("departure_id"));
  const occupantId = String(formData.get("occupant_id"));
  const org = await getOrgBySlug(orgSlug);
  if (!org) return;
  const allowed = await hasPermission(org.id, "operations.manage");
  if (!allowed) return;

  const supabase = await createClient();
  await supabase.from("room_occupants").delete().eq("id", occupantId);
  revalidatePath(`/dashboard/${orgSlug}/operasional/roomlist/${departureId}`);
}
