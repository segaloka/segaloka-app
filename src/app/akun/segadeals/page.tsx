import { createClient } from "@/lib/supabase/server";
import { requireUser } from "@/lib/auth";
import { PageHeader } from "@/components/layout/PageHeader";
import { DataTable, type Column } from "@/components/ui/DataTable";
import { Badge } from "@/components/ui/Badge";
import { LinkButton } from "@/components/ui/Button";
import { formatDate } from "@/lib/utils";

export default async function SegaDealsListPage() {
  const user = await requireUser();
  const supabase = await createClient();
  const { data } = await supabase
    .from("segadeals_requests")
    .select("id, type, destination, date_from, pax, status, created_at")
    .eq("traveler_user_id", user.id)
    .order("created_at", { ascending: false });

  const rows = data ?? [];
  const columns: Column<(typeof rows)[number]>[] = [
    { key: "type", header: "Jenis", render: (r) => <span className="capitalize">{r.type.replace("_", " ")}</span> },
    { key: "destination", header: "Tujuan", render: (r) => r.destination || "Fleksibel" },
    { key: "date", header: "Tanggal", render: (r) => formatDate(r.date_from) },
    { key: "pax", header: "Pax", render: (r) => r.pax },
    { key: "status", header: "Status", render: (r) => <Badge status={r.status} /> },
  ];

  return (
    <div>
      <PageHeader
        eyebrow="Traveler"
        title="SegaDeals Saya"
        description="Permintaan perjalanan yang Anda ajukan ke jaringan Travel Segaloka."
        actions={<LinkButton href="/akun/segadeals/baru">Ajukan Baru</LinkButton>}
      />
      <DataTable
        columns={columns}
        rows={rows}
        getRowId={(r) => r.id}
        rowHref={(r) => `/akun/segadeals/${r.id}`}
        emptyTitle="Belum ada permintaan SegaDeals"
        emptyDescription="Sampaikan kebutuhan perjalanan Anda sekali, terima penawaran dari banyak Travel."
      />
    </div>
  );
}
