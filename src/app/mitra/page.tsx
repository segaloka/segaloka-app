import { requireUser, getProfile, getSessionUser } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import { DashboardShell, type NavGroup } from "@/components/layout/DashboardShell";
import { PageHeader } from "@/components/layout/PageHeader";
import { StatTile } from "@/components/ui/StatTile";
import { Badge } from "@/components/ui/Badge";
import { EmptyState } from "@/components/ui/EmptyState";
import { formatIDR } from "@/lib/utils";

const nav: NavGroup[] = [{ group: "Mitra", items: [{ href: "/mitra", label: "Ringkasan", icon: "dashboard" }] }];

export default async function MitraSelfPage() {
  const user = await requireUser();
  const profile = await getProfile();
  const supabase = await createClient();

  const { data: mitraRow } = await supabase.from("mitra").select("*, organizations(name, slug)").eq("user_id", user.id).maybeSingle();

  if (!mitraRow) {
    return (
      <DashboardShell brandLabel="Segaloka Mitra" brandHref="/mitra" nav={nav} userLabel={profile?.full_name || user.email || "Mitra"} userSub={user.email ?? undefined}>
        <PageHeader eyebrow="Mitra" title="Belum Terhubung" />
        <EmptyState title="Anda belum menjadi Mitra Travel manapun" description="Mitra bergabung melalui undangan langsung dari Travel. Hubungi Travel yang ingin Anda ikuti." />
      </DashboardShell>
    );
  }

  const org = mitraRow.organizations as any;
  const { data: bookings } = await supabase
    .from("bookings")
    .select("id, code, status, total_amount, created_at")
    .eq("org_id", mitraRow.org_id)
    .eq("created_by", user.id)
    .order("created_at", { ascending: false })
    .limit(10);

  return (
    <DashboardShell brandLabel="Segaloka Mitra" brandHref="/mitra" nav={nav} userLabel={profile?.full_name || user.email || "Mitra"} userSub={user.email ?? undefined}>
      <PageHeader eyebrow="Mitra" title={org?.name ?? "Mitra"} actions={<Badge status={mitraRow.status} />} />

      <div className="grid gap-4 sm:grid-cols-2">
        <StatTile label="Skema Komisi" value={mitraRow.commission_type === "percentage" ? `${mitraRow.commission_value}%` : formatIDR(mitraRow.commission_value)} />
        <StatTile label="Booking Dibuat" value={String((bookings ?? []).length)} />
      </div>

      <div className="mt-6">
        <p className="mb-3 font-display text-sm font-bold text-text-primary">Booking Anda</p>
        {!bookings || bookings.length === 0 ? (
          <EmptyState title="Belum ada booking" description="Booking yang Anda buat untuk Travel ini akan muncul di sini." />
        ) : (
          <div className="space-y-2">
            {bookings.map((b) => (
              <div key={b.id} className="flex items-center justify-between rounded-md border border-border px-3 py-2.5 text-sm">
                <span className="font-mono text-xs">{b.code}</span>
                <div className="flex items-center gap-2">
                  <span className="font-semibold text-text-primary">{formatIDR(b.total_amount)}</span>
                  <Badge status={b.status} />
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </DashboardShell>
  );
}
