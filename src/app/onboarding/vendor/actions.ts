"use server";

import { createClient } from "@/lib/supabase/server";
import { requireUser } from "@/lib/auth";
import { redirect } from "next/navigation";

export type FormState = { error?: string } | null;

export async function registerVendorAction(_prev: FormState, formData: FormData): Promise<FormState> {
  await requireUser();
  const name = String(formData.get("name") ?? "").trim();
  const legalName = String(formData.get("legal_name") ?? "").trim();
  const categoryCode = String(formData.get("category_code") ?? "").trim();
  const contactEmail = String(formData.get("contact_email") ?? "").trim();
  const contactPhone = String(formData.get("contact_phone") ?? "").trim();

  if (!name) return { error: "Nama vendor wajib diisi." };
  if (!categoryCode) return { error: "Pilih kategori vendor." };

  const supabase = await createClient();
  const { error } = await supabase.rpc("register_vendor", {
    p_name: name,
    p_legal_name: legalName || null,
    p_category_code: categoryCode,
    p_contact_email: contactEmail || null,
    p_contact_phone: contactPhone || null,
  });

  if (error) return { error: error.message };
  redirect("/vendor?onboarded=1");
}
