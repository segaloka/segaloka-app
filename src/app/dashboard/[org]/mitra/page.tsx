import { getOrgBySlug, hasPermission } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import { PageHeader } from "@/components/layout/PageHeader";
import { Badge } from "@/components/ui/Badge";
import { EmptyState, ForbiddenState } from "@/components/ui/EmptyState";
import { formatIDR } from "@/lib/utils";
import { InviteMitraForm } from "./InviteMitraForm";

export default async function MitraPage({ params }: { params: { org: string } }) {
  const org = await getOrgBySlug(params.org);
  if (!org) return null;
  const allowed = await hasPermission(org.id, "mitra.manage");
  if (!allowed) return <ForbiddenState reason="Anda tidak memiliki izin mitra.manage." />;

  const supabase = await createClient();
  const { data: mitra } = await supabase
    .from("mitra")
    .select("id, commission_type, commission_value, status, created_at, profiles(full_name)")
    .eq("org_id", org.id)
    .order("created_at", { ascending: false });

  return (
    <div>
      <PageHeader eyebrow="Ekosistem" title="Mitra" description="Mitra eksklusif yang hanya menjual paket dari Travel Anda." />
      <InviteMitraForm orgSlug={params.org} />
      <div className="mt-4">
      {!mitra || mitra.length === 0 ? (
        <EmptyState title="Belum ada mitra" description="Mitra bergabung melalui undangan Travel dan hanya dapat terhubung dengan satu Travel." />
      ) : (
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {mitra.map((m: any) => (
            <div key={m.id} className="rounded-lg border border-border bg-surface p-4">
              <div className="flex items-center justify-between">
                <p className="font-semibold text-text-primary">{m.profiles?.full_name ?? "Mitra"}</p>
                <Badge status={m.status} />
              </div>
              <p className="mt-2 text-xs text-text-secondary">
                Komisi: {m.commission_type === "percentage" ? `${m.commission_value}%` : formatIDR(m.commission_value)}
              </p>
            </div>
          ))}
        </div>
      )}
      </div>
    </div>
  );
}
