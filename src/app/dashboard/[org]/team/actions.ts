"use server";

import { createClient } from "@/lib/supabase/server";
import { hasPermission, getOrgBySlug } from "@/lib/auth";
import { revalidatePath } from "next/cache";

export type FormState = { error?: string; success?: string } | null;

const TRAVEL_ROLES = ["travel.admin", "travel.finance", "travel.sales", "travel.operations", "travel.branch_manager", "travel.staff"];

export async function inviteStaffAction(_prev: FormState, formData: FormData): Promise<FormState> {
  const orgSlug = String(formData.get("org_slug") ?? "");
  const org = await getOrgBySlug(orgSlug);
  if (!org) return { error: "Organisasi tidak ditemukan." };
  const allowed = await hasPermission(org.id, "team.manage");
  if (!allowed) return { error: "Anda tidak memiliki izin team.manage." };

  const email = String(formData.get("email") ?? "").trim().toLowerCase();
  const roleSlug = String(formData.get("role_slug") ?? "");
  const branchId = String(formData.get("branch_id") ?? "") || null;

  if (!email) return { error: "Email wajib diisi." };
  if (!TRAVEL_ROLES.includes(roleSlug)) return { error: "Pilih role yang valid." };

  const supabase = await createClient();
  const { data, error } = await supabase.rpc("invite_staff_by_email", {
    p_org_id: org.id,
    p_email: email,
    p_role_slug: roleSlug,
    p_branch_id: branchId,
  });

  if (error) return { error: error.message };
  const result = data as { ok: boolean; reason?: string };
  if (!result?.ok) {
    if (result?.reason === "user_not_found") {
      return { error: `Belum ada akun Segaloka dengan email ${email}. Minta orang tersebut mendaftar di /register terlebih dahulu, lalu undang kembali.` };
    }
    if (result?.reason === "already_member") {
      return { error: "Orang ini sudah menjadi staff di organisasi Anda." };
    }
    return { error: "Gagal menambahkan staff." };
  }

  revalidatePath(`/dashboard/${orgSlug}/team`);
  return { success: `${email} berhasil ditambahkan sebagai staff.` };
}

export async function updateStaffStatusAction(formData: FormData) {
  const orgSlug = String(formData.get("org_slug"));
  const membershipId = String(formData.get("membership_id"));
  const status = String(formData.get("status"));
  const org = await getOrgBySlug(orgSlug);
  if (!org) return;
  const allowed = await hasPermission(org.id, "team.manage");
  if (!allowed) return;

  const supabase = await createClient();
  await supabase.from("memberships").update({ status }).eq("id", membershipId).eq("org_id", org.id);
  revalidatePath(`/dashboard/${orgSlug}/team`);
}
