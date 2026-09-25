import { createClient } from "@/lib/supabase/server";
import { requireUser } from "@/lib/auth";
import { PageHeader } from "@/components/layout/PageHeader";
import { DataTable, type Column } from "@/components/ui/DataTable";
import { Badge } from "@/components/ui/Badge";
import { formatDate, formatIDR } from "@/lib/utils";

export default async function AkunBookingListPage() {
  const user = await requireUser();
  const supabase = await createClient();
  const { data } = await supabase
    .from("bookings")
    .select("id, code, status, total_amount, pax_count, created_at, departures(departure_date, packages(name, organizations(name)))")
    .eq("traveler_user_id", user.id)
    .order("created_at", { ascending: false });

  const rows = data ?? [];
  const columns: Column<(typeof rows)[number]>[] = [
    { key: "code", header: "Kode", render: (r) => <span className="font-mono text-xs">{r.code}</span> },
    { key: "package", header: "Paket", render: (r: any) => r.departures?.packages?.name },
    { key: "travel", header: "Travel", render: (r: any) => r.departures?.packages?.organizations?.name },
    { key: "departure", header: "Keberangkatan", render: (r: any) => formatDate(r.departures?.departure_date) },
    { key: "pax", header: "Pax", render: (r) => r.pax_count },
    { key: "total", header: "Total", render: (r) => formatIDR(r.total_amount) },
    { key: "status", header: "Status", render: (r) => <Badge status={r.status} /> },
  ];

  return (
    <div>
      <PageHeader eyebrow="Traveler" title="Booking Saya" description="Seluruh riwayat booking perjalanan Anda." />
      <DataTable
        columns={columns}
        rows={rows}
        getRowId={(r) => r.id}
        searchableText={(r: any) => `${r.code} ${r.departures?.packages?.name ?? ""}`}
        rowHref={(r) => `/akun/booking/${r.id}`}
        emptyTitle="Belum ada booking"
        emptyDescription="Booking yang Anda buat akan muncul di sini."
      />
    </div>
  );
}
