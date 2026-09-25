"use server";

import { createClient } from "@/lib/supabase/server";
import { getSiteUrl } from "@/lib/site";

export type FormState = { sent?: boolean; email?: string; error?: string } | null;

export async function forgotPasswordAction(_prev: FormState, formData: FormData): Promise<FormState> {
  const email = String(formData.get("email") ?? "").trim();
  if (!email) return { error: "Masukkan alamat email Anda." };

  const supabase = await createClient();
  const site = getSiteUrl();
  const { error } = await supabase.auth.resetPasswordForEmail(email, {
    redirectTo: `${site}/auth/callback?next=/reset-sandi`,
  });

  if (error) return { error: error.message };
  return { sent: true, email };
}
