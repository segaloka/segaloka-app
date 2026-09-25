"use server";

import { createClient } from "@/lib/supabase/server";
import { hasPermission, getOrgBySlug } from "@/lib/auth";
import { revalidatePath } from "next/cache";

export type FormState = { error?: string } | null;

export async function updateOrgProfileAction(_prev: FormState, formData: FormData): Promise<FormState> {
  const orgSlug = String(formData.get("org_slug") ?? "");
  const org = await getOrgBySlug(orgSlug);
  if (!org) return { error: "Organisasi tidak ditemukan." };
  const allowed = await hasPermission(org.id, "org.manage");
  if (!allowed) return { error: "Anda tidak memiliki izin org.manage." };

  const name = String(formData.get("name") ?? "").trim();
  const supportEmail = String(formData.get("support_email") ?? "").trim() || null;
  const supportPhone = String(formData.get("support_phone") ?? "").trim() || null;
  const address = String(formData.get("address") ?? "").trim() || null;
  if (!name) return { error: "Nama Travel wajib diisi." };

  const supabase = await createClient();
  const { error } = await supabase.from("organizations").update({ name, support_email: supportEmail, support_phone: supportPhone, address }).eq("id", org.id);
  if (error) return { error: error.message };
  revalidatePath(`/dashboard/${orgSlug}/settings`);
  return { error: undefined };
}

export async function updateBankInfoAction(_prev: FormState, formData: FormData): Promise<FormState> {
  const orgSlug = String(formData.get("org_slug") ?? "");
  const org = await getOrgBySlug(orgSlug);
  if (!org) return { error: "Organisasi tidak ditemukan." };
  const allowed = await hasPermission(org.id, "settings.manage");
  if (!allowed) return { error: "Anda tidak memiliki izin settings.manage." };

  const bankName = String(formData.get("bank_name") ?? "").trim();
  const accountNumber = String(formData.get("account_number") ?? "").trim();
  const accountName = String(formData.get("account_name") ?? "").trim();
  if (!bankName || !accountNumber || !accountName) return { error: "Lengkapi seluruh data rekening." };

  const supabase = await createClient();
  const { error } = await supabase
    .from("organizations")
    .update({ bank_info: { bank_name: bankName, account_number: accountNumber, account_name: accountName } })
    .eq("id", org.id);
  if (error) return { error: error.message };
  revalidatePath(`/dashboard/${orgSlug}/settings`);
  return { error: undefined };
}
