import { createClient } from "@/lib/supabase/server";
import { getSessionUser } from "@/lib/auth";

// UI-convenience permission set for nav rendering — derived from the same
// role_permissions table RLS reads, so it never drifts from real policy.
// This is NOT the authorization boundary: every server action still calls
// the has_permission()/is_org_member() RPCs (see src/lib/auth.ts) before it
// writes anything, and RLS enforces it again regardless of what the UI shows.
export async function getOrgPermissionSet(orgId: string): Promise<Set<string>> {
  const supabase = await createClient();
  const user = await getSessionUser();
  if (!user) return new Set();

  const { data: memberships } = await supabase
    .from("memberships")
    .select("role_slug")
    .eq("user_id", user.id)
    .eq("org_id", orgId)
    .eq("status", "active");

  const slugs = (memberships ?? []).map((m) => m.role_slug);
  if (slugs.length === 0) return new Set();

  const { data: perms } = await supabase.from("role_permissions").select("permission_key").in("role_slug", slugs);
  return new Set((perms ?? []).map((p) => p.permission_key));
}

export async function getMyRoleSlugsInOrg(orgId: string): Promise<string[]> {
  const supabase = await createClient();
  const user = await getSessionUser();
  if (!user) return [];
  const { data } = await supabase
    .from("memberships")
    .select("role_slug")
    .eq("user_id", user.id)
    .eq("org_id", orgId)
    .eq("status", "active");
  return (data ?? []).map((m) => m.role_slug);
}
