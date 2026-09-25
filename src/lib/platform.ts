import { createClient } from "@/lib/supabase/server";
import { getSessionUser } from "@/lib/auth";

// Same pattern as src/lib/org.ts: a UI-convenience permission set for
// platform-scoped nav rendering, derived from the same role_permissions
// table RLS reads. Never the enforcement boundary — every server action
// still calls hasPlatformPermission()/isPlatformAdmin() (RPCs) before it
// writes anything, and RLS enforces it again regardless of the UI.
export async function getPlatformPermissionSet(): Promise<Set<string>> {
  const supabase = await createClient();
  const user = await getSessionUser();
  if (!user) return new Set();

  const { data: memberships } = await supabase
    .from("memberships")
    .select("role_slug, roles(scope)")
    .eq("user_id", user.id)
    .eq("status", "active");

  const platformSlugs = (memberships ?? []).filter((m: any) => m.roles?.scope === "platform").map((m) => m.role_slug);
  if (platformSlugs.length === 0) return new Set();

  const { data: perms } = await supabase.from("role_permissions").select("permission_key").in("role_slug", platformSlugs);
  return new Set((perms ?? []).map((p) => p.permission_key));
}
