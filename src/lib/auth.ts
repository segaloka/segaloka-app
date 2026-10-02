import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";

export async function getSessionUser() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  return user;
}

export async function getProfile() {
  const supabase = await createClient();
  const user = await getSessionUser();
  if (!user) return null;
  const { data } = await supabase.from("profiles").select("*").eq("id", user.id).single();
  return data;
}

// Real memberships (org + role), joined against the same tables RLS reads —
// this is live data, not a hardcoded mirror of the permission model.
export async function getMyMemberships() {
  const supabase = await createClient();
  const user = await getSessionUser();
  if (!user) return [];
  const { data } = await supabase
    .from("memberships")
    .select("id, org_id, branch_id, vendor_id, role_slug, status, roles(label, scope), organizations(name, slug, status)")
    .eq("user_id", user.id)
    .eq("status", "active");
  return data ?? [];
}

export async function getOrgBySlug(slug: string) {
  const supabase = await createClient();
  const { data } = await supabase.from("organizations").select("*").eq("slug", slug).single();
  return data;
}

// Thin wrappers around the same Postgres functions RLS policies call
// (has_permission / is_org_member / is_platform_admin / has_platform_permission).
// This keeps UI-level gating and backend enforcement using one source of truth
// instead of a second, driftable copy of the rule set. UI gating is a
// convenience only — the authoritative check is always the RLS policy itself.
export async function hasPermission(orgId: string, permissionKey: string) {
  const supabase = await createClient();
  const { data } = await supabase.rpc("has_permission", { p_org_id: orgId, p_permission_key: permissionKey });
  return Boolean(data);
}

export async function isOrgMember(orgId: string) {
  const supabase = await createClient();
  const { data } = await supabase.rpc("is_org_member", { p_org_id: orgId });
  return Boolean(data);
}

export async function isPlatformAdmin() {
  const supabase = await createClient();
  const { data } = await supabase.rpc("is_platform_admin");
  return Boolean(data);
}

export async function hasPlatformPermission(key: string) {
  const supabase = await createClient();
  const { data } = await supabase.rpc("has_platform_permission", { p_permission_key: key });
  return Boolean(data);
}

export async function requireUser(nextPath?: string) {
  const user = await getSessionUser();
  if (!user) {
    const next = nextPath && nextPath.startsWith("/") && !nextPath.startsWith("//") ? nextPath : "";
    redirect(next ? `/login?next=${encodeURIComponent(next)}` : "/login");
  }
  return user;
}

export async function requireOrgAccess(orgSlug: string) {
  const org = await getOrgBySlug(orgSlug);
  if (!org) redirect("/dashboard");
  const member = await isOrgMember(org.id);
  if (!member) redirect("/dashboard?error=forbidden");
  return org;
}

export async function requirePlatformAccess() {
  await requireUser();
  const admin = await isPlatformAdmin();
  if (!admin) redirect("/akun?error=forbidden");
}
export async function resolvePostLoginPath(): Promise<string> {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return "/login";

  const { data: platformAdmin } = await supabase.rpc("is_platform_admin");

  if (platformAdmin) {
    return "/admin";
  }

  const { data: memberships } = await supabase
    .from("memberships")
    .select("vendor_id, role_slug, organizations(slug)")
    .eq("user_id", user.id)
    .eq("status", "active");

  const activeMemberships = memberships ?? [];

  const vendorMembership = activeMemberships.find(
    (membership: any) =>
      Boolean(membership.vendor_id) ||
      String(membership.role_slug ?? "").startsWith("vendor.")
  );

  if (vendorMembership) {
    return "/vendor";
  }

  const travelMembership = activeMemberships.find(
    (membership: any) =>
      String(membership.role_slug ?? "").startsWith("travel.") &&
      Boolean(membership.organizations?.slug)
  );

  if (travelMembership?.organizations?.slug) {
    return `/dashboard/${travelMembership.organizations.slug}`;
  }

  return "/akun";
}