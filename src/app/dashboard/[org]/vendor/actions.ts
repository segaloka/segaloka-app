"use server";

import { createClient } from "@/lib/supabase/server";
import { requireUser, hasPermission, getOrgBySlug } from "@/lib/auth";
import { revalidatePath } from "next/cache";

export type FormState = { error?: string } | null;

export async function linkVendorAction(_prev: FormState, formData: FormData): Promise<FormState> {
  const orgSlug = String(formData.get("org_slug") ?? "");
  const org = await getOrgBySlug(orgSlug);
  if (!org) return { error: "Organisasi tidak ditemukan." };
  const allowed = await hasPermission(org.id, "vendor.manage");
  if (!allowed) return { error: "Anda tidak memiliki izin vendor.manage." };

  const vendorId = String(formData.get("vendor_id") ?? "");
  const feeType = String(formData.get("fee_type") ?? "percentage");
  const feeValue = Number(formData.get("fee_value") ?? 0);
  if (!vendorId) return { error: "Pilih vendor terlebih dahulu." };

  const supabase = await createClient();
  const { error } = await supabase.from("vendor_org_links").insert({ vendor_id: vendorId, org_id: org.id, fee_type: feeType, fee_value: feeValue, status: "pending" });
  if (error) return { error: error.message };
  revalidatePath(`/dashboard/${orgSlug}/vendor`);
  return { error: undefined };
}

export async function createVendorOrderAction(_prev: FormState, formData: FormData): Promise<FormState> {
  const user = await requireUser();
  const orgSlug = String(formData.get("org_slug") ?? "");
  const org = await getOrgBySlug(orgSlug);
  if (!org) return { error: "Organisasi tidak ditemukan." };
  const allowed = await hasPermission(org.id, "vendor.manage");
  if (!allowed) return { error: "Anda tidak memiliki izin vendor.manage." };

  const vendorId = String(formData.get("vendor_id") ?? "");
  const item = String(formData.get("item") ?? "").trim();
  const amount = Number(formData.get("amount") ?? 0);
  if (!vendorId || !item || amount <= 0) return { error: "Lengkapi vendor, item pesanan, dan jumlah." };

  const supabase = await createClient();
  const { error } = await supabase.from("vendor_orders").insert({ vendor_id: vendorId, org_id: org.id, item, amount, created_by: user.id });
  if (error) return { error: error.message };
  revalidatePath(`/dashboard/${orgSlug}/vendor`);
  return { error: undefined };
}
