"use server";

import { createClient } from "@/lib/supabase/server";
import { requireUser, hasPlatformPermission, isPlatformAdmin } from "@/lib/auth";
import { revalidatePath } from "next/cache";

export async function verifyVendorAction(formData: FormData) {
  await requireUser();
  const vendorId = String(formData.get("vendor_id"));
  const status = String(formData.get("status"));

  const admin = await isPlatformAdmin();
  const canVerify = admin || (await hasPlatformPermission("vendor.verify"));
  if (!canVerify) return;

  const supabase = await createClient();
  await supabase.from("vendors").update({ status }).eq("id", vendorId);
  revalidatePath("/admin/vendor");
  revalidatePath("/admin");
}
