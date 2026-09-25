"use client";

import { useFormState, useFormStatus } from "react-dom";
import { createPackageAction } from "../actions";
import { Input, Select, Textarea } from "@/components/ui/Field";

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <button type="submit" disabled={pending} className="h-10 rounded-md bg-primary px-5 text-sm font-semibold text-primary-fg hover:bg-primary-hover disabled:opacity-60">
      {pending ? "Menyimpan…" : "Buat Paket"}
    </button>
  );
}

export function PackageForm({ orgSlug }: { orgSlug: string }) {
  const [state, formAction] = useFormState(createPackageAction, null);

  return (
    <form action={formAction} className="max-w-xl space-y-4">
      <input type="hidden" name="org_slug" value={orgSlug} />
      <div>
        <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-text-secondary">Nama Paket *</label>
        <Input name="name" required placeholder="cth. Umrah Reguler 9 Hari" />
      </div>
      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-text-secondary">Tipe Paket *</label>
          <Select name="type" required defaultValue="">
            <option value="" disabled>Pilih tipe</option>
            <option value="umrah">Umrah</option>
            <option value="haji">Haji</option>
            <option value="halal_tour">Halal Tour</option>
            <option value="tour">Tour</option>
          </Select>
        </div>
        <div>
          <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-text-secondary">Durasi (hari) *</label>
          <Input name="duration_days" type="number" min={1} required />
        </div>
      </div>
      <div>
        <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-text-secondary">Harga Mulai (per jamaah) *</label>
        <Input name="base_price" type="number" min={1} required placeholder="cth. 28000000" />
      </div>
      <div>
        <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-text-secondary">Deskripsi</label>
        <Textarea name="description" placeholder="Ringkasan itinerary, fasilitas, dan keunggulan paket." />
      </div>

      <p className="text-xs text-muted">
        Paket baru berstatus Draft. Publikasikan dari halaman detail agar tampil di website Travel — tidak perlu input ulang.
      </p>

      {state?.error && <p role="alert" className="rounded-md bg-danger-tint px-3 py-2 text-sm text-danger">{state.error}</p>}
      <SubmitButton />
    </form>
  );
}
