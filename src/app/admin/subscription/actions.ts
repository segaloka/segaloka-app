"use server";

import { createClient } from "@/lib/supabase/server";
import { requireUser, hasPlatformPermission, isPlatformAdmin } from "@/lib/auth";
import { slugify } from "@/lib/utils";
import { revalidatePath } from "next/cache";

export type FormState = { error?: string } | null;

async function canManageSubscription() {
  const admin = await isPlatformAdmin();
  return admin || (await hasPlatformPermission("subscription.manage"));
}

export async function createPlanAction(_prev: FormState, formData: FormData): Promise<FormState> {
  await requireUser();
  if (!(await canManageSubscription())) return { error: "Anda tidak memiliki izin subscription.manage." };

  const name = String(formData.get("name") ?? "").trim();
  const priceMonthly = Number(formData.get("price_monthly") ?? 0);
  const priceYearly = Number(formData.get("price_yearly") ?? 0);
  const branchLimit = Number(formData.get("branch_limit") ?? 1);
  const storageGb = Number(formData.get("storage_gb") ?? 5);
  const trialDays = Number(formData.get("trial_days") ?? 14);

  if (!name) return { error: "Nama paket wajib diisi." };

  const supabase = await createClient();
  const { error } = await supabase.from("subscription_plans").insert({
    code: slugify(name),
    name,
    price_monthly: priceMonthly,
    price_yearly: priceYearly,
    branch_limit: branchLimit,
    storage_gb: storageGb,
    trial_days: trialDays,
    modules: {},
  });

  if (error) return { error: error.message };
  revalidatePath("/admin/subscription");
  return { error: undefined };
}

export async function togglePlanActiveAction(formData: FormData) {
  await requireUser();
  if (!(await canManageSubscription())) return;
  const planId = String(formData.get("plan_id"));
  const isActive = formData.get("is_active") === "true";

  const supabase = await createClient();
  await supabase.from("subscription_plans").update({ is_active: !isActive }).eq("id", planId);
  revalidatePath("/admin/subscription");
}

export async function assignSubscriptionAction(formData: FormData) {
  await requireUser();
  if (!(await canManageSubscription())) return;
  const orgId = String(formData.get("org_id"));
  const planId = String(formData.get("plan_id"));

  const supabase = await createClient();
  const { data: existing } = await supabase.from("subscriptions").select("id").eq("org_id", orgId).maybeSingle();
  if (existing) {
    await supabase.from("subscriptions").update({ plan_id: planId, status: "active" }).eq("id", existing.id);
  } else {
    await supabase.from("subscriptions").insert({ org_id: orgId, plan_id: planId, status: "active", current_period_start: new Date().toISOString() });
  }
  revalidatePath("/admin/subscription");
}
