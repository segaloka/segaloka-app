import { notFound } from "next/navigation";
import { getOrgBySlug, hasPermission } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import { PageHeader } from "@/components/layout/PageHeader";
import { Card, CardBody, CardHeader } from "@/components/ui/Card";
import { ForbiddenState, EmptyState } from "@/components/ui/EmptyState";
import { formatDateTime } from "@/lib/utils";
import { StageForm } from "./StageForm";
import { ActivityForm } from "./ActivityForm";
import { Icon, type IconName } from "@/components/layout/Icon";

const TYPE_ICON: Record<string, IconName> = { call: "message", whatsapp: "message", email: "message", note: "doc", task: "check", stage_change: "chevronRight" };

export default async function LeadDetailPage({ params }: { params: { org: string; id: string } }) {
  const org = await getOrgBySlug(params.org);
  if (!org) return null;
  const allowed = await hasPermission(org.id, "crm.manage");
  if (!allowed) return <ForbiddenState reason="Anda tidak memiliki izin crm.manage." />;

  const supabase = await createClient();
  const { data: lead } = await supabase.from("leads").select("*").eq("id", params.id).eq("org_id", org.id).single();
  if (!lead) notFound();

  const { data: activities } = await supabase
    .from("lead_activities")
    .select("*")
    .eq("lead_id", lead.id)
    .order("created_at", { ascending: false });

  return (
    <div>
      <PageHeader eyebrow="CRM" title={lead.name} description={[lead.phone, lead.email].filter(Boolean).join(" · ")} actions={<StageForm orgSlug={params.org} leadId={lead.id} stage={lead.stage} />} />

      <div className="grid gap-6 lg:grid-cols-3">
        <Card className="lg:col-span-1">
          <CardHeader><p className="font-display font-bold text-text-primary">Detail Lead</p></CardHeader>
          <CardBody className="space-y-2 text-sm">
            <div className="flex justify-between"><span className="text-text-secondary">Sumber</span><span className="font-semibold capitalize text-text-primary">{lead.source.replace("_", " ")}</span></div>
            <div className="flex justify-between"><span className="text-text-secondary">Minat</span><span className="font-semibold capitalize text-text-primary">{lead.interest_type?.replace("_", " ") ?? "—"}</span></div>
            <div className="flex justify-between"><span className="text-text-secondary">Dibuat</span><span className="text-text-primary">{formatDateTime(lead.created_at)}</span></div>
          </CardBody>
        </Card>

        <div className="space-y-4 lg:col-span-2">
          <ActivityForm orgSlug={params.org} leadId={lead.id} />
          {!activities || activities.length === 0 ? (
            <EmptyState title="Belum ada aktivitas" description="Catatan interaksi dengan lead ini akan muncul di sini." />
          ) : (
            <div className="space-y-3">
              {activities.map((a) => (
                <div key={a.id} className="flex gap-3 rounded-lg border border-border bg-surface p-3.5">
                  <div className="mt-0.5 flex h-7 w-7 flex-none items-center justify-center rounded-full bg-primary/10 text-primary">
                    <Icon name={TYPE_ICON[a.type] ?? "doc"} size={14} />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-sm text-text-primary">{a.body}</p>
                    <p className="mt-1 text-xs text-muted">{formatDateTime(a.created_at)}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
