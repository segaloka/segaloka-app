"use server";

import { createClient } from "@/lib/supabase/server";
import { hasPermission, getOrgBySlug } from "@/lib/auth";
import { revalidatePath } from "next/cache";

export type FormState = { error?: string } | null;

export async function createBranchAction(_prev: FormState, formData: FormData): Promise<FormState> {
  const orgSlug = String(formData.get("org_slug") ?? "");
  const org = await getOrgBySlug(orgSlug);
  if (!org) return { error: "Organisasi tidak ditemukan." };
  const allowed = await hasPermission(org.id, "branch.manage");
  if (!allowed) return { error: "Anda tidak memiliki izin branch.manage." };

  const supabase = await createClient();

  const { data: subscription } = await supabase
    .from("subscriptions")
    .select("branch_limit_override, subscription_plans(branch_limit)")
    .eq("org_id", org.id)
    .maybeSingle();
  const { count: currentBranches } = await supabase.from("branches").select("id", { count: "exact", head: true }).eq("org_id", org.id);

  const limit = subscription?.branch_limit_override ?? (subscription?.subscription_plans as any)?.branch_limit ?? 1;
  if ((currentBranches ?? 0) >= limit) {
    return { error: `Batas jumlah cabang untuk paket langganan Anda adalah ${limit}. Upgrade paket untuk menambah cabang.` };
  }

  const name = String(formData.get("name") ?? "").trim();
  if (!name) return { error: "Nama cabang wajib diisi." };

  const { error } = await supabase.from("branches").insert({
    org_id: org.id,
    name,
    city: String(formData.get("city") ?? "").trim() || null,
    address: String(formData.get("address") ?? "").trim() || null,
    phone: String(formData.get("phone") ?? "").trim() || null,
    pic_name: String(formData.get("pic_name") ?? "").trim() || null,
    is_hq: (currentBranches ?? 0) === 0,
  });

  if (error) return { error: error.message };
  revalidatePath(`/dashboard/${orgSlug}/settings/cabang`);
  return { error: undefined };
}

export async function toggleBranchStatusAction(formData: FormData) {
  const orgSlug = String(formData.get("org_slug"));
  const branchId = String(formData.get("branch_id"));
  const status = String(formData.get("status"));
  const org = await getOrgBySlug(orgSlug);
  if (!org) return;
  const allowed = await hasPermission(org.id, "branch.manage");
  if (!allowed) return;

  const supabase = await createClient();
  await supabase.from("branches").update({ status }).eq("id", branchId).eq("org_id", org.id);
  revalidatePath(`/dashboard/${orgSlug}/settings/cabang`);
}
