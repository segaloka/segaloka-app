"use server";

import { createClient } from "@/lib/supabase/server";
import { requireUser, hasPermission, getOrgBySlug } from "@/lib/auth";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

export type FormState = { error?: string } | null;

export async function createOfferAction(_prev: FormState, formData: FormData): Promise<FormState> {
  const user = await requireUser();
  const orgSlug = String(formData.get("org_slug") ?? "");
  const requestId = String(formData.get("request_id") ?? "");
  const org = await getOrgBySlug(orgSlug);
  if (!org) return { error: "Organisasi tidak ditemukan." };
  const allowed = await hasPermission(org.id, "segadeals.respond");
  if (!allowed) return { error: "Anda tidak memiliki izin segadeals.respond." };
  if (org.status !== "active") return { error: "Travel harus terverifikasi untuk merespons SegaDeals." };

  const supabase = await createClient();

  const { data: deposit } = await supabase.from("segadeals_deposits").select("*").eq("org_id", org.id).maybeSingle();
  const balance = Number(deposit?.balance ?? 0);
  const minRequired = Number(deposit?.min_required ?? 0);
  if (balance < minRequired) {
    return { error: `Saldo deposit SegaDeals Anda (${balance.toLocaleString("id-ID")}) di bawah minimum yang disyaratkan (${minRequired.toLocaleString("id-ID")}). Hubungi tim Segaloka untuk top up deposit.` };
  }

  const price = Number(formData.get("price") ?? 0);
  if (price <= 0) return { error: "Harga penawaran wajib diisi." };
  const notes = String(formData.get("notes") ?? "").trim() || null;
  const expiresInDays = Number(formData.get("expires_in_days") ?? 3);

  const { error } = await supabase.from("segadeals_offers").insert({
    request_id: requestId,
    org_id: org.id,
    price,
    notes,
    expires_at: new Date(Date.now() + expiresInDays * 24 * 3600 * 1000).toISOString(),
    created_by: user.id,
  });

  if (error) return { error: error.message };

  await supabase.from("segadeals_requests").update({ status: "offered" }).eq("id", requestId).eq("status", "open");

  revalidatePath(`/dashboard/${orgSlug}/segadeals/${requestId}`);
  redirect(`/dashboard/${orgSlug}/segadeals/${requestId}?offered=1`);
}
