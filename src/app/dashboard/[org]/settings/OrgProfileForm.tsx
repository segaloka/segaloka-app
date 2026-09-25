"use client";

import { useFormState, useFormStatus } from "react-dom";
import { updateOrgProfileAction } from "./actions";
import { Input } from "@/components/ui/Field";

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <button type="submit" disabled={pending} className="h-10 rounded-md bg-primary px-5 text-sm font-semibold text-primary-fg hover:bg-primary-hover disabled:opacity-60">
      {pending ? "Menyimpan…" : "Simpan"}
    </button>
  );
}

export function OrgProfileForm({
  orgSlug,
  name,
  supportEmail,
  supportPhone,
  address,
}: {
  orgSlug: string;
  name: string;
  supportEmail: string;
  supportPhone: string;
  address: string;
}) {
  const [state, formAction] = useFormState(updateOrgProfileAction, null);

  return (
    <form action={formAction} className="space-y-4">
      <input type="hidden" name="org_slug" value={orgSlug} />
      <div>
        <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-text-secondary">Nama Travel</label>
        <Input name="name" defaultValue={name} required />
      </div>
      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-text-secondary">Email Dukungan</label>
          <Input name="support_email" type="email" defaultValue={supportEmail} />
        </div>
        <div>
          <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-text-secondary">Telepon Dukungan</label>
          <Input name="support_phone" defaultValue={supportPhone} />
        </div>
      </div>
      <div>
        <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-text-secondary">Alamat</label>
        <Input name="address" defaultValue={address} />
      </div>
      {state?.error && <p role="alert" className="rounded-md bg-danger-tint px-3 py-2 text-sm text-danger">{state.error}</p>}
      <SubmitButton />
    </form>
  );
}
