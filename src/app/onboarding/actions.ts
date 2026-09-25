"use server";

import { createClient } from "@/lib/supabase/server";
import { requireUser } from "@/lib/auth";
import { redirect } from "next/navigation";

export type FormState = { error?: string } | null;

export async function createOrganizationAction(_prev: FormState, formData: FormData): Promise<FormState> {
  await requireUser();
  const name = String(formData.get("name") ?? "").trim();
  const legalName = String(formData.get("legal_name") ?? "").trim();
  const licenseType = String(formData.get("license_type") ?? "");

  if (!name || !legalName) return { error: "Nama Travel dan nama badan hukum wajib diisi." };
  if (!["BPW", "PPIU", "PIHK"].includes(licenseType)) return { error: "Pilih jenis lisensi yang valid." };

  const supabase = await createClient();
  const { data: orgId, error } = await supabase.rpc("create_organization", {
    p_name: name,
    p_legal_name: legalName,
    p_license_type: licenseType,
  });

  if (error) return { error: error.message };

  const { data: org } = await supabase.from("organizations").select("slug").eq("id", orgId).single();
  redirect(`/dashboard/${org?.slug}?onboarded=1`);
}
