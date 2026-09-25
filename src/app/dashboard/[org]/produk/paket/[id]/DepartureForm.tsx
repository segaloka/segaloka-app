"use client";

import { useFormState, useFormStatus } from "react-dom";
import { createDepartureAction } from "../actions";
import { Input } from "@/components/ui/Field";

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <button type="submit" disabled={pending} className="h-9 rounded-md bg-primary px-4 text-sm font-semibold text-primary-fg hover:bg-primary-hover disabled:opacity-60">
      {pending ? "Menambah…" : "+ Tambah Jadwal"}
    </button>
  );
}

export function DepartureForm({ orgSlug, pkgId }: { orgSlug: string; pkgId: string }) {
  const [state, formAction] = useFormState(createDepartureAction, null);

  return (
    <form action={formAction} className="flex flex-wrap items-end gap-3 rounded-lg border border-dashed border-border-strong p-4">
      <input type="hidden" name="org_slug" value={orgSlug} />
      <input type="hidden" name="pkg_id" value={pkgId} />
      <div>
        <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-text-secondary">Tanggal Berangkat</label>
        <Input name="departure_date" type="date" required />
      </div>
      <div>
        <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-text-secondary">Tanggal Pulang</label>
        <Input name="return_date" type="date" />
      </div>
      <div>
        <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-text-secondary">Kuota</label>
        <Input name="quota" type="number" min={1} required className="w-28" />
      </div>
      <SubmitButton />
      {state?.error && <p role="alert" className="w-full text-sm text-danger">{state.error}</p>}
    </form>
  );
}
