import { requireUser, getProfile, getSessionUser } from "@/lib/auth";
import { getMyAffiliate } from "@/lib/affiliate";
import { createClient } from "@/lib/supabase/server";
import { DashboardShell, type NavGroup } from "@/components/layout/DashboardShell";
import { PageHeader } from "@/components/layout/PageHeader";
import { StatTile } from "@/components/ui/StatTile";
import { Badge } from "@/components/ui/Badge";
import { EmptyState } from "@/components/ui/EmptyState";
import { formatIDR } from "@/lib/utils";
import { LinkTravelForm } from "./LinkTravelForm";
import { registerAffiliateAction } from "./actions";

const nav: NavGroup[] = [{ group: "Affiliate", items: [{ href: "/affiliate", label: "Ringkasan", icon: "dashboard" }] }];

export default async function AffiliatePage() {
  const user = await requireUser();
  const affiliate = await getMyAffiliate();
  const profile = await getProfile();

  if (!affiliate) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-bg px-4 py-10">
        <div className="w-full max-w-md rounded-xl border border-border bg-surface p-8 text-center shadow-card">
          <h1 className="font-display text-xl font-bold text-text-primary">Bergabung sebagai Affiliate</h1>
          <p className="mt-2 text-sm text-text-secondary">Promosikan paket dari berbagai Travel di Segaloka dan dapatkan komisi dari setiap referral yang berhasil.</p>
          <form action={registerAffiliateAction} className="mt-6">
            <button className="h-11 w-full rounded-md bg-primary font-semibold text-primary-fg hover:bg-primary-hover">Daftar Sekarang</button>
          </form>
        </div>
      </div>
    );
  }

  const supabase = await createClient();
  const [{ data: links }, { data: referrals }] = await Promise.all([
    supabase.from("affiliate_org_links").select("id, status, commission_type, commission_value, organizations(name, slug)").eq("affiliate_id", affiliate.id),
    supabase.from("affiliate_referrals").select("id, status, commission_amount, created_at, organizations(name)").eq("affiliate_id", affiliate.id).order("created_at", { ascending: false }).limit(10),
  ]);

  const totalCommission = (referrals ?? []).reduce((s, r) => s + Number(r.commission_amount ?? 0), 0);

  return (
    <DashboardShell
      brandLabel="Segaloka Affiliate"
      brandHref="/affiliate"
      nav={nav}
      userLabel={profile?.full_name || user.email || "Affiliate"}
      userSub={user.email ?? undefined}
    >
      <PageHeader eyebrow="Affiliate" title={`Kode Referral: ${affiliate.code}`} actions={<Badge status={affiliate.status} />} />

      <div className="grid gap-4 sm:grid-cols-3">
        <StatTile label="Travel Terhubung" value={String((links ?? []).length)} />
        <StatTile label="Total Referral" value={String((referrals ?? []).length)} />
        <StatTile label="Total Komisi" value={formatIDR(totalCommission)} />
      </div>

      <div className="mt-6">
        <p className="mb-3 font-display text-sm font-bold text-text-primary">Hubungkan ke Travel Baru</p>
        <LinkTravelForm />
      </div>

      <div className="mt-6">
        <p className="mb-3 font-display text-sm font-bold text-text-primary">Travel Terhubung</p>
        {!links || links.length === 0 ? (
          <EmptyState title="Belum terhubung dengan Travel manapun" />
        ) : (
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {links.map((l: any) => (
              <div key={l.id} className="rounded-lg border border-border bg-surface p-4">
                <div className="flex items-center justify-between">
                  <p className="font-semibold text-text-primary">{l.organizations?.name}</p>
                  <Badge status={l.status} />
                </div>
                <p className="mt-1 text-xs text-text-secondary">Komisi: {l.commission_type === "percentage" ? `${l.commission_value}%` : formatIDR(l.commission_value)}</p>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="mt-6">
        <p className="mb-3 font-display text-sm font-bold text-text-primary">Riwayat Referral</p>
        {!referrals || referrals.length === 0 ? (
          <EmptyState title="Belum ada referral" />
        ) : (
          <div className="space-y-2">
            {referrals.map((r: any) => (
              <div key={r.id} className="flex items-center justify-between rounded-md border border-border px-3 py-2.5 text-sm">
                <span className="text-text-primary">{r.organizations?.name}</span>
                <div className="flex items-center gap-2">
                  <span className="font-semibold text-text-primary">{r.commission_amount ? formatIDR(r.commission_amount) : "—"}</span>
                  <Badge status={r.status} />
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </DashboardShell>
  );
}
