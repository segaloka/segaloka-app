"use client";

import { useFormState, useFormStatus } from "react-dom";
import Link from "next/link";
import { forgotPasswordAction } from "./actions";
import { Input } from "@/components/ui/Field";

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <button type="submit" disabled={pending} className="h-11 w-full rounded-md bg-primary font-semibold text-primary-fg hover:bg-primary-hover disabled:opacity-60">
      {pending ? "Mengirim…" : "Kirim Tautan Reset"}
    </button>
  );
}

export default function ForgotPasswordPage() {
  const [state, formAction] = useFormState(forgotPasswordAction, null);

  return (
    <div className="flex min-h-screen items-center justify-center bg-bg px-4">
      <div className="w-full max-w-sm rounded-xl border border-border bg-surface p-8 shadow-card">
        <h1 className="font-display text-xl font-bold text-text-primary">Setel ulang kata sandi</h1>
        {state?.sent ? (
          <p className="mt-3 text-sm text-text-secondary">
            Tautan reset telah dikirim ke <b className="text-text-primary">{state.email}</b>. Periksa kotak masuk Anda.
          </p>
        ) : (
          <>
            <p className="mt-1 text-sm text-text-secondary">Masukkan email terdaftar, kami kirimkan tautan untuk membuat kata sandi baru.</p>
            <form action={formAction} className="mt-6 space-y-4">
              <Input type="email" name="email" required placeholder="nama@email.com" />
              {state?.error && <p role="alert" className="rounded-md bg-danger-tint px-3 py-2 text-sm text-danger">{state.error}</p>}
              <SubmitButton />
            </form>
          </>
        )}
        <Link href="/login" className="mt-6 block text-center text-sm font-semibold text-primary hover:underline">
          Kembali ke halaman masuk
        </Link>
      </div>
    </div>
  );
}
