import { createClient } from "@/lib/supabase/server";
import { PageHeader } from "@/components/layout/PageHeader";
import { StatTile } from "@/components/ui/StatTile";
import { EmptyState } from "@/components/ui/EmptyState";
import { formatIDR, formatDateTime } from "@/lib/utils";

export default async function AdminFinancePage() {
  const supabase = await createClient();
  const { data: ledger } = await supabase
    .from("ledger_entries")
    .select("*, organizations(name)")
    .order("created_at", { ascending: false })
    .limit(50);

  const totals: Record<string, number> = {};
  for (const e of ledger ?? []) {
    const sign = e.direction === "credit" ? 1 : -1;
    totals[e.account] = (totals[e.account] ?? 0) + sign * Number(e.amount);
  }

  return (
    <div>
      <PageHeader eyebrow="Finance" title="Oversight Keuangan" description="Ringkasan ledger lintas seluruh Travel di platform Segaloka (50 entri terbaru)." />

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatTile label="Total Revenue (sampel)" value={formatIDR(totals["revenue"] ?? 0)} />
        <StatTile label="Platform Fee" value={formatIDR(totals["platform_fee"] ?? 0)} />
        <StatTile label="Travel Payable" value={formatIDR(totals["travel_payable"] ?? 0)} />
        <StatTile label="Reserve" value={formatIDR(totals["reserve"] ?? 0)} />
      </div>

      <p className="mt-3 text-xs text-muted">
        Angka di atas dihitung dari 50 entri ledger terbaru sebagai sampel, bukan agregat penuh — laporan keuangan penuh memerlukan query agregat sisi database untuk skala data produksi.
      </p>

      <div className="mt-6">
        {!ledger || ledger.length === 0 ? (
          <EmptyState title="Belum ada entri ledger di platform" />
        ) : (
          <div className="overflow-x-auto rounded-lg border border-border">
            <table className="w-full min-w-[640px] border-collapse text-sm">
              <thead>
                <tr className="border-b border-border bg-bg text-left text-xs font-semibold uppercase tracking-wide text-muted">
                  <th className="px-4 py-3">Travel</th>
                  <th className="px-4 py-3">Akun</th>
                  <th className="px-4 py-3">Arah</th>
                  <th className="px-4 py-3">Jumlah</th>
                  <th className="px-4 py-3">Tanggal</th>
                </tr>
              </thead>
              <tbody>
                {ledger.map((e: any) => (
                  <tr key={e.id} className="border-b border-border last:border-0">
                    <td className="px-4 py-3 font-semibold text-text-primary">{e.organizations?.name}</td>
                    <td className="px-4 py-3 capitalize">{e.account.replace(/_/g, " ")}</td>
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
    </div>
  );
}
