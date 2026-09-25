"use server";

import { createClient } from "@/lib/supabase/server";
import { requireUser, hasPermission, getOrgBySlug } from "@/lib/auth";
import { slugify } from "@/lib/utils";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

export type FormState = { error?: string } | null;

export async function createPackageAction(_prev: FormState, formData: FormData): Promise<FormState> {
  const user = await requireUser();
  const orgSlug = String(formData.get("org_slug") ?? "");
  const org = await getOrgBySlug(orgSlug);
  if (!org) return { error: "Organisasi tidak ditemukan." };
  const allowed = await hasPermission(org.id, "package.manage");
  if (!allowed) return { error: "Anda tidak memiliki izin package.manage." };

  const name = String(formData.get("name") ?? "").trim();
  const type = String(formData.get("type") ?? "");
  const durationDays = Number(formData.get("duration_days") ?? 0);
  const basePrice = Number(formData.get("base_price") ?? 0);
  const description = String(formData.get("description") ?? "").trim() || null;

  if (!name) return { error: "Nama paket wajib diisi." };
  if (!["umrah", "haji", "halal_tour", "tour"].includes(type)) return { error: "Pilih tipe paket." };
  if (durationDays <= 0) return { error: "Durasi hari wajib diisi." };
  if (basePrice <= 0) return { error: "Harga wajib diisi." };

  // License-tier gate mirrors the RLS check on packages — repeated here only
  // for a friendlier inline message, never as the sole enforcement.
  if (type === "umrah" && !["PPIU", "PIHK"].includes(org.license_type)) {
    return { error: "Lisensi Travel Anda (BPW) belum mengizinkan penjualan paket Umrah. Diperlukan lisensi PPIU atau PIHK." };
  }
  if (type === "haji" && org.license_type !== "PIHK") {
    return { error: "Lisensi Travel Anda belum mengizinkan penjualan paket Haji. Diperlukan lisensi PIHK." };
  }

  const supabase = await createClient();
  const slug = `${slugify(name)}-${Math.random().toString(36).slice(2, 7)}`;
  const { data: pkg, error } = await supabase
    .from("packages")
    .insert({ org_id: org.id, name, slug, type, duration_days: durationDays, base_price: basePrice, description, created_by: user.id })
    .select("id")
    .single();

  if (error || !pkg) return { error: error?.message ?? "Gagal membuat paket." };
  redirect(`/dashboard/${orgSlug}/produk/paket/${pkg.id}?created=1`);
}

export async function updatePackageAction(_prev: FormState, formData: FormData): Promise<FormState> {
  const orgSlug = String(formData.get("org_slug") ?? "");
  const pkgId = String(formData.get("pkg_id") ?? "");
  const org = await getOrgBySlug(orgSlug);
  if (!org) return { error: "Organisasi tidak ditemukan." };
  const allowed = await hasPermission(org.id, "package.manage");
  if (!allowed) return { error: "Anda tidak memiliki izin package.manage." };

  const name = String(formData.get("name") ?? "").trim();
  const durationDays = Number(formData.get("duration_days") ?? 0);
  const basePrice = Number(formData.get("base_price") ?? 0);
  const description = String(formData.get("description") ?? "").trim() || null;
  const inclusions = String(formData.get("inclusions") ?? "").split("\n").map((s) => s.trim()).filter(Boolean);
  const exclusions = String(formData.get("exclusions") ?? "").split("\n").map((s) => s.trim()).filter(Boolean);

  if (!name) return { error: "Nama paket wajib diisi." };

  const supabase = await createClient();
  const { error } = await supabase
    .from("packages")
    .update({ name, duration_days: durationDays, base_price: basePrice, description, inclusions, exclusions })
    .eq("id", pkgId)
    .eq("org_id", org.id);

  if (error) return { error: error.message };
  revalidatePath(`/dashboard/${orgSlug}/produk/paket/${pkgId}`);
  return { error: undefined };
}

export async function togglePublishAction(formData: FormData) {
  const orgSlug = String(formData.get("org_slug"));
  const pkgId = String(formData.get("pkg_id"));
  const nextStatus = String(formData.get("next_status"));
  const org = await getOrgBySlug(orgSlug);
  if (!org) return;

  const canPublish = await hasPermission(org.id, "package.publish");
  if (!canPublish) return;
  if (org.status !== "active") return; // verified travels only — RLS enforces this too

  const supabase = await createClient();
  await supabase.from("packages").update({ status: nextStatus }).eq("id", pkgId).eq("org_id", org.id);
  revalidatePath(`/dashboard/${orgSlug}/produk/paket/${pkgId}`);
  revalidatePath(`/dashboard/${orgSlug}/produk/paket`);
}

export async function createDepartureAction(_prev: FormState, formData: FormData): Promise<FormState> {
  const orgSlug = String(formData.get("org_slug") ?? "");
  const pkgId = String(formData.get("pkg_id") ?? "");
  const org = await getOrgBySlug(orgSlug);
  if (!org) return { error: "Organisasi tidak ditemukan." };
  const allowed = await hasPermission(org.id, "package.manage");
  if (!allowed) return { error: "Anda tidak memiliki izin package.manage." };

  const departureDate = String(formData.get("departure_date") ?? "");
  const returnDate = String(formData.get("return_date") ?? "") || null;
  const quota = Number(formData.get("quota") ?? 0);

  if (!departureDate) return { error: "Tanggal keberangkatan wajib diisi." };
  if (quota <= 0) return { error: "Kuota wajib diisi." };

  const supabase = await createClient();
  const { error } = await supabase.from("departures").insert({ package_id: pkgId, departure_date: departureDate, return_date: returnDate, quota });

  if (error) return { error: error.message };
  revalidatePath(`/dashboard/${orgSlug}/produk/paket/${pkgId}`);
  return { error: undefined };
}

export async function updateDepartureStatusAction(formData: FormData) {
  const orgSlug = String(formData.get("org_slug"));
  const pkgId = String(formData.get("pkg_id"));
  const departureId = String(formData.get("departure_id"));
  const status = String(formData.get("status"));
  const org = await getOrgBySlug(orgSlug);
  if (!org) return;
  const allowed = await hasPermission(org.id, "package.manage");
  if (!allowed) return;

  const supabase = await createClient();
  await supabase.from("departures").update({ status }).eq("id", departureId);
  revalidatePath(`/dashboard/${orgSlug}/produk/paket/${pkgId}`);
}
