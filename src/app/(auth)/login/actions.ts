"use server";

import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { safeNextPath } from "@/lib/site";
import { resolvePostLoginPath } from "@/lib/auth";

export type FormState = { error?: string } | null;

export async function loginAction(_prev: FormState, formData: FormData): Promise<FormState> {
  const email = String(formData.get("email") ?? "").trim();
  const password = String(formData.get("password") ?? "");
  const rawNext = String(formData.get("next") ?? "");
  const next = safeNextPath(rawNext);

  if (!email || !password) return { error: "Email dan kata sandi wajib diisi." };

  const supabase = await createClient();
  const { error } = await supabase.auth.signInWithPassword({ email, password });

  if (error) {
    return { error: error.message === "Invalid login credentials" ? "Email atau kata sandi salah." : error.message };
  }

  const destination =
    rawNext && next !== "/akun"
      ? next
      : await resolvePostLoginPath();

  redirect(destination);
}
