"use client";

import { useFormState, useFormStatus } from "react-dom";
import { createPlanAction } from "./actions";
import { Input } from "@/components/ui/Field";

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <button type="submit" disabled={pending} className="h-9 rounded-md bg-primary px-4 text-sm font-semibold text-primary-fg hover:bg-primary-hover disabled:opacity-60">
      {pending ? "Menyimpan…" : "+ Buat Paket"}
    </button>
  );
}

export function PlanForm() {
  const [state, formAction] = useFormState(createPlanAction, null);

  return (
    <form action={formAction} className="flex flex-wrap items-end gap-3 rounded-lg border border-dashed border-border-strong p-4">
      <div>
        <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-text-secondary">Nama Paket</label>
        <Input name="name" required placeholder="cth. Growth" className="w-40" />
      </div>
      <div>
        <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-text-secondary">Harga/Bulan</label>
        <Input name="price_monthly" type="number" min={0} required className="w-32" />
      </div>
      <div>
        <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-text-secondary">Harga/Tahun</label>
        <Input name="price_yearly" type="number" min={0} required className="w-32" />
      </div>
      <div>
        <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-text-secondary">Limit Cabang</label>
        <Input name="branch_limit" type="number" min={1} defaultValue={1} className="w-24" required />
      </div>
      <div>
        <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-text-secondary">Storage (GB)</label>
        <Input name="storage_gb" type="number" min={1} defaultValue={5} className="w-24" required />
      </div>
      <div>
        <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-text-secondary">Trial (hari)</label>
        <Input name="trial_days" type="number" min={0} defaultValue={14} className="w-24" required />
      </div>
      <SubmitButton />
      {state?.error && <p className="w-full text-sm text-danger">{state.error}</p>}
    </form>
  );
}
