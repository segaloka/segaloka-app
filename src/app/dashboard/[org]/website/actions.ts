"use server";

import { createClient } from "@/lib/supabase/server";
import { hasPermission, getOrgBySlug } from "@/lib/auth";
import { slugify } from "@/lib/utils";
import { revalidatePath } from "next/cache";

export type FormState = { error?: string } | null;

async function ensureWebsite(orgId: string) {
  const supabase = await createClient();
  const { data: existing } = await supabase.from("websites").select("*").eq("org_id", orgId).maybeSingle();
  if (existing) return existing;
  const { data } = await supabase.from("websites").insert({ org_id: orgId, theme: {} }).select("*").single();
  return data;
}

export async function updateWebsiteStatusAction(formData: FormData) {
  const orgSlug = String(formData.get("org_slug"));
  const status = String(formData.get("status"));
  const org = await getOrgBySlug(orgSlug);
  if (!org) return;
  const allowed = await hasPermission(org.id, "website.manage");
  if (!allowed) return;
  if (status === "published" && org.status !== "active") return;

  const website = await ensureWebsite(org.id);
  if (!website) return;
  const supabase = await createClient();
  await supabase
    .from("websites")
    .update({ status, published_at: status === "published" ? new Date().toISOString() : website.published_at })
    .eq("id", website.id);
  revalidatePath(`/dashboard/${orgSlug}/website`);
}

export async function savePageAction(_prev: FormState, formData: FormData): Promise<FormState> {
  const orgSlug = String(formData.get("org_slug") ?? "");
  const org = await getOrgBySlug(orgSlug);
  if (!org) return { error: "Organisasi tidak ditemukan." };
  const allowed = await hasPermission(org.id, "website.manage");
  if (!allowed) return { error: "Anda tidak memiliki izin website.manage." };

  const website = await ensureWebsite(org.id);
  if (!website) return { error: "Gagal menyiapkan website." };

  const title = String(formData.get("title") ?? "").trim();
  const body = String(formData.get("body") ?? "").trim();
  const pageId = String(formData.get("page_id") ?? "") || null;
  if (!title) return { error: "Judul halaman wajib diisi." };

  const supabase = await createClient();
  if (pageId) {
    const { error } = await supabase.from("website_pages").update({ title, sections: { body } }).eq("id", pageId).eq("website_id", website.id);
    if (error) return { error: error.message };
  } else {
    const slug = slugify(title);
    const { error } = await supabase.from("website_pages").insert({ website_id: website.id, slug, title, sections: { body }, status: "draft" });
    if (error) return { error: error.message };
  }
  revalidatePath(`/dashboard/${orgSlug}/website`);
  return { error: undefined };
}

export async function togglePageStatusAction(formData: FormData) {
  const orgSlug = String(formData.get("org_slug"));
  const pageId = String(formData.get("page_id"));
  const status = String(formData.get("status"));
  const org = await getOrgBySlug(orgSlug);
  if (!org) return;
  const allowed = await hasPermission(org.id, "website.manage");
  if (!allowed) return;

  const supabase = await createClient();
  await supabase.from("website_pages").update({ status }).eq("id", pageId);
  revalidatePath(`/dashboard/${orgSlug}/website`);
}
