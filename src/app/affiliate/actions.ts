"use server";

import { createClient } from "@/lib/supabase/server";
import { requireUser } from "@/lib/auth";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";

export type FormState = { error?: string } | null;

export async function registerAffiliateAction() {
  await requireUser();
  const supabase = await createClient();
  const { error } = await supabase.rpc("register_affiliate");
  if (error) redirect(`/affiliate?error=${encodeURIComponent(error.message)}`);
  redirect("/affiliate?onboarded=1");
}

export async function linkToTravelAction(_prev: FormState, formData: FormData): Promise<FormState> {
  await requireUser();
  const orgSlug = String(formData.get("org_slug") ?? "").trim();
  if (!orgSlug) return { error: "Masukkan slug atau nama Travel." };

  const supabase = await createClient();
  const { data, error } = await supabase.rpc("link_affiliate_to_org", { p_org_slug: orgSlug });
  if (error) return { error: error.message };

  const result = data as { ok: boolean; reason?: string };
  if (!result?.ok) {
    if (result?.reason === "org_not_found") return { error: "Travel dengan slug tersebut tidak ditemukan atau belum aktif." };
    if (result?.reason === "already_linked") return { error: "Anda sudah terhubung dengan Travel ini." };
    return { error: "Gagal menghubungkan ke Travel." };
  }

  revalidatePath("/affiliate");
  return { error: undefined };
}
