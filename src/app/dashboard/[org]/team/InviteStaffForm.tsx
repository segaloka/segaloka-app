"use client";

import { useFormState, useFormStatus } from "react-dom";
import { inviteStaffAction } from "./actions";
import { Input, Select } from "@/components/ui/Field";

const ROLE_LABEL: Record<string, string> = {
  "travel.admin": "Admin",
  "travel.finance": "Finance",
  "travel.sales": "Sales",
  "travel.operations": "Operasional",
  "travel.branch_manager": "Manajer Cabang",
  "travel.staff": "Staff",
};

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <button type="submit" disabled={pending} className="h-9 rounded-md bg-primary px-4 text-sm font-semibold text-primary-fg hover:bg-primary-hover disabled:opacity-60">
      {pending ? "Menambahkan…" : "Tambah Staff"}
    </button>
  );
}

export function InviteStaffForm({ orgSlug, branches }: { orgSlug: string; branches: { id: string; name: string }[] }) {
  const [state, formAction] = useFormState(inviteStaffAction, null);

  return (
    <form action={formAction} className="flex flex-wrap items-end gap-3 rounded-lg border border-dashed border-border-strong p-4">
      <input type="hidden" name="org_slug" value={orgSlug} />
      <div>
        <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-text-secondary">Email Akun Segaloka</label>
        <Input name="email" type="email" required placeholder="staff@email.com" className="w-56" />
      </div>
      <div>
        <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-text-secondary">Role</label>
        <Select name="role_slug" required defaultValue="" className="w-44">
          <option value="" disabled>Pilih role</option>
          {Object.entries(ROLE_LABEL).map(([slug, label]) => (
            <option key={slug} value={slug}>{label}</option>
          ))}
        </Select>
      </div>
      {branches.length > 0 && (
        <div>
          <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-text-secondary">Cabang</label>
          <Select name="branch_id" defaultValue="" className="w-44">
            <option value="">Semua cabang</option>
            {branches.map((b) => (
              <option key={b.id} value={b.id}>{b.name}</option>
            ))}
          </Select>
        </div>
      )}
      <SubmitButton />
      {state?.error && <p className="w-full text-sm text-danger">{state.error}</p>}
      {state?.success && <p className="w-full text-sm text-success">{state.success}</p>}
      <p className="w-full text-xs text-muted">Orang yang diundang harus sudah memiliki akun Segaloka (mendaftar di /register) dengan email yang sama.</p>
    </form>
  );
}
