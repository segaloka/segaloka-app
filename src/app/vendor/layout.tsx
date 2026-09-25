import { requireUser, getProfile, getSessionUser } from "@/lib/auth";
import { requireVendor } from "@/lib/vendor";
import { DashboardShell, type NavGroup } from "@/components/layout/DashboardShell";
import { Badge } from "@/components/ui/Badge";

const nav: NavGroup[] = [
  { group: "Vendor", items: [{ href: "/vendor", label: "Ringkasan", icon: "dashboard" }, { href: "/vendor/pesanan", label: "Pesanan Masuk", icon: "package" }] },
];

export default async function VendorLayout({ children }: { children: React.ReactNode }) {
  await requireUser();
  const vendor = await requireVendor();
  const user = await getSessionUser();
  const profile = await getProfile();

  return (
    <DashboardShell
      brandLabel={vendor.name}
      brandHref="/vendor"
      nav={nav}
      userLabel={profile?.full_name || user?.email || "Vendor"}
      userSub={user?.email ?? undefined}
      contextSwitcher={
        <div className="flex items-center justify-between gap-2 rounded-md px-2 py-1.5 text-sm">
          <span className="truncate font-semibold text-text-primary">{vendor.name}</span>
          <Badge status={vendor.status} />
        </div>
      }
    >
      {vendor.status === "pending_verification" && (
        <div className="mb-4 rounded-md border border-warning/30 bg-warning-tint px-3 py-2.5 text-xs text-warning">
          Akun vendor Anda masih <b>Menunggu Verifikasi</b> tim Segaloka.
        </div>
      )}
      {children}
    </DashboardShell>
  );
}
