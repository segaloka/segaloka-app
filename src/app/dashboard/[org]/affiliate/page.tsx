import { getOrgBySlug, hasPermission } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import { PageHeader } from "@/components/layout/PageHeader";
import { Badge } from "@/components/ui/Badge";
import { EmptyState, ForbiddenState } from "@/components/ui/EmptyState";
import { StatTile } from "@/components/ui/StatTile";
import { formatIDR, formatDate } from "@/lib/utils";

export default async function AffiliatePage({ params }: { params: { org: string } }) {
  const org = await getOrgBySlug(params.org);
  if (!org) return null;
  const allowed = await hasPermission(org.id, "affiliate.manage");
  if (!allowed) return <ForbiddenState reason="Anda tidak memiliki izin affiliate.manage." />;

  const supabase = await createClient();
  const { data: links } = await supabase
    .from("affiliate_org_links")
    .select("id, commission_type, commission_value, status, affiliates(code, status)")
    .eq("org_id", org.id)
    .order("created_at", { ascending: false });

  const { data: referrals } = await supabase
    .from("affiliate_referrals")
    .select("id, status, commission_amount, created_at, affiliates(code)")
    .eq("org_id", org.id)
    .order("created_at", { ascending: false })
    .limit(20);

  const totalCommission = (referrals ?? []).reduce((s, r) => s + Number(r.commission_amount ?? 0), 0);
  const confirmedReferrals = (referrals ?? []).filter((r) => r.status !== "pending").length;

  return (
    <div>
      <PageHeader eyebrow="Ekosistem" title="Affiliate" description="Affiliate yang mempromosikan paket Travel Anda lintas platform (dapat bekerja sama dengan banyak Travel)." />

      <div className="grid gap-4 sm:grid-cols-3">
        <StatTile label="Affiliate Terhubung" value={String((links ?? []).length)} />
        <StatTile label="Referral Terkonfirmasi" value={String(confirmedReferrals)} hint={`dari ${(referrals ?? []).length} total`} />
        <StatTile label="Total Komisi" value={formatIDR(totalCommission)} />
      </div>

      <div className="mt-6">
        <p className="mb-3 font-display text-sm font-bold text-text-primary">Affiliate Terhubung</p>
        {!links || links.length === 0 ? (
          <EmptyState title="Belum ada affiliate terhubung" description="Affiliate bergabung melalui program referral Segaloka dan akan tampil di sini setelah terhubung ke Travel Anda." />
        ) : (
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {links.map((l: any) => (
              <div key={l.id} className="rounded-lg border border-border bg-surface p-4">
                <div className="flex items-center justify-between">
                  <p className="font-mono text-sm font-semibold text-text-primary">{l.affiliates?.code}</p>
                  <Badge status={l.status} />
                </div>
                <p className="mt-2 text-xs text-text-secondary">
                  Komisi: {l.commission_type === "percentage" ? `${l.commission_value}%` : formatIDR(l.commission_value)}
                </p>
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
          <div className="overflow-x-auto rounded-lg border border-border">
            <table className="w-full min-w-[520px] border-collapse text-sm">
              <thead>
                <tr className="border-b border-border bg-bg text-left text-xs font-semibold uppercase tracking-wide text-muted">
                  <th className="px-4 py-3">Affiliate</th>
                  <th className="px-4 py-3">Komisi</th>
                  <th className="px-4 py-3">Status</th>
                  <th className="px-4 py-3">Tanggal</th>
                </tr>
              </thead>
              <tbody>
                {referrals.map((r: any) => (
                  <tr key={r.id} className="border-b border-border last:border-0">
                    <td className="px-4 py-3 font-mono text-xs">{r.affiliates?.code}</td>
                    <td className="px-4 py-3">{r.commission_amount ? formatIDR(r.commission_amount) : "—"}</td>
                    <td className="px-4 py-3"><Badge status={r.status} /></td>
                    <td className="px-4 py-3">{formatDate(r.created_at)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
