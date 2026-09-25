"use client";

import { useFormState, useFormStatus } from "react-dom";
import { inviteMitraAction } from "./actions";
import { Input, Select } from "@/components/ui/Field";

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <button type="submit" disabled={pending} className="h-9 rounded-md bg-primary px-4 text-sm font-semibold text-primary-fg hover:bg-primary-hover disabled:opacity-60">
      {pending ? "Mengundang…" : "Undang Mitra"}
    </button>
  );
}

export function InviteMitraForm({ orgSlug }: { orgSlug: string }) {
  const [state, formAction] = useFormState(inviteMitraAction, null);

  return (
    <form action={formAction} className="flex flex-wrap items-end gap-3 rounded-lg border border-dashed border-border-strong p-4">
      <input type="hidden" name="org_slug" value={orgSlug} />
      <div>
        <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-text-secondary">Email Akun Segaloka</label>
        <Input name="email" type="email" required className="w-56" />
      </div>
      <div>
        <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-text-secondary">Tipe Komisi</label>
        <Select name="commission_type" defaultValue="percentage" className="w-36">
          <option value="percentage">Persentase</option>
          <option value="fixed">Tetap</option>
        </Select>
      </div>
      <div>
        <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-text-secondary">Nilai Komisi</label>
        <Input name="commission_value" type="number" min={0} step="0.01" required className="w-28" />
      </div>
      <SubmitButton />
      {state?.error && <p className="w-full text-sm text-danger">{state.error}</p>}
      {state?.success && <p className="w-full text-sm text-success">{state.success}</p>}
      <p className="w-full text-xs text-muted">Mitra harus sudah memiliki akun Segaloka (mendaftar di /register) dengan email yang sama. Mitra hanya dapat terhubung dengan satu Travel.</p>
    </form>
  );
}
