"use client";

import { useFormState, useFormStatus } from "react-dom";
import { registerVendorAction } from "./actions";
import { Input, Select } from "@/components/ui/Field";

const CATEGORIES = [
  { code: "hotel", label: "Hotel" },
  { code: "visa", label: "Visa" },
  { code: "ticket", label: "Tiket Pesawat" },
  { code: "transport", label: "Transportasi Darat" },
  { code: "catering", label: "Catering" },
  { code: "handling", label: "Handling / Muthowif" },
  { code: "other", label: "Lainnya" },
];

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <button type="submit" disabled={pending} className="h-11 w-full rounded-md bg-primary font-semibold text-primary-fg hover:bg-primary-hover disabled:opacity-60">
      {pending ? "Mendaftarkan…" : "Daftarkan Vendor"}
    </button>
  );
}

export default function VendorOnboardingPage() {
  const [state, formAction] = useFormState(registerVendorAction, null);

  return (
    <div className="flex min-h-screen items-center justify-center bg-bg px-4 py-10">
      <div className="w-full max-w-lg rounded-xl border border-border bg-surface p-8 shadow-card">
        <h1 className="font-display text-xl font-bold text-text-primary">Daftarkan Vendor Anda</h1>
        <p className="mt-1 text-sm text-text-secondary">Bergabung sebagai penyedia layanan (hotel, visa, tiket, dan kategori lainnya) untuk Travel di ekosistem Segaloka.</p>

        <form action={formAction} className="mt-6 space-y-4">
          <div>
            <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-text-secondary">Nama Vendor</label>
            <Input name="name" required placeholder="cth. Zamzam Tower Hospitality" />
          </div>
          <div>
            <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-text-secondary">Nama Badan Hukum</label>
            <Input name="legal_name" placeholder="cth. PT Zamzam Hospitality Indonesia" />
          </div>
          <div>
            <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-text-secondary">Kategori</label>
            <Select name="category_code" required defaultValue="">
              <option value="" disabled>Pilih kategori</option>
              {CATEGORIES.map((c) => (
                <option key={c.code} value={c.code}>{c.label}</option>
              ))}
            </Select>
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-text-secondary">Email Kontak</label>
              <Input name="contact_email" type="email" />
            </div>
            <div>
              <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-text-secondary">Telepon</label>
              <Input name="contact_phone" />
            </div>
          </div>

          <div className="rounded-md border border-warning/30 bg-warning-tint px-3 py-2.5 text-xs text-warning">
            Akun vendor baru berstatus <b>Menunggu Verifikasi</b> hingga ditinjau oleh tim Segaloka.
          </div>

          {state?.error && <p role="alert" className="rounded-md bg-danger-tint px-3 py-2 text-sm text-danger">{state.error}</p>}
          <SubmitButton />
        </form>
      </div>
    </div>
  );
}
