import { getOrgBySlug, hasPermission } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import { PageHeader } from "@/components/layout/PageHeader";
import { Badge } from "@/components/ui/Badge";
import { EmptyState, ForbiddenState } from "@/components/ui/EmptyState";
import { formatIDR, formatDate } from "@/lib/utils";
import { LinkVendorForm } from "./LinkVendorForm";
import { OrderForm } from "./OrderForm";

export default async function VendorPage({ params }: { params: { org: string } }) {
  const org = await getOrgBySlug(params.org);
  if (!org) return null;
  const allowed = await hasPermission(org.id, "vendor.manage");
  if (!allowed) return <ForbiddenState reason="Anda tidak memiliki izin vendor.manage." />;

  const supabase = await createClient();
  const { data: links } = await supabase
    .from("vendor_org_links")
    .select("id, status, fee_type, fee_value, vendors(id, name, category_code, status)")
    .eq("org_id", org.id)
    .order("created_at", { ascending: false });

  const linkedIds = (links ?? []).map((l: any) => l.vendors?.id).filter(Boolean);
  const { data: availableVendors } = await supabase
    .from("vendors")
    .select("id, name, category_code")
    .eq("status", "active")
    .not("id", "in", `(${linkedIds.length ? linkedIds.join(",") : "00000000-0000-0000-0000-000000000000"})`);

  const activeLinks = (links ?? []).filter((l: any) => l.status === "active");
  const { data: orders } = await supabase
    .from("vendor_orders")
    .select("id, item, amount, status, created_at, vendors(name)")
    .eq("org_id", org.id)
    .order("created_at", { ascending: false })
    .limit(20);

  return (
    <div>
      <PageHeader eyebrow="Vendor" title="Relasi Vendor" description="Kelola vendor mitra (hotel, visa, tiket, dan kategori lainnya) untuk operasional paket Anda." />

      <LinkVendorForm orgSlug={params.org} vendors={availableVendors ?? []} />

      <div className="mt-4">
        {!links || links.length === 0 ? (
          <EmptyState title="Belum ada vendor terhubung" description="Hubungkan vendor untuk mulai membuat pesanan (hotel, visa, tiket, dsb)." />
        ) : (
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {links.map((l: any) => (
              <div key={l.id} className="rounded-lg border border-border bg-surface p-4">
                <div className="flex items-center justify-between">
                  <p className="font-semibold text-text-primary">{l.vendors?.name}</p>
                  <Badge status={l.status} />
                </div>
                <p className="mt-1 text-xs text-muted capitalize">{l.vendors?.category_code ?? "—"}</p>
                <p className="mt-2 text-xs text-text-secondary">
                  Fee: {l.fee_type === "percentage" ? `${l.fee_value}%` : l.fee_type === "fixed" ? formatIDR(l.fee_value) : "Kontrak"}
                </p>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="mt-8">
        <p className="mb-3 font-display text-sm font-bold text-text-primary">Pesanan Vendor</p>
        <OrderForm orgSlug={params.org} vendors={(activeLinks as any[]).map((l) => ({ id: l.vendors.id, name: l.vendors.name }))} />
        <div className="mt-4">
          {!orders || orders.length === 0 ? (
            <EmptyState title="Belum ada pesanan vendor" />
          ) : (
            <div className="overflow-x-auto rounded-lg border border-border">
              <table className="w-full min-w-[560px] border-collapse text-sm">
                <thead>
                  <tr className="border-b border-border bg-bg text-left text-xs font-semibold uppercase tracking-wide text-muted">
                    <th className="px-4 py-3">Vendor</th>
                    <th className="px-4 py-3">Item</th>
                    <th className="px-4 py-3">Jumlah</th>
                    <th className="px-4 py-3">Status</th>
                    <th className="px-4 py-3">Tanggal</th>
                  </tr>
                </thead>
                <tbody>
                  {orders.map((o: any) => (
                    <tr key={o.id} className="border-b border-border last:border-0">
                      <td className="px-4 py-3 font-semibold text-text-primary">{o.vendors?.name}</td>
                      <td className="px-4 py-3">{o.item}</td>
                      <td className="px-4 py-3">{formatIDR(o.amount)}</td>
                      <td className="px-4 py-3"><Badge status={o.status} /></td>
                      <td className="px-4 py-3">{formatDate(o.created_at)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
