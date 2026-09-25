import { createClient } from "@/lib/supabase/server";
import { PageHeader } from "@/components/layout/PageHeader";
import { DataTable, type Column } from "@/components/ui/DataTable";
import { formatDateTime } from "@/lib/utils";

export default async function AdminAuditPage() {
  const supabase = await createClient();
  const { data } = await supabase
    .from("audit_logs")
    .select("id, action, entity_type, entity_id, created_at, organizations(name)")
    .order("created_at", { ascending: false })
    .limit(100);

  const rows = data ?? [];
  const columns: Column<(typeof rows)[number]>[] = [
    { key: "action", header: "Aksi", render: (r) => <span className="font-mono text-xs">{r.action}</span> },
    { key: "entity", header: "Entitas", render: (r) => `${r.entity_type}${r.entity_id ? ` #${r.entity_id.slice(0, 8)}` : ""}` },
    { key: "org", header: "Travel", render: (r: any) => r.organizations?.name ?? "—" },
    { key: "date", header: "Waktu", render: (r) => formatDateTime(r.created_at) },
  ];

  return (
    <div>
      <PageHeader eyebrow="Keamanan" title="Audit Log" description="Jejak aktivitas penting di seluruh platform (100 entri terbaru)." />
      <DataTable
        columns={columns}
        rows={rows}
        getRowId={(r) => r.id}
        searchableText={(r: any) => `${r.action} ${r.entity_type} ${r.organizations?.name ?? ""}`}
        emptyTitle="Belum ada aktivitas tercatat"
        pageSize={20}
      />
    </div>
  );
}
