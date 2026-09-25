import { getOrgBySlug } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import { PageHeader } from "@/components/layout/PageHeader";
import { StatTile } from "@/components/ui/StatTile";
import { EmptyState } from "@/components/ui/EmptyState";
import { formatIDR } from "@/lib/utils";

export default async function AnalyticsPage({ params }: { params: { org: string } }) {
  const org = await getOrgBySlug(params.org);
  if (!org) return null;
  const supabase = await createClient();

  const { data: bookings } = await supabase.from("bookings").select("status, total_amount, created_at").eq("org_id", org.id);
  const { data: leads } = await supabase.from("leads").select("stage, source").eq("org_id", org.id);

  const rows = bookings ?? [];
  const totalRevenue = rows.filter((b) => b.status === "confirmed" || b.status === "completed").reduce((s, b) => s + Number(b.total_amount), 0);
  const conversionRate = leads && leads.length > 0 ? Math.round((leads.filter((l) => l.stage === "won").length / leads.length) * 100) : 0;

  const bySource: Record<string, number> = {};
  for (const l of leads ?? []) bySource[l.source] = (bySource[l.source] ?? 0) + 1;

  return (
    <div>
      <PageHeader eyebrow="Analitik" title="Analitik Bisnis" description="Ringkasan performa penjualan dan CRM berdasarkan data riil Travel Anda." />

      <div className="grid gap-4 sm:grid-cols-3">
        <StatTile label="Total Booking" value={String(rows.length)} />
        <StatTile label="Total Pendapatan" value={formatIDR(totalRevenue)} />
        <StatTile label="Konversi Lead → Booking" value={`${conversionRate}%`} />
      </div>

      <div className="mt-6">
        <p className="mb-3 font-display text-sm font-bold text-text-primary">Lead per Sumber</p>
        {Object.keys(bySource).length === 0 ? (
          <EmptyState title="Belum ada data lead" description="Data akan muncul setelah CRM memiliki aktivitas." />
        ) : (
          <div className="grid gap-3 sm:grid-cols-3">
            {Object.entries(bySource).map(([source, count]) => (
              <div key={source} className="rounded-lg border border-border bg-surface p-4">
                <p className="text-xs font-semibold uppercase tracking-wide text-muted capitalize">{source.replace("_", " ")}</p>
                <p className="mt-1 font-display text-xl font-bold text-text-primary">{count}</p>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
