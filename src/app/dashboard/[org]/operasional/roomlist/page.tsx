import { getOrgBySlug, hasPermission } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import { PageHeader } from "@/components/layout/PageHeader";
import { DataTable, type Column } from "@/components/ui/DataTable";
import { Badge } from "@/components/ui/Badge";
import { ForbiddenState } from "@/components/ui/EmptyState";
import { formatDate } from "@/lib/utils";

export default async function RoomListPage({ params }: { params: { org: string } }) {
  const org = await getOrgBySlug(params.org);
  if (!org) return null;
  const allowed = await hasPermission(org.id, "operations.manage");
  if (!allowed) return <ForbiddenState reason="Anda tidak memiliki izin operations.manage." />;

  const supabase = await createClient();
  const { data } = await supabase
    .from("departures")
    .select("id, departure_date, status, quota, filled, packages!inner(name, org_id)")
    .eq("packages.org_id", org.id)
    .order("departure_date", { ascending: false });

  const rows = data ?? [];
  const columns: Column<(typeof rows)[number]>[] = [
    { key: "package", header: "Paket", render: (r: any) => r.packages?.name },
    { key: "date", header: "Tanggal Berangkat", render: (r) => formatDate(r.departure_date) },
    { key: "filled", header: "Jamaah Terkonfirmasi", render: (r) => `${r.filled} / ${r.quota}` },
    { key: "status", header: "Status", render: (r) => <Badge status={r.status} /> },
  ];

  return (
    <div>
      <PageHeader eyebrow="Operasional" title="Room List" description="Pilih jadwal keberangkatan untuk mengatur alokasi kamar hotel." />
      <DataTable
        columns={columns}
        rows={rows}
        getRowId={(r) => r.id}
        searchableText={(r: any) => r.packages?.name ?? ""}
        rowHref={(r) => `/dashboard/${org.slug}/operasional/roomlist/${r.id}`}
        emptyTitle="Belum ada jadwal keberangkatan"
      />
    </div>
  );
}
