"use client";

import { Suspense } from "react";
import { useFormState, useFormStatus } from "react-dom";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { loginAction } from "./actions";
import { Input } from "@/components/ui/Field";

function SubmitButton() {
  const { pending } = useFormStatus();

  return (
    <button
      type="submit"
      disabled={pending}
      className="h-11 w-full rounded-md bg-primary font-semibold text-primary-fg hover:bg-primary-hover disabled:opacity-60"
    >
      {pending ? "Memproses…" : "Masuk"}
    </button>
  );
}

function LoginContent() {
  const [state, formAction] = useFormState(loginAction, null);
  const params = useSearchParams();
  const next = params.get("next") ?? "/akun";

  return (
    <div className="flex min-h-screen items-center justify-center bg-bg px-4">
      <div className="w-full max-w-sm rounded-xl border border-border bg-surface p-8 shadow-card">
        <Link href="/" className="mb-6 flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary font-display text-sm font-bold text-primary-fg">
            S
          </div>

          <span className="font-display text-lg font-bold text-text-primary">
            Segaloka
          </span>
        </Link>

        <h1 className="font-display text-xl font-bold text-text-primary">
          Masuk ke akun Anda
        </h1>

        <p className="mt-1 text-sm text-text-secondary">
          Kelola booking, cari paket, dan pantau perjalanan Anda.
        </p>

        <form action={formAction} className="mt-6 space-y-4">
          <input type="hidden" name="next" value={next} />

          <div>
            <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-text-secondary">
              Email
            </label>

            <Input
              type="email"
              name="email"
              required
              placeholder="nama@email.com"
              autoComplete="email"
            />
          </div>

          <div>
            <div className="mb-1.5 flex items-center justify-between">
              <label className="text-xs font-semibold uppercase tracking-wide text-text-secondary">
                Kata Sandi
              </label>

              <Link
                href="/lupa-sandi"
                className="text-xs font-semibold text-primary hover:underline"
              >
                Lupa sandi?
              </Link>
            </div>

            <Input
              type="password"
              name="password"
              required
              placeholder="Kata sandi"
              autoComplete="current-password"
            />
          </div>

          {state?.error && (
            <p
              role="alert"
              className="rounded-md bg-danger-tint px-3 py-2 text-sm text-danger"
            >
              {state.error}
            </p>
          )}

          <SubmitButton />
        </form>

        <p className="mt-6 text-center text-sm text-text-secondary">
          Belum punya akun?{" "}
          <Link
            href="/register"
            className="font-semibold text-primary hover:underline"
          >
            Daftar
          </Link>
        </p>
      </div>
    </div>
  );
}

function LoginFallback() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-bg px-4">
      <div className="w-full max-w-sm rounded-xl border border-border bg-surface p-8 shadow-card">
        <div className="h-8 w-28 animate-pulse rounded-md bg-border" />
        <div className="mt-6 h-6 w-48 animate-pulse rounded-md bg-border" />
        <div className="mt-3 h-4 w-full animate-pulse rounded-md bg-border" />
        <div className="mt-8 h-11 w-full animate-pulse rounded-md bg-border" />
        <div className="mt-4 h-11 w-full animate-pulse rounded-md bg-border" />
        <div className="mt-6 h-11 w-full animate-pulse rounded-md bg-border" />
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={<LoginFallback />}>
      <LoginContent />
    </Suspense>
  );
}