import { createClient } from "@/lib/supabase/server";
import { PageHeader } from "@/components/layout/PageHeader";
import { StatTile } from "@/components/ui/StatTile";
import { EmptyState } from "@/components/ui/EmptyState";
import { Badge } from "@/components/ui/Badge";
import { formatDateTime } from "@/lib/utils";
import Link from "next/link";

export default async function AdminOverviewPage() {
  const supabase = await createClient();

  const [{ count: totalOrgs }, { count: pendingOrgs }, { count: activeOrgs }, { count: totalVendors }, { count: pendingVendors }, { data: recentOrgs }] = await Promise.all([
    supabase.from("organizations").select("id", { count: "exact", head: true }),
    supabase.from("organizations").select("id", { count: "exact", head: true }).eq("status", "pending_verification"),
    supabase.from("organizations").select("id", { count: "exact", head: true }).eq("status", "active"),
    supabase.from("vendors").select("id", { count: "exact", head: true }),
    supabase.from("vendors").select("id", { count: "exact", head: true }).eq("status", "pending_verification"),
    supabase.from("organizations").select("id, name, slug, license_type, status, created_at").order("created_at", { ascending: false }).limit(8),
  ]);

  return (
    <div>
      <PageHeader eyebrow="Super Admin" title="Ringkasan Platform" description="Status Travel, vendor, dan aktivitas platform Segaloka secara keseluruhan." />

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatTile label="Total Travel" value={String(totalOrgs ?? 0)} />
        <StatTile label="Menunggu Verifikasi" value={String(pendingOrgs ?? 0)} deltaTone={pendingOrgs ? "bad" : "neutral"} hint={pendingOrgs ? "perlu ditinjau" : undefined} />
        <StatTile label="Travel Aktif" value={String(activeOrgs ?? 0)} />
        <StatTile label="Vendor Menunggu" value={String(pendingVendors ?? 0)} hint={`dari ${totalVendors ?? 0} total vendor`} />
      </div>

      <div className="mt-6 rounded-lg border border-border bg-surface">
        <div className="flex items-center justify-between border-b border-border px-5 py-4">
          <p className="font-display text-sm font-bold text-text-primary">Travel Terbaru</p>
          <Link href="/admin/verifikasi" className="text-xs font-semibold text-primary hover:underline">Lihat verifikasi</Link>
        </div>
        {!recentOrgs || recentOrgs.length === 0 ? (
          <div className="p-5"><EmptyState title="Belum ada Travel terdaftar" /></div>
        ) : (
          <div className="divide-y divide-border">
            {recentOrgs.map((o) => (
              <div key={o.id} className="flex items-center justify-between gap-3 px-5 py-3">
                <div className="min-w-0">
                  <p className="truncate text-sm font-semibold text-text-primary">{o.name}</p>
                  <p className="text-xs text-muted">{o.license_type} · {formatDateTime(o.created_at)}</p>
                </div>
                <Badge status={o.status} />
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
