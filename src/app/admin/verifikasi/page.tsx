import { createClient } from "@/lib/supabase/server";
import { PageHeader } from "@/components/layout/PageHeader";
import { DataTable, type Column } from "@/components/ui/DataTable";
import { Badge } from "@/components/ui/Badge";
import { formatDate } from "@/lib/utils";

export default async function AdminVerifikasiPage() {
  const supabase = await createClient();
  const { data } = await supabase
    .from("organizations")
    .select("id, name, license_type, license_number, license_expiry, status, created_at")
    .order("created_at", { ascending: false });

  const rows = data ?? [];
  const columns: Column<(typeof rows)[number]>[] = [
    { key: "name", header: "Nama Travel", render: (r) => <span className="font-semibold text-text-primary">{r.name}</span> },
    { key: "license", header: "Lisensi", render: (r) => `${r.license_type}${r.license_number ? ` — ${r.license_number}` : ""}` },
    { key: "expiry", header: "Kadaluarsa", render: (r) => (r.license_expiry ? formatDate(r.license_expiry) : "—") },
    { key: "status", header: "Status", render: (r) => <Badge status={r.status} /> },
    { key: "created", header: "Daftar", render: (r) => formatDate(r.created_at) },
  ];

  return (
    <div>
      <PageHeader eyebrow="Verifikasi" title="Verifikasi Travel" description="Tinjau legalitas dan lisensi Travel yang mendaftar di Segaloka." />
      <DataTable
        columns={columns}
        rows={rows}
        getRowId={(r) => r.id}
        searchableText={(r) => `${r.name} ${r.license_type}`}
        rowHref={(r) => `/admin/verifikasi/${r.id}`}
        emptyTitle="Belum ada Travel terdaftar"
      />
    </div>
  );
}
