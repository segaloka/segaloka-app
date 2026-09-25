"use server";

import { createClient } from "@/lib/supabase/server";
import { hasPermission, getOrgBySlug } from "@/lib/auth";
import { revalidatePath } from "next/cache";

export type FormState = { error?: string; success?: string } | null;

export async function inviteMitraAction(_prev: FormState, formData: FormData): Promise<FormState> {
  const orgSlug = String(formData.get("org_slug") ?? "");
  const org = await getOrgBySlug(orgSlug);
  if (!org) return { error: "Organisasi tidak ditemukan." };
  const allowed = await hasPermission(org.id, "mitra.manage");
  if (!allowed) return { error: "Anda tidak memiliki izin mitra.manage." };

  const email = String(formData.get("email") ?? "").trim().toLowerCase();
  const commissionType = String(formData.get("commission_type") ?? "percentage");
  const commissionValue = Number(formData.get("commission_value") ?? 0);
  if (!email) return { error: "Email wajib diisi." };

  const supabase = await createClient();
  const { data, error } = await supabase.rpc("invite_mitra_by_email", {
    p_org_id: org.id,
    p_email: email,
    p_commission_type: commissionType,
    p_commission_value: commissionValue,
  });

  if (error) return { error: error.message };
  const result = data as { ok: boolean; reason?: string };
  if (!result?.ok) {
    if (result?.reason === "user_not_found") return { error: `Belum ada akun Segaloka dengan email ${email}. Minta mereka mendaftar di /register terlebih dahulu.` };
    if (result?.reason === "already_mitra") return { error: "Orang ini sudah menjadi Mitra." };
    return { error: "Gagal mengundang Mitra." };
  }

  revalidatePath(`/dashboard/${orgSlug}/mitra`);
  return { success: `${email} berhasil ditambahkan sebagai Mitra.` };
}
