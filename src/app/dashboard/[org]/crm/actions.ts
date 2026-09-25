"use server";

import { createClient } from "@/lib/supabase/server";
import { requireUser, hasPermission, getOrgBySlug } from "@/lib/auth";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

export type FormState = { error?: string } | null;

export async function createLeadAction(_prev: FormState, formData: FormData): Promise<FormState> {
  const user = await requireUser();
  const orgSlug = String(formData.get("org_slug") ?? "");
  const org = await getOrgBySlug(orgSlug);
  if (!org) return { error: "Organisasi tidak ditemukan." };
  const allowed = await hasPermission(org.id, "crm.manage");
  if (!allowed) return { error: "Anda tidak memiliki izin crm.manage." };

  const name = String(formData.get("name") ?? "").trim();
  if (!name) return { error: "Nama lead wajib diisi." };

  const supabase = await createClient();
  const { data: lead, error } = await supabase
    .from("leads")
    .insert({
      org_id: org.id,
      name,
      phone: String(formData.get("phone") ?? "").trim() || null,
      email: String(formData.get("email") ?? "").trim() || null,
      source: String(formData.get("source") ?? "manual"),
      interest_type: String(formData.get("interest_type") ?? "") || null,
      created_by: user.id,
    })
    .select("id")
    .single();

  if (error || !lead) return { error: error?.message ?? "Gagal membuat lead." };
  redirect(`/dashboard/${orgSlug}/crm/${lead.id}?created=1`);
}

export async function updateLeadStageAction(formData: FormData) {
  const orgSlug = String(formData.get("org_slug"));
  const leadId = String(formData.get("lead_id"));
  const stage = String(formData.get("stage"));
  const org = await getOrgBySlug(orgSlug);
  if (!org) return;
  const allowed = await hasPermission(org.id, "crm.manage");
  if (!allowed) return;

  const supabase = await createClient();
  await supabase.from("leads").update({ stage }).eq("id", leadId).eq("org_id", org.id);
  await supabase.from("lead_activities").insert({ lead_id: leadId, type: "stage_change", body: `Stage diubah menjadi ${stage}` });
  revalidatePath(`/dashboard/${orgSlug}/crm/${leadId}`);
  revalidatePath(`/dashboard/${orgSlug}/crm`);
}

export async function addLeadActivityAction(_prev: FormState, formData: FormData): Promise<FormState> {
  const user = await requireUser();
  const orgSlug = String(formData.get("org_slug") ?? "");
  const leadId = String(formData.get("lead_id") ?? "");
  const org = await getOrgBySlug(orgSlug);
  if (!org) return { error: "Organisasi tidak ditemukan." };
  const allowed = await hasPermission(org.id, "crm.manage");
  if (!allowed) return { error: "Anda tidak memiliki izin crm.manage." };

  const type = String(formData.get("type") ?? "note");
  const body = String(formData.get("body") ?? "").trim();
  if (!body) return { error: "Isi catatan tidak boleh kosong." };

  const supabase = await createClient();
  const { error } = await supabase.from("lead_activities").insert({ lead_id: leadId, type, body, created_by: user.id });
  if (error) return { error: error.message };
  revalidatePath(`/dashboard/${orgSlug}/crm/${leadId}`);
  return { error: undefined };
}
