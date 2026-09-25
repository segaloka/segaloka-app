import { getOrgBySlug, hasPermission } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import { PageHeader } from "@/components/layout/PageHeader";
import { DataTable, type Column } from "@/components/ui/DataTable";
import { Badge } from "@/components/ui/Badge";
import { LinkButton } from "@/components/ui/Button";
import { ForbiddenState } from "@/components/ui/EmptyState";
import { formatDate } from "@/lib/utils";

const STAGE_LABEL: Record<string, string> = { new: "Baru", contacted: "Dihubungi", qualified: "Qualified", offer_sent: "Penawaran Terkirim", won: "Menang", lost: "Hilang" };

export default async function CrmLeadsPage({ params }: { params: { org: string } }) {
  const org = await getOrgBySlug(params.org);
  if (!org) return null;
  const allowed = await hasPermission(org.id, "crm.manage");
  if (!allowed) return <ForbiddenState reason="Anda tidak memiliki izin crm.manage." />;

  const supabase = await createClient();
  const { data } = await supabase
    .from("leads")
    .select("id, name, phone, email, source, stage, created_at")
    .eq("org_id", org.id)
    .order("created_at", { ascending: false });

  const rows = data ?? [];
  const columns: Column<(typeof rows)[number]>[] = [
    { key: "name", header: "Nama", render: (r) => <span className="font-semibold text-text-primary">{r.name}</span> },
    { key: "contact", header: "Kontak", render: (r) => r.phone ?? r.email ?? "—" },
    { key: "source", header: "Sumber", render: (r) => <span className="capitalize">{r.source.replace("_", " ")}</span> },
    { key: "stage", header: "Stage", render: (r) => <Badge status={r.stage} label={STAGE_LABEL[r.stage]} /> },
    { key: "created", header: "Dibuat", render: (r) => formatDate(r.created_at) },
  ];

  return (
    <div>
      <PageHeader
        eyebrow="CRM"
        title="Leads & Pipeline"
        description="Kelola prospek dari website, WhatsApp, referral, SegaDeals, dan sumber lainnya."
        actions={<LinkButton href={`/dashboard/${org.slug}/crm/baru`}>+ Lead Baru</LinkButton>}
      />
      <DataTable
        columns={columns}
        rows={rows}
        getRowId={(r) => r.id}
        searchableText={(r) => `${r.name} ${r.phone ?? ""} ${r.email ?? ""}`}
        rowHref={(r) => `/dashboard/${org.slug}/crm/${r.id}`}
        emptyTitle="Belum ada lead"
        emptyDescription="Lead dari website, WhatsApp, atau input manual akan muncul di sini."
      />
    </div>
  );
}
