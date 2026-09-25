"use client";

import { useFormState, useFormStatus } from "react-dom";
import { createOrganizationAction } from "./actions";
import { Input, Select } from "@/components/ui/Field";

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <button type="submit" disabled={pending} className="h-11 w-full rounded-md bg-primary font-semibold text-primary-fg hover:bg-primary-hover disabled:opacity-60">
      {pending ? "Membuat…" : "Buat Akun Travel"}
    </button>
  );
}

export default function OnboardingPage() {
  const [state, formAction] = useFormState(createOrganizationAction, null);

  return (
    <div className="flex min-h-screen items-center justify-center bg-bg px-4 py-10">
      <div className="w-full max-w-lg rounded-xl border border-border bg-surface p-8 shadow-card">
        <h1 className="font-display text-xl font-bold text-text-primary">Daftarkan Travel Anda</h1>
        <p className="mt-1 text-sm text-text-secondary">
          Buat ruang kerja Travel untuk mengelola paket, booking, keuangan, dan operasional.
        </p>

        <form action={formAction} className="mt-6 space-y-4">
          <div>
            <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-text-secondary">Nama Travel</label>
            <Input name="name" required placeholder="cth. Nurul Iman Tour" />
          </div>
          <div>
            <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-text-secondary">Nama Badan Hukum</label>
            <Input name="legal_name" required placeholder="cth. PT Nurul Iman Wisata" />
          </div>
          <div>
            <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-text-secondary">Jenis Izin Usaha</label>
            <Select name="license_type" required defaultValue="">
              <option value="" disabled>Pilih jenis izin</option>
              <option value="BPW">BPW — Paket wisata domestik/internasional & Halal Tour</option>
              <option value="PPIU">PPIU — termasuk BPW, dapat menjual paket Umrah</option>
              <option value="PIHK">PIHK — termasuk BPW & PPIU, dapat menjual paket Haji</option>
            </Select>
            <p className="mt-1.5 text-xs text-muted">
              Produk yang dapat Anda jual ditentukan oleh jenis izin ini dan diverifikasi oleh tim Segaloka — bukan hanya disembunyikan di tampilan.
            </p>
          </div>

          <div className="rounded-md border border-warning/30 bg-warning-tint px-3 py-2.5 text-xs text-warning">
            Akun Travel baru berstatus <b>Menunggu Verifikasi</b> hingga legalitas dan lisensi diverifikasi oleh Super Admin Segaloka. Anda tetap dapat menyiapkan data selama menunggu.
          </div>

          {state?.error && <p role="alert" className="rounded-md bg-danger-tint px-3 py-2 text-sm text-danger">{state.error}</p>}
          <SubmitButton />
        </form>
      </div>
    </div>
  );
}
