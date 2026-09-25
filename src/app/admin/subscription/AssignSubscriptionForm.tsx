"use client";

import { assignSubscriptionAction } from "./actions";

export function AssignSubscriptionForm({ orgId, plans, currentPlanId }: { orgId: string; plans: { id: string; name: string }[]; currentPlanId?: string | null }) {
  return (
    <form action={assignSubscriptionAction} onChange={(e) => (e.currentTarget as HTMLFormElement).requestSubmit()}>
      <input type="hidden" name="org_id" value={orgId} />
      <select
        name="plan_id"
        defaultValue={currentPlanId ?? ""}
        className="h-8 rounded-md border border-border-strong bg-surface px-2 text-xs outline-none focus:border-primary"
      >
        <option value="" disabled>Pilih paket</option>
        {plans.map((p) => (
          <option key={p.id} value={p.id}>{p.name}</option>
        ))}
      </select>
    </form>
  );
}
