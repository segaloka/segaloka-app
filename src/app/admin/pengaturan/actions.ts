"use server";

import { createClient } from "@/lib/supabase/server";
import { requireUser, isPlatformAdmin } from "@/lib/auth";
import { revalidatePath } from "next/cache";

export type FormState = { error?: string } | null;

export async function upsertSettingAction(_prev: FormState, formData: FormData): Promise<FormState> {
  const user = await requireUser();
  const admin = await isPlatformAdmin();
  if (!admin) return { error: "Hanya Super Admin yang dapat mengubah pengaturan platform." };

  const key = String(formData.get("key") ?? "").trim();
  const description = String(formData.get("description") ?? "").trim() || null;
  const rawValue = String(formData.get("value") ?? "").trim();

  if (!key) return { error: "Key wajib diisi." };
  if (!rawValue) return { error: "Value wajib diisi." };

  let parsed: unknown;
  try {
    parsed = JSON.parse(rawValue);
  } catch {
    return { error: "Value harus berupa JSON valid, cth: 5000000 atau {\"percent\": 2.5} atau \"VIA_SEGALOKA\"." };
  }

  const supabase = await createClient();
  const { error } = await supabase
    .from("platform_settings")
    .upsert({ key, value: parsed as any, description, updated_by: user.id, updated_at: new Date().toISOString() });

  if (error) return { error: error.message };
  revalidatePath("/admin/pengaturan");
  return { error: undefined };
}
