import { createClient } from "@/lib/supabase/server";
import { PageHeader } from "@/components/layout/PageHeader";
import { Badge } from "@/components/ui/Badge";
import { EmptyState } from "@/components/ui/EmptyState";
import { formatIDR } from "@/lib/utils";
import { PlanForm } from "./PlanForm";
import { AssignSubscriptionForm } from "./AssignSubscriptionForm";
import { togglePlanActiveAction } from "./actions";

export default async function AdminSubscriptionPage() {
  const supabase = await createClient();
  const [{ data: plans }, { data: orgs }] = await Promise.all([
    supabase.from("subscription_plans").select("*").order("price_monthly"),
    supabase.from("organizations").select("id, name, status, subscriptions(id, status, plan_id)").order("name"),
  ]);

  return (
    <div>
      <PageHeader eyebrow="Subscription" title="Paket & Langganan" description="Konfigurasi paket subscription dan kelola langganan tiap Travel — tidak hardcoded, seluruhnya dapat diubah dari sini." />

      <PlanForm />

      <div className="mt-4">
        {!plans || plans.length === 0 ? (
          <EmptyState title="Belum ada paket subscription" />
        ) : (
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {plans.map((p) => (
              <div key={p.id} className="rounded-lg border border-border bg-surface p-4">
                <div className="flex items-center justify-between">
                  <p className="font-display font-bold text-text-primary">{p.name}</p>
                  <Badge status={p.is_active ? "active" : "suspended"} label={p.is_active ? "Aktif" : "Nonaktif"} />
                </div>
                <p className="mt-1 text-sm text-text-secondary">{formatIDR(p.price_monthly)}/bulan · {formatIDR(p.price_yearly)}/tahun</p>
                <p className="mt-1 text-xs text-muted">{p.branch_limit} cabang · {p.storage_gb}GB · trial {p.trial_days} hari</p>
                <form action={togglePlanActiveAction} className="mt-2">
                  <input type="hidden" name="plan_id" value={p.id} />
                  <input type="hidden" name="is_active" value={String(p.is_active)} />
                  <button className="text-xs font-semibold text-primary hover:underline">{p.is_active ? "Nonaktifkan" : "Aktifkan"}</button>
                </form>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="mt-8">
        <p className="mb-3 font-display text-sm font-bold text-text-primary">Langganan per Travel</p>
        {!orgs || orgs.length === 0 ? (
          <EmptyState title="Belum ada Travel" />
        ) : (
          <div className="overflow-x-auto rounded-lg border border-border">
            <table className="w-full min-w-[520px] border-collapse text-sm">
              <thead>
                <tr className="border-b border-border bg-bg text-left text-xs font-semibold uppercase tracking-wide text-muted">
                  <th className="px-4 py-3">Travel</th>
                  <th className="px-4 py-3">Status Langganan</th>
                  <th className="px-4 py-3">Paket</th>
                </tr>
              </thead>
              <tbody>
                {orgs.map((o: any) => {
                  const sub = (o.subscriptions as any[])?.[0];
                  return (
                    <tr key={o.id} className="border-b border-border last:border-0">
                      <td className="px-4 py-3 font-semibold text-text-primary">{o.name}</td>
                      <td className="px-4 py-3">{sub ? <Badge status={sub.status} /> : <span className="text-xs text-muted">Belum berlangganan</span>}</td>
                      <td className="px-4 py-3">
                        <AssignSubscriptionForm orgId={o.id} plans={(plans ?? []).filter((p) => p.is_active)} currentPlanId={sub?.plan_id} />
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
