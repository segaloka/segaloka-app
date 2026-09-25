import { getOrgBySlug, hasPermission } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import { PageHeader } from "@/components/layout/PageHeader";
import { DataTable, type Column } from "@/components/ui/DataTable";
import { Badge } from "@/components/ui/Badge";
import { ForbiddenState } from "@/components/ui/EmptyState";
import { formatDate, formatIDR } from "@/lib/utils";

const TYPE_LABEL: Record<string, string> = { umrah: "Umrah", haji: "Haji", halal_tour: "Halal Tour", tour: "Tour" };

export default async function SegaDealsIncomingPage({ params }: { params: { org: string } }) {
  const org = await getOrgBySlug(params.org);
  if (!org) return null;
  const allowed = await hasPermission(org.id, "segadeals.respond");
  if (!allowed) return <ForbiddenState reason="Anda tidak memiliki izin segadeals.respond." />;

  const supabase = await createClient();
  const { data: deposit } = await supabase.from("segadeals_deposits").select("*").eq("org_id", org.id).maybeSingle();
  const { data } = await supabase
    .from("segadeals_requests")
    .select("id, type, destination, origin_city, pax, budget_min, budget_max, date_from, status, created_at")
    .in("status", ["open", "offered"])
    .order("created_at", { ascending: false });

  const rows = data ?? [];
  const columns: Column<(typeof rows)[number]>[] = [
    { key: "type", header: "Tipe", render: (r) => TYPE_LABEL[r.type] ?? r.type },
    { key: "destination", header: "Tujuan", render: (r) => r.destination ?? "—" },
    { key: "pax", header: "Pax", render: (r) => r.pax },
    { key: "budget", header: "Budget", render: (r) => (r.budget_max ? formatIDR(r.budget_max) : "—") },
    { key: "date", header: "Preferensi Tanggal", render: (r) => formatDate(r.date_from) },
    { key: "status", header: "Status", render: (r) => <Badge status={r.status} /> },
  ];

  const balance = Number(deposit?.balance ?? 0);
  const minRequired = Number(deposit?.min_required ?? 0);
  const depositOk = balance >= minRequired;

  return (
    <div>
      <PageHeader eyebrow="SegaDeals" title="Permintaan Masuk" description="Permintaan custom trip dari traveler yang dapat Anda tawar." />

      <div className={`mb-4 rounded-md border px-3 py-2.5 text-xs ${depositOk ? "border-success/30 bg-success-tint text-success" : "border-warning/30 bg-warning-tint text-warning"}`}>
        Saldo deposit SegaDeals: <b>{formatIDR(balance)}</b> (minimum {formatIDR(minRequired)}).{" "}
        {depositOk ? "Anda dapat mengirim penawaran." : "Saldo di bawah minimum — hubungi tim Segaloka untuk top up sebelum mengirim penawaran."}
      </div>

      <DataTable
        columns={columns}
        rows={rows}
        getRowId={(r) => r.id}
        searchableText={(r) => `${r.type} ${r.destination ?? ""}`}
        rowHref={(r) => `/dashboard/${org.slug}/segadeals/${r.id}`}
        emptyTitle="Belum ada permintaan"
        emptyDescription="Permintaan SegaDeals dari traveler akan muncul di sini secara real-time."
      />
    </div>
  );
}
