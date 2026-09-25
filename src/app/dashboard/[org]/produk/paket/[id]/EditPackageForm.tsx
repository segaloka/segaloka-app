"use client";

import { useFormState, useFormStatus } from "react-dom";
import { updatePackageAction } from "../actions";
import { Input, Textarea } from "@/components/ui/Field";

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <button type="submit" disabled={pending} className="h-10 rounded-md bg-primary px-5 text-sm font-semibold text-primary-fg hover:bg-primary-hover disabled:opacity-60">
      {pending ? "Menyimpan…" : "Simpan Perubahan"}
    </button>
  );
}

export function EditPackageForm({
  orgSlug,
  pkgId,
  name,
  durationDays,
  basePrice,
  description,
  inclusions,
  exclusions,
}: {
  orgSlug: string;
  pkgId: string;
  name: string;
  durationDays: number;
  basePrice: number;
  description: string;
  inclusions: string[];
  exclusions: string[];
}) {
  const [state, formAction] = useFormState(updatePackageAction, null);

  return (
    <form action={formAction} className="space-y-4">
      <input type="hidden" name="org_slug" value={orgSlug} />
      <input type="hidden" name="pkg_id" value={pkgId} />
      <div>
        <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-text-secondary">Nama Paket</label>
        <Input name="name" defaultValue={name} required />
      </div>
      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-text-secondary">Durasi (hari)</label>
          <Input name="duration_days" type="number" min={1} defaultValue={durationDays} required />
        </div>
        <div>
          <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-text-secondary">Harga Mulai</label>
          <Input name="base_price" type="number" min={1} defaultValue={basePrice} required />
        </div>
      </div>
      <div>
        <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-text-secondary">Deskripsi</label>
        <Textarea name="description" defaultValue={description} />
      </div>
      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-text-secondary">Fasilitas Termasuk (satu per baris)</label>
          <Textarea name="inclusions" defaultValue={inclusions.join("\n")} />
        </div>
        <div>
          <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-text-secondary">Tidak Termasuk (satu per baris)</label>
          <Textarea name="exclusions" defaultValue={exclusions.join("\n")} />
        </div>
      </div>
      {state?.error && <p role="alert" className="rounded-md bg-danger-tint px-3 py-2 text-sm text-danger">{state.error}</p>}
      <SubmitButton />
    </form>
  );
}
