import { getOrgBySlug, hasPermission } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import { PageHeader } from "@/components/layout/PageHeader";
import { DataTable, type Column } from "@/components/ui/DataTable";
import { Badge } from "@/components/ui/Badge";
import { ForbiddenState } from "@/components/ui/EmptyState";
import { formatDate, formatIDR } from "@/lib/utils";

export default async function TravelBookingListPage({ params }: { params: { org: string } }) {
  const org = await getOrgBySlug(params.org);
  if (!org) return null;
  const allowed = (await hasPermission(org.id, "booking.manage")) || (await hasPermission(org.id, "booking.create"));
  if (!allowed) return <ForbiddenState reason="Anda tidak memiliki izin untuk melihat data booking." />;

  const supabase = await createClient();
  const { data } = await supabase
    .from("bookings")
    .select("id, code, status, total_amount, pax_count, created_at, custom_package_name, departures(departure_date, packages(name))")
    .eq("org_id", org.id)
    .order("created_at", { ascending: false });

  const rows = data ?? [];
  const columns: Column<(typeof rows)[number]>[] = [
    { key: "code", header: "Kode", render: (r) => <span className="font-mono text-xs">{r.code}</span> },
    { key: "package", header: "Paket", render: (r: any) => r.departures?.packages?.name ?? r.custom_package_name ?? "SegaDeals" },
    { key: "departure", header: "Keberangkatan", render: (r: any) => formatDate(r.departures?.departure_date) },
    { key: "pax", header: "Pax", render: (r) => r.pax_count },
    { key: "total", header: "Total", render: (r) => formatIDR(r.total_amount) },
    { key: "status", header: "Status", render: (r) => <Badge status={r.status} /> },
  ];

  return (
    <div>
      <PageHeader eyebrow="Sales" title="Booking" description="Seluruh booking traveler untuk Travel Anda." />
      <DataTable
        columns={columns}
        rows={rows}
        getRowId={(r) => r.id}
        searchableText={(r: any) => `${r.code} ${r.departures?.packages?.name ?? ""} ${r.custom_package_name ?? ""}`}
        rowHref={(r) => `/dashboard/${org.slug}/booking/${r.id}`}
        emptyTitle="Belum ada booking"
        emptyDescription="Booking dari traveler, baik dari katalog maupun SegaDeals, akan muncul di sini."
      />
    </div>
  );
}
