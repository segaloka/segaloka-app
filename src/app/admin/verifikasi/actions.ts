"use server";

import { createClient } from "@/lib/supabase/server";
import { requireUser, hasPlatformPermission, isPlatformAdmin } from "@/lib/auth";
import { revalidatePath } from "next/cache";

export async function verifyOrgAction(formData: FormData) {
  await requireUser();
  const orgId = String(formData.get("org_id"));
  const status = String(formData.get("status"));

  const admin = await isPlatformAdmin();
  const canVerify = admin || (await hasPlatformPermission("org.verify"));
  if (!canVerify) return;

  const supabase = await createClient();
  await supabase.from("organizations").update({ status }).eq("id", orgId);
  revalidatePath("/admin/verifikasi");
  revalidatePath(`/admin/verifikasi/${orgId}`);
  revalidatePath("/admin");
}
