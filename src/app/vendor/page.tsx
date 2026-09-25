import { createClient } from "@/lib/supabase/server";
import { requireVendor } from "@/lib/vendor";
import { PageHeader } from "@/components/layout/PageHeader";
import { StatTile } from "@/components/ui/StatTile";
import { EmptyState } from "@/components/ui/EmptyState";
import { Badge } from "@/components/ui/Badge";
import { formatIDR } from "@/lib/utils";

export default async function VendorOverviewPage() {
  const vendor = await requireVendor();
  const supabase = await createClient();

  const [{ data: links }, { data: orders }] = await Promise.all([
    supabase.from("vendor_org_links").select("id, status, fee_type, fee_value, organizations(name)").eq("vendor_id", vendor.id),
    supabase.from("vendor_orders").select("id, item, amount, status, organizations(name)").eq("vendor_id", vendor.id).order("created_at", { ascending: false }).limit(5),
  ]);

  const activeLinks = (links ?? []).filter((l) => l.status === "active").length;
  const totalOrderValue = (orders ?? []).reduce((s, o) => s + Number(o.amount), 0);

  return (
    <div>
      <PageHeader eyebrow="Vendor" title="Ringkasan" description={`Profil vendor: ${vendor.category_code ?? "-"}`} />

      <div className="grid gap-4 sm:grid-cols-3">
        <StatTile label="Travel Terhubung" value={String(activeLinks)} hint={`dari ${(links ?? []).length} total`} />
        <StatTile label="Pesanan Terbaru" value={String((orders ?? []).length)} />
        <StatTile label="Nilai Pesanan (5 terbaru)" value={formatIDR(totalOrderValue)} />
      </div>

      <div className="mt-6">
        <p className="mb-3 font-display text-sm font-bold text-text-primary">Travel Terhubung</p>
        {!links || links.length === 0 ? (
          <EmptyState title="Belum ada Travel terhubung" description="Travel akan menghubungkan vendor Anda dari dashboard mereka." />
        ) : (
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {links.map((l: any) => (
              <div key={l.id} className="rounded-lg border border-border bg-surface p-4">
                <div className="flex items-center justify-between">
                  <p className="font-semibold text-text-primary">{l.organizations?.name}</p>
                  <Badge status={l.status} />
                </div>
                <p className="mt-1 text-xs text-text-secondary">Fee: {l.fee_type === "percentage" ? `${l.fee_value}%` : formatIDR(l.fee_value)}</p>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
