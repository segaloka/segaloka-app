import { requireUser, isPlatformAdmin, getProfile, getSessionUser } from "@/lib/auth";
import { getPlatformPermissionSet } from "@/lib/platform";
import { redirect } from "next/navigation";
import { DashboardShell, type NavGroup, type NavItem } from "@/components/layout/DashboardShell";
import { ADMIN_NAV, type AdminNavLeaf } from "@/lib/admin-nav";

// Platform permissions that unlock individual menu entries for non-super-admin
// staff. Everything not listed here is Super-Admin only. UI convenience only —
// RLS and the server actions remain the enforcement boundary.
const LEAF_PERMISSION: Record<string, string> = {
  travel_legal: "org.verify",
  vendor_verif: "vendor.verify",
  plan: "subscription.manage",
  sub: "subscription.manage",
  travel_subs: "subscription.manage",
  fin_ov: "finance.oversight",
  audit: "audit.read",
};

function buildAdminNav(perms: Set<string>, isAdmin: boolean): NavGroup[] {
  const allowed = (l: AdminNavLeaf) => isAdmin || (LEAF_PERMISSION[l.id] ? perms.has(LEAF_PERMISSION[l.id]) : false);
  const toItem = (l: AdminNavLeaf): NavItem => ({ href: l.href, label: l.label });

  return ADMIN_NAV.map((g) => ({
    group: g.label,
    icon: g.icon,
    items: g.items
      .map((it): NavItem | null => {
        if (it.children) {
          const kids = it.children.filter(allowed).map(toItem);
          return kids.length ? { href: kids[0].href, label: it.label, children: kids } : null;
        }
        return allowed(it) ? toItem(it) : null;
      })
      .filter((x): x is NavItem => x !== null),
  })).filter((g) => g.items.length > 0);
}

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  await requireUser();
  const isAdmin = await isPlatformAdmin();
  const perms = await getPlatformPermissionSet();

  if (!isAdmin && perms.size === 0) redirect("/akun?error=forbidden");

  const user = await getSessionUser();
  const profile = await getProfile();
  const nav = buildAdminNav(perms, isAdmin);

  return (
    <DashboardShell
      brandLabel="Segaloka"
      brandSub="Control Center · Super Admin"
      brandHref="/admin"
      nav={nav}
      collapsible
      searchable
      userLabel={profile?.full_name || user?.email || "Admin"}
      userSub={user?.email ?? undefined}
    >
      {children}
    </DashboardShell>
  );
}
