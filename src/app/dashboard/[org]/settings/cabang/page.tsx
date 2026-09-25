import { getOrgBySlug, hasPermission } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import { PageHeader } from "@/components/layout/PageHeader";
import { Badge } from "@/components/ui/Badge";
import { EmptyState, ForbiddenState } from "@/components/ui/EmptyState";
import { BranchForm } from "./BranchForm";
import { toggleBranchStatusAction } from "./actions";

export default async function CabangPage({ params }: { params: { org: string } }) {
  const org = await getOrgBySlug(params.org);
  if (!org) return null;
  const allowed = await hasPermission(org.id, "branch.manage");
  if (!allowed) return <ForbiddenState reason="Anda tidak memiliki izin branch.manage." />;

  const supabase = await createClient();
  const { data: branches } = await supabase.from("branches").select("*").eq("org_id", org.id).order("created_at");
  const { data: subscription } = await supabase
    .from("subscriptions")
    .select("branch_limit_override, subscription_plans(branch_limit, name)")
    .eq("org_id", org.id)
    .maybeSingle();

  const limit = subscription?.branch_limit_override ?? (subscription?.subscription_plans as any)?.branch_limit;

  return (
    <div>
      <PageHeader
        eyebrow="Pengaturan"
        title="Cabang"
        description={limit ? `${branches?.length ?? 0} dari ${limit} cabang digunakan (paket ${(subscription?.subscription_plans as any)?.name ?? "-"}).` : "Kelola cabang Travel Anda."}
      />

      <BranchForm orgSlug={params.org} />

      <div className="mt-4">
        {!branches || branches.length === 0 ? (
          <EmptyState title="Belum ada cabang" />
        ) : (
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {branches.map((b) => (
              <div key={b.id} className="rounded-lg border border-border bg-surface p-4">
                <div className="flex items-center justify-between">
                  <p className="font-semibold text-text-primary">{b.name} {b.is_hq && <span className="ml-1 text-xs text-primary">(Pusat)</span>}</p>
                  <Badge status={b.status} />
                </div>
                <p className="mt-1 text-xs text-muted">{b.city ?? "—"}</p>
                {b.pic_name && <p className="text-xs text-text-secondary">PIC: {b.pic_name}</p>}
                {!b.is_hq && (
                  <form action={toggleBranchStatusAction} className="mt-2">
                    <input type="hidden" name="org_slug" value={params.org} />
                    <input type="hidden" name="branch_id" value={b.id} />
                    <input type="hidden" name="status" value={b.status === "active" ? "inactive" : "active"} />
                    <button className="text-xs font-semibold text-primary hover:underline">
                      {b.status === "active" ? "Nonaktifkan" : "Aktifkan"}
                    </button>
                  </form>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
