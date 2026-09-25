"use server";

import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { getSiteUrl } from "@/lib/site";

export type FormState = { error?: string; needsConfirmation?: boolean; email?: string } | null;

export async function registerAction(_prev: FormState, formData: FormData): Promise<FormState> {
  const fullName = String(formData.get("full_name") ?? "").trim();
  const email = String(formData.get("email") ?? "").trim();
  const password = String(formData.get("password") ?? "");
  const passwordConfirm = String(formData.get("password_confirm") ?? "");

  if (!fullName || !email || !password) return { error: "Semua kolom wajib diisi." };
  if (password.length < 8) return { error: "Kata sandi minimal 8 karakter." };
  if (password !== passwordConfirm) return { error: "Konfirmasi kata sandi tidak cocok." };

  const supabase = await createClient();
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: { full_name: fullName },
      emailRedirectTo: `${getSiteUrl()}/auth/callback?next=/akun`,
    },
  });

  if (error) {
    return { error: error.message.includes("already registered") ? "Email sudah terdaftar." : error.message };
  }

  if (!data.session) {
    return { needsConfirmation: true, email };
  }

  redirect("/akun");
}
