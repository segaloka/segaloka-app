"use client";

import { useFormState, useFormStatus } from "react-dom";
import { updateProfileAction } from "./actions";
import { Input } from "@/components/ui/Field";

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <button type="submit" disabled={pending} className="h-10 rounded-md bg-primary px-5 text-sm font-semibold text-primary-fg hover:bg-primary-hover disabled:opacity-60">
      {pending ? "Menyimpan…" : "Simpan Perubahan"}
    </button>
  );
}

export function ProfileForm({ fullName, phone, email }: { fullName: string; phone: string; email: string }) {
  const [state, formAction] = useFormState(updateProfileAction, null);

  return (
    <form action={formAction} className="max-w-md space-y-4">
      <div>
        <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-text-secondary">Nama Lengkap</label>
        <Input name="full_name" defaultValue={fullName} required />
      </div>
      <div>
        <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-text-secondary">Email</label>
        <Input value={email} disabled />
        <p className="mt-1 text-xs text-muted">Email tidak dapat diubah dari sini.</p>
      </div>
      <div>
        <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-text-secondary">Nomor Telepon</label>
        <Input name="phone" defaultValue={phone} placeholder="08xx-xxxx-xxxx" />
      </div>
      {state?.error && <p role="alert" className="rounded-md bg-danger-tint px-3 py-2 text-sm text-danger">{state.error}</p>}
      {state?.success && <p className="rounded-md bg-success-tint px-3 py-2 text-sm text-success">Profil berhasil diperbarui.</p>}
      <SubmitButton />
    </form>
  );
}
