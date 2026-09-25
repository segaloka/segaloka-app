import { getOrgBySlug, hasPermission } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import { PageHeader } from "@/components/layout/PageHeader";
import { DataTable, type Column } from "@/components/ui/DataTable";
import { Badge } from "@/components/ui/Badge";
import { LinkButton } from "@/components/ui/Button";
import { ForbiddenState } from "@/components/ui/EmptyState";
import { formatIDR } from "@/lib/utils";

const TYPE_LABEL: Record<string, string> = { umrah: "Umrah", haji: "Haji", halal_tour: "Halal Tour", tour: "Tour" };

export default async function PaketListPage({ params }: { params: { org: string } }) {
  const org = await getOrgBySlug(params.org);
  if (!org) return null;
  const allowed = await hasPermission(org.id, "package.manage");
  if (!allowed) return <ForbiddenState reason="Anda tidak memiliki izin package.manage untuk mengelola paket." />;

  const supabase = await createClient();
  const { data } = await supabase
    .from("packages")
    .select("id, name, type, base_price, duration_days, status, departures(count)")
    .eq("org_id", org.id)
    .order("created_at", { ascending: false });

  const rows = data ?? [];
  const columns: Column<(typeof rows)[number]>[] = [
    { key: "name", header: "Nama Paket", render: (r) => <span className="font-semibold text-text-primary">{r.name}</span> },
    { key: "type", header: "Tipe", render: (r) => TYPE_LABEL[r.type] ?? r.type },
    { key: "duration", header: "Durasi", render: (r) => `${r.duration_days} hari` },
    { key: "price", header: "Harga Mulai", render: (r) => formatIDR(r.base_price) },
    { key: "departures", header: "Keberangkatan", render: (r: any) => r.departures?.[0]?.count ?? 0 },
    { key: "status", header: "Status", render: (r) => <Badge status={r.status} /> },
  ];

  return (
    <div>
      <PageHeader
        eyebrow="Produk"
        title="Paket & Keberangkatan"
        description="Kelola katalog paket perjalanan dan jadwal keberangkatannya."
        actions={<LinkButton href={`/dashboard/${org.slug}/produk/paket/baru`}>+ Paket Baru</LinkButton>}
      />
      <DataTable
        columns={columns}
        rows={rows}
        getRowId={(r) => r.id}
        searchableText={(r) => `${r.name} ${r.type}`}
        rowHref={(r) => `/dashboard/${org.slug}/produk/paket/${r.id}`}
        emptyTitle="Belum ada paket"
        emptyDescription="Buat paket pertama Anda — paket yang dipublikasikan akan otomatis tampil di website Travel tanpa input ulang."
      />
    </div>
  );
}
