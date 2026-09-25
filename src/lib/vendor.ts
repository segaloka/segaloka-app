import { createClient } from "@/lib/supabase/server";
import { getSessionUser } from "@/lib/auth";
import { redirect } from "next/navigation";

export async function getMyVendor() {
  const supabase = await createClient();
  const user = await getSessionUser();
  if (!user) return null;
  const { data: membership } = await supabase
    .from("memberships")
    .select("vendor_id, role_slug, vendors(*)")
    .eq("user_id", user.id)
    .not("vendor_id", "is", null)
    .eq("status", "active")
    .maybeSingle();
  if (!membership) return null;
  return membership.vendors as any;
}

export async function requireVendor() {
  const vendor = await getMyVendor();
  if (!vendor) redirect("/onboarding/vendor");
  return vendor;
}
