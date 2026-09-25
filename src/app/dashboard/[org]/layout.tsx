import { requireOrgAccess } from "@/lib/auth";
import { getOrgPermissionSet } from "@/lib/org";
import { getProfile, getSessionUser } from "@/lib/auth";
import { DashboardShell, type NavGroup } from "@/components/layout/DashboardShell";
import { Badge } from "@/components/ui/Badge";
import Link from "next/link";

function buildNav(orgSlug: string, perms: Set<string>): NavGroup[] {
  const base = `/dashboard/${orgSlug}`;
  const groups: NavGroup[] = [
    { group: "Overview", items: [{ href: base, label: "Ringkasan", icon: "dashboard" }] },
  ];

  const salesItems = [];
  if (perms.has("booking.create") || perms.has("booking.manage")) salesItems.push({ href: `${base}/booking`, label: "Booking", icon: "package" as const });
  if (perms.has("crm.manage")) salesItems.push({ href: `${base}/crm`, label: "CRM / Leads", icon: "crm" as const });
  if (salesItems.length) groups.push({ group: "Sales & CRM", items: salesItems });

  if (perms.has("package.manage")) {
    groups.push({
      group: "Produk",
      items: [{ href: `${base}/produk/paket`, label: "Paket & Keberangkatan", icon: "plane" }],
    });
  }

  if (perms.has("operations.manage")) {
    groups.push({
      group: "Operasional",
      items: [
        { href: `${base}/operasional/manifest`, label: "Manifest", icon: "doc" },
        { href: `${base}/operasional/roomlist`, label: "Room List", icon: "bed" },
      ],
    });
  }

  if (perms.has("segadeals.respond")) {
    groups.push({ group: "SegaDeals", items: [{ href: `${base}/segadeals`, label: "Permintaan Masuk", icon: "handshake" }] });
  }

  const ecosystemItems = [];
  if (perms.has("vendor.manage")) ecosystemItems.push({ href: `${base}/vendor`, label: "Vendor", icon: "briefcase" as const });
  if (perms.has("affiliate.manage")) ecosystemItems.push({ href: `${base}/affiliate`, label: "Affiliate", icon: "route" as const });
  if (perms.has("mitra.manage")) ecosystemItems.push({ href: `${base}/mitra`, label: "Mitra", icon: "users" as const });
  if (ecosystemItems.length) groups.push({ group: "Ekosistem", items: ecosystemItems });

  if (perms.has("finance.read")) {
    groups.push({ group: "Finance", items: [{ href: `${base}/finance`, label: "Keuangan & Ledger", icon: "wallet" }] });
  }

  if (perms.has("team.manage")) {
    groups.push({ group: "Tim", items: [{ href: `${base}/team`, label: "Staff & Role", icon: "shield" }] });
  }

  if (perms.has("website.manage")) {
    groups.push({ group: "Website", items: [{ href: `${base}/website`, label: "Website Travel", icon: "globe" }] });
  }

  groups.push({ group: "Analitik", items: [{ href: `${base}/analytics`, label: "Analitik", icon: "chart" }] });

  const settingsItems = [];
  if (perms.has("org.manage") || perms.has("settings.manage")) settingsItems.push({ href: `${base}/settings`, label: "Profil Organisasi", icon: "building" as const });
  if (perms.has("branch.manage")) settingsItems.push({ href: `${base}/settings/cabang`, label: "Cabang", icon: "building" as const });
  if (settingsItems.length) groups.push({ group: "Pengaturan", items: settingsItems });

  return groups;
}

export default async function TravelDashboardLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: { org: string };
}) {
  const org = await requireOrgAccess(params.org);
  const perms = await getOrgPermissionSet(org.id);
  const user = await getSessionUser();
  const profile = await getProfile();
  const nav = buildNav(org.slug, perms);

  return (
    <DashboardShell
      brandLabel={org.name}
      brandHref={`/dashboard/${org.slug}`}
      nav={nav}
      userLabel={profile?.full_name || user?.email || "Staff"}
      userSub={user?.email ?? undefined}
      contextSwitcher={
        <Link href={`/dashboard/${org.slug}/settings`} className="flex items-center justify-between gap-2 rounded-md px-2 py-1.5 text-sm hover:bg-bg">
          <span className="truncate font-semibold text-text-primary">{org.name}</span>
          <Badge status={org.status} />
        </Link>
      }
    >
      {org.status === "pending_verification" && (
        <div className="mb-4 rounded-md border border-warning/30 bg-warning-tint px-3 py-2.5 text-xs text-warning">
          Akun Travel Anda masih <b>Menunggu Verifikasi</b> Super Admin Segaloka. Sebagian fitur (publish paket, penarikan dana) baru aktif setelah legalitas terverifikasi.
        </div>
      )}
      {children}
    </DashboardShell>
  );
}
