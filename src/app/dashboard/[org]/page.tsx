import { getOrgBySlug } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import { PageHeader } from "@/components/layout/PageHeader";
import { StatTile } from "@/components/ui/StatTile";
import { EmptyState } from "@/components/ui/EmptyState";
import { Badge } from "@/components/ui/Badge";
import { LinkButton } from "@/components/ui/Button";
import { formatIDR, formatDateTime } from "@/lib/utils";
import Link from "next/link";

export default async function TravelOverviewPage({ params }: { params: { org: string } }) {
  const org = await getOrgBySlug(params.org);
  const supabase = await createClient();
  if (!org) return null;

  const [bookingsRes, leadsRes, packagesRes, recentBookingsRes] = await Promise.all([
    supabase.from("bookings").select("id, status, total_amount", { count: "exact" }).eq("org_id", org.id),
    supabase.from("leads").select("id, stage", { count: "exact" }).eq("org_id", org.id),
    supabase.from("packages").select("id, status", { count: "exact" }).eq("org_id", org.id),
    supabase
      .from("bookings")
      .select("id, code, status, total_amount, pax_count, created_at, departures(packages(name))")
      .eq("org_id", org.id)
      .order("created_at", { ascending: false })
      .limit(6),
  ]);

  const bookings = bookingsRes.data ?? [];
  const leads = leadsRes.data ?? [];
  const packages = packagesRes.data ?? [];
  const recent = recentBookingsRes.data ?? [];

  const activeBookings = bookings.filter((b) => b.status !== "cancelled").length;
  const revenue = bookings.filter((b) => b.status === "confirmed" || b.status === "completed").reduce((s, b) => s + Number(b.total_amount), 0);
  const openLeads = leads.filter((l) => !["won", "lost"].includes(l.stage)).length;
  const publishedPackages = packages.filter((p) => p.status === "published").length;

  return (
    <div>
      <PageHeader eyebrow="Travel Dashboard" title="Ringkasan" description={`Selamat datang kembali, berikut ringkasan aktivitas ${org.name}.`} />

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatTile label="Booking Aktif" value={String(activeBookings)} hint={`dari ${bookings.length} total`} />
        <StatTile label="Estimasi Pendapatan" value={formatIDR(revenue)} hint="booking confirmed & selesai" />
        <StatTile label="Lead Berjalan" value={String(openLeads)} hint={`dari ${leads.length} total lead`} />
        <StatTile label="Paket Terbit" value={String(publishedPackages)} hint={`dari ${packages.length} total paket`} />
      </div>

      <div className="mt-6 rounded-lg border border-border bg-surface">
        <div className="flex items-center justify-between border-b border-border px-5 py-4">
          <p className="font-display text-sm font-bold text-text-primary">Booking Terbaru</p>
          <LinkButton href={`/dashboard/${org.slug}/booking`} variant="outline" size="sm">
            Lihat semua
          </LinkButton>
        </div>
        {recent.length === 0 ? (
          <div className="p-5">
            <EmptyState title="Belum ada booking" description="Booking dari traveler akan muncul di sini secara real-time." />
          </div>
        ) : (
          <div className="divide-y divide-border">
            {recent.map((b: any) => (
              <Link key={b.id} href={`/dashboard/${org.slug}/booking/${b.id}`} className="flex items-center justify-between gap-3 px-5 py-3 hover:bg-bg">
                <div className="min-w-0">
                  <p className="truncate text-sm font-semibold text-text-primary">{b.departures?.packages?.name ?? b.code}</p>
                  <p className="text-xs text-muted">
                    {b.code} · {b.pax_count} pax · {formatDateTime(b.created_at)}
                  </p>
                </div>
                <div className="flex flex-none items-center gap-3">
                  <span className="text-sm font-semibold text-text-primary">{formatIDR(b.total_amount)}</span>
                  <Badge status={b.status} />
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
