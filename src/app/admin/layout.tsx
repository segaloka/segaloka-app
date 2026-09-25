import { requireUser, isPlatformAdmin, getProfile, getSessionUser } from "@/lib/auth";
import { getPlatformPermissionSet } from "@/lib/platform";
import { redirect } from "next/navigation";
import { DashboardShell, type NavGroup } from "@/components/layout/DashboardShell";

function buildAdminNav(perms: Set<string>, isAdmin: boolean): NavGroup[] {
  const groups: NavGroup[] = [{ group: "Overview", items: [{ href: "/admin", label: "Ringkasan Platform", icon: "dashboard" }] }];

  const verifyItems = [];
  if (isAdmin || perms.has("org.verify")) verifyItems.push({ href: "/admin/verifikasi", label: "Verifikasi Travel", icon: "shield" as const });
  if (isAdmin || perms.has("vendor.verify")) verifyItems.push({ href: "/admin/vendor", label: "Verifikasi Vendor", icon: "briefcase" as const });
  if (verifyItems.length) groups.push({ group: "Verifikasi", items: verifyItems });

  if (isAdmin || perms.has("subscription.manage")) {
    groups.push({ group: "Subscription", items: [{ href: "/admin/subscription", label: "Paket & Langganan", icon: "wallet" }] });
  }

  if (isAdmin || perms.has("finance.oversight")) {
    groups.push({ group: "Finance", items: [{ href: "/admin/finance", label: "Oversight Keuangan", icon: "chart" }] });
  }

  if (isAdmin || perms.has("audit.read")) {
    groups.push({ group: "Keamanan", items: [{ href: "/admin/audit", label: "Audit Log", icon: "doc" }] });
  }

  if (isAdmin) {
    groups.push({ group: "Konfigurasi", items: [{ href: "/admin/pengaturan", label: "Pengaturan Platform", icon: "settings" }] });
  }

  return groups;
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
      brandLabel="Segaloka Admin"
      brandHref="/admin"
      nav={nav}
      userLabel={profile?.full_name || user?.email || "Admin"}
      userSub={user?.email ?? undefined}
    >
      {children}
    </DashboardShell>
  );
}
