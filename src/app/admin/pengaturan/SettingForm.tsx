"use client";

import { useFormState, useFormStatus } from "react-dom";
import { upsertSettingAction } from "./actions";
import { Input, Textarea } from "@/components/ui/Field";

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <button type="submit" disabled={pending} className="h-9 rounded-md bg-primary px-4 text-sm font-semibold text-primary-fg hover:bg-primary-hover disabled:opacity-60">
      {pending ? "Menyimpan…" : "Simpan"}
    </button>
  );
}

export function SettingForm({ setting }: { setting?: { key: string; value: unknown; description: string | null } }) {
  const [state, formAction] = useFormState(upsertSettingAction, null);

  return (
    <form action={formAction} className="space-y-3 rounded-lg border border-dashed border-border-strong p-4">
      <div>
        <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-text-secondary">Key</label>
        <Input name="key" defaultValue={setting?.key} required readOnly={Boolean(setting)} placeholder="cth. segadeals.min_deposit" className={setting ? "bg-bg" : ""} />
      </div>
      <div>
        <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-text-secondary">Value (JSON)</label>
        <Textarea name="value" defaultValue={setting ? JSON.stringify(setting.value) : ""} required placeholder='cth. 5000000 atau {"percent": 2.5}' className="font-mono" />
      </div>
      <div>
        <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-text-secondary">Deskripsi</label>
        <Input name="description" defaultValue={setting?.description ?? ""} placeholder="Penjelasan singkat penggunaan setting ini" />
      </div>
      {state?.error && <p className="text-sm text-danger">{state.error}</p>}
      <SubmitButton />
    </form>
  );
}
