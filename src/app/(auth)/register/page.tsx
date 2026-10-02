"use client";

import { useFormState, useFormStatus } from "react-dom";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { registerAction } from "./actions";
import { Input } from "@/components/ui/Field";

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <button
      type="submit"
      disabled={pending}
      className="h-11 w-full rounded-md bg-primary font-semibold text-primary-fg hover:bg-primary-hover disabled:opacity-60"
    >
      {pending ? "Memproses…" : "Buat Akun"}
    </button>
  );
}

export default function RegisterPage() {
  const [state, formAction] = useFormState(registerAction, null);
  const searchParams = useSearchParams();
  const role = searchParams.get("role");
  const roleLabels: Record<string, string> = {
    traveler: "Traveler",
    travel: "Travel",
    vendor: "Vendor",
    agent: "Agen",
    mitra: "Mitra",
    affiliate: "Affiliate",
  };
  const selectedRole = role ? roleLabels[role] : null;

  if (state?.needsConfirmation) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-bg px-4">
        <div className="w-full max-w-sm rounded-xl border border-border bg-surface p-8 text-center shadow-card">
          <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-success-tint text-success">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none"><path d="M22 6L11 17l-5-5" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" /></svg>
          </div>
          <h1 className="font-display text-lg font-bold text-text-primary">Periksa email Anda</h1>
          <p className="mt-2 text-sm text-text-secondary">
            Kami telah mengirim tautan konfirmasi ke <b className="text-text-primary">{state.email}</b>. Klik tautan tersebut untuk mengaktifkan akun Anda.
          </p>
          <Link href="/login" className="mt-6 inline-block text-sm font-semibold text-primary hover:underline">Kembali ke halaman masuk</Link>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-bg px-4 py-10">
      <div className="w-full max-w-sm rounded-xl border border-border bg-surface p-8 shadow-card">
        <Link href="/" className="mb-6 flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary font-display text-sm font-bold text-primary-fg">S</div>
          <span className="font-display text-lg font-bold text-text-primary">Segaloka</span>
        </Link>
        <h1 className="font-display text-xl font-bold text-text-primary">Buat akun Segaloka</h1>
        <p className="mt-1 text-sm text-text-secondary">{selectedRole ? `Daftar sebagai ${selectedRole} di ekosistem Segaloka.` : "Satu akun untuk booking, SegaDeals, dan seluruh perjalanan Anda."}</p>

        <form action={formAction} className="mt-6 space-y-4">
          {role && roleLabels[role] && <input type="hidden" name="requested_role" value={role} />}
          <div>
            <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-text-secondary">Nama Lengkap</label>
            <Input name="full_name" required placeholder="Sesuai identitas" autoComplete="name" />
          </div>
          <div>
            <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-text-secondary">Email</label>
            <Input type="email" name="email" required placeholder="nama@email.com" autoComplete="email" />
          </div>
          <div>
            <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-text-secondary">Kata Sandi</label>
            <Input type="password" name="password" required placeholder="Minimal 8 karakter" autoComplete="new-password" />
          </div>
          <div>
            <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-text-secondary">Konfirmasi Kata Sandi</label>
            <Input type="password" name="password_confirm" required placeholder="Ulangi kata sandi" autoComplete="new-password" />
          </div>
          {state?.error && (
            <p role="alert" className="rounded-md bg-danger-tint px-3 py-2 text-sm text-danger">{state.error}</p>
          )}
          <p className="text-xs text-text-secondary">
            Dengan mendaftar, Anda menyetujui <Link href="/syarat" className="underline">Syarat Layanan</Link> dan{" "}
            <Link href="/privasi" className="underline">Kebijakan Privasi</Link> Segaloka.
          </p>
          <SubmitButton />
        </form>

        <p className="mt-6 text-center text-sm text-text-secondary">
          Sudah punya akun?{" "}
          <Link href="/login" className="font-semibold text-primary hover:underline">Masuk</Link>
        </p>
      </div>
    </div>
  );
}
