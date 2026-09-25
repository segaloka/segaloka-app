import { getOrgBySlug, hasPermission } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import { PageHeader } from "@/components/layout/PageHeader";
import { StatTile } from "@/components/ui/StatTile";
import { Badge } from "@/components/ui/Badge";
import { EmptyState, ForbiddenState } from "@/components/ui/EmptyState";
import { formatIDR, formatDateTime } from "@/lib/utils";

export default async function FinancePage({ params }: { params: { org: string } }) {
  const org = await getOrgBySlug(params.org);
  if (!org) return null;
  const allowed = await hasPermission(org.id, "finance.read");
  if (!allowed) return <ForbiddenState reason="Anda tidak memiliki izin finance.read." />;

  const supabase = await createClient();
  const [{ data: ledger }, { data: invoices }, { data: payments }] = await Promise.all([
    supabase.from("ledger_entries").select("*").eq("org_id", org.id).order("created_at", { ascending: false }).limit(30),
    supabase.from("invoices").select("*, bookings!inner(org_id, code)").eq("bookings.org_id", org.id).order("created_at", { ascending: false }).limit(15),
    supabase.from("payments").select("*, bookings!inner(org_id, code)").eq("bookings.org_id", org.id).order("created_at", { ascending: false }).limit(15),
  ]);

  const balanceByAccount: Record<string, number> = {};
  for (const e of ledger ?? []) {
    const sign = e.direction === "credit" ? 1 : -1;
    balanceByAccount[e.account] = (balanceByAccount[e.account] ?? 0) + sign * Number(e.amount);
  }
  const revenue = balanceByAccount["revenue"] ?? 0;
  const payable = balanceByAccount["travel_payable"] ?? 0;

  return (
    <div>
      <PageHeader eyebrow="Finance" title="Keuangan & Ledger" description={`Model settlement: ${org.settlement_model === "VIA_SEGALOKA" ? "Via Segaloka (dana masuk lewat Segaloka)" : "Langsung ke Travel"}.`} />

      <div className="grid gap-4 sm:grid-cols-3">
        <StatTile label="Total Pendapatan (ledger)" value={formatIDR(revenue)} />
        <StatTile label="Saldo Payable Travel" value={formatIDR(payable)} hint={org.settlement_model === "VIA_SEGALOKA" ? "tersedia untuk ditarik" : undefined} />
        <StatTile label="Invoice Tercatat" value={String(invoices?.length ?? 0)} />
      </div>

      {org.settlement_model === "VIA_SEGALOKA" && (
        <div className="mt-4 rounded-md border border-border bg-bg px-3 py-2.5 text-xs text-text-secondary">
          Alur penarikan dana (withdrawal request → persetujuan → pencairan) memerlukan modul settlement khusus yang belum tersedia di rilis ini — hubungi tim Segaloka untuk pencairan manual selama modul ini dibangun.
        </div>
      )}

      <div className="mt-6">
        <p className="mb-3 font-display text-sm font-bold text-text-primary">Ledger Terbaru</p>
        {!ledger || ledger.length === 0 ? (
          <EmptyState title="Belum ada entri ledger" description="Entri keuangan tercatat otomatis dari pembayaran yang terverifikasi." />
        ) : (
          <div className="overflow-x-auto rounded-lg border border-border">
            <table className="w-full min-w-[640px] border-collapse text-sm">
              <thead>
                <tr className="border-b border-border bg-bg text-left text-xs font-semibold uppercase tracking-wide text-muted">
                  <th className="px-4 py-3">Akun</th>
                  <th className="px-4 py-3">Tipe</th>
                  <th className="px-4 py-3">Arah</th>
                  <th className="px-4 py-3">Jumlah</th>
                  <th className="px-4 py-3">Tanggal</th>
                </tr>
              </thead>
              <tbody>
                {ledger.map((e) => (
                  <tr key={e.id} className="border-b border-border last:border-0">
                    <td className="px-4 py-3 font-semibold capitalize text-text-primary">{e.account.replace(/_/g, " ")}</td>
                    <td className="px-4 py-3 capitalize">{e.ref_type.replace(/_/g, " ")}</td>
                    <td className="px-4 py-3"><span className={e.direction === "credit" ? "text-success" : "text-danger"}>{e.direction === "credit" ? "Masuk" : "Keluar"}</span></td>
                    <td className="px-4 py-3">{formatIDR(e.amount)}</td>
                    <td className="px-4 py-3">{formatDateTime(e.created_at)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <div className="mt-6 grid gap-6 lg:grid-cols-2">
        <div>
          <p className="mb-3 font-display text-sm font-bold text-text-primary">Invoice</p>
          {!invoices || invoices.length === 0 ? (
            <EmptyState title="Belum ada invoice" />
          ) : (
            <div className="space-y-2">
              {invoices.map((inv: any) => (
                <div key={inv.id} className="flex items-center justify-between rounded-md border border-border px-3 py-2.5 text-sm">
                  <div>
                    <p className="font-mono text-xs">{inv.number}</p>
                    <p className="text-xs text-muted">{inv.bookings?.code}</p>
                  </div>
                  <div className="text-right">
                    <p className="font-semibold text-text-primary">{formatIDR(inv.amount)}</p>
                    <Badge status={inv.status} />
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
        <div>
          <p className="mb-3 font-display text-sm font-bold text-text-primary">Pembayaran</p>
          {!payments || payments.length === 0 ? (
            <EmptyState title="Belum ada pembayaran" />
          ) : (
            <div className="space-y-2">
              {payments.map((p: any) => (
                <div key={p.id} className="flex items-center justify-between rounded-md border border-border px-3 py-2.5 text-sm">
                  <div>
                    <p className="text-xs capitalize text-text-secondary">{p.provider.replace(/_/g, " ")}</p>
                    <p className="text-xs text-muted">{p.bookings?.code}</p>
                  </div>
                  <div className="text-right">
                    <p className="font-semibold text-text-primary">{formatIDR(p.net_amount)}</p>
                    <Badge status={p.status} />
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
