"use client";

import { useFormState, useFormStatus } from "react-dom";
import { updateBankInfoAction } from "./actions";
import { Input } from "@/components/ui/Field";

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <button type="submit" disabled={pending} className="h-10 rounded-md bg-primary px-5 text-sm font-semibold text-primary-fg hover:bg-primary-hover disabled:opacity-60">
      {pending ? "Menyimpan…" : "Simpan Rekening"}
    </button>
  );
}

export function BankInfoForm({ orgSlug, bankName, accountNumber, accountName }: { orgSlug: string; bankName: string; accountNumber: string; accountName: string }) {
  const [state, formAction] = useFormState(updateBankInfoAction, null);

  return (
    <form action={formAction} className="space-y-4">
      <input type="hidden" name="org_slug" value={orgSlug} />
      <div>
        <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-text-secondary">Nama Bank</label>
        <Input name="bank_name" defaultValue={bankName} required placeholder="cth. BSI" />
      </div>
      <div>
        <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-text-secondary">Nomor Rekening</label>
        <Input name="account_number" defaultValue={accountNumber} required />
      </div>
      <div>
        <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-text-secondary">Nama Pemilik Rekening</label>
        <Input name="account_name" defaultValue={accountName} required />
      </div>
      <p className="text-xs text-muted">Rekening ini ditampilkan ke traveler untuk transfer manual selama integrasi payment gateway belum aktif.</p>
      {state?.error && <p role="alert" className="rounded-md bg-danger-tint px-3 py-2 text-sm text-danger">{state.error}</p>}
      <SubmitButton />
    </form>
  );
}
