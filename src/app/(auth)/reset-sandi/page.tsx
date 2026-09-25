"use client";

import { useFormState, useFormStatus } from "react-dom";
import { resetPasswordAction } from "./actions";
import { Input } from "@/components/ui/Field";

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <button type="submit" disabled={pending} className="h-11 w-full rounded-md bg-primary font-semibold text-primary-fg hover:bg-primary-hover disabled:opacity-60">
      {pending ? "Menyimpan…" : "Simpan Kata Sandi Baru"}
    </button>
  );
}

export default function ResetPasswordPage() {
  const [state, formAction] = useFormState(resetPasswordAction, null);

  return (
    <div className="flex min-h-screen items-center justify-center bg-bg px-4">
      <div className="w-full max-w-sm rounded-xl border border-border bg-surface p-8 shadow-card">
        <h1 className="font-display text-xl font-bold text-text-primary">Buat kata sandi baru</h1>
        <p className="mt-1 text-sm text-text-secondary">Tautan reset Anda valid. Masukkan kata sandi baru di bawah ini.</p>
        <form action={formAction} className="mt-6 space-y-4">
          <Input type="password" name="password" required placeholder="Kata sandi baru" autoComplete="new-password" />
          <Input type="password" name="password_confirm" required placeholder="Ulangi kata sandi baru" autoComplete="new-password" />
          {state?.error && <p role="alert" className="rounded-md bg-danger-tint px-3 py-2 text-sm text-danger">{state.error}</p>}
          <SubmitButton />
        </form>
      </div>
    </div>
  );
}
