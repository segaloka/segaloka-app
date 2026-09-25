"use client";

import { useFormState, useFormStatus } from "react-dom";
import { linkVendorAction } from "./actions";
import { Input, Select } from "@/components/ui/Field";

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <button type="submit" disabled={pending} className="h-9 rounded-md bg-primary px-4 text-sm font-semibold text-primary-fg hover:bg-primary-hover disabled:opacity-60">
      {pending ? "Menghubungkan…" : "Hubungkan Vendor"}
    </button>
  );
}

export function LinkVendorForm({ orgSlug, vendors }: { orgSlug: string; vendors: { id: string; name: string; category_code: string | null }[] }) {
  const [state, formAction] = useFormState(linkVendorAction, null);

  if (vendors.length === 0) return <p className="text-xs text-muted">Tidak ada vendor aktif yang tersedia untuk dihubungkan saat ini.</p>;

  return (
    <form action={formAction} className="flex flex-wrap items-end gap-3 rounded-lg border border-dashed border-border-strong p-4">
      <input type="hidden" name="org_slug" value={orgSlug} />
      <div>
        <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-text-secondary">Vendor</label>
        <Select name="vendor_id" required defaultValue="" className="w-56">
          <option value="" disabled>Pilih vendor</option>
          {vendors.map((v) => (
            <option key={v.id} value={v.id}>{v.name} {v.category_code ? `(${v.category_code})` : ""}</option>
          ))}
        </Select>
      </div>
      <div>
        <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-text-secondary">Tipe Fee</label>
        <Select name="fee_type" defaultValue="percentage" className="w-36">
          <option value="percentage">Persentase</option>
          <option value="fixed">Tetap</option>
          <option value="contract">Kontrak</option>
        </Select>
      </div>
      <div>
        <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-text-secondary">Nilai Fee</label>
        <Input name="fee_value" type="number" min={0} step="0.01" className="w-28" required />
      </div>
      <SubmitButton />
      {state?.error && <p className="w-full text-sm text-danger">{state.error}</p>}
    </form>
  );
}
