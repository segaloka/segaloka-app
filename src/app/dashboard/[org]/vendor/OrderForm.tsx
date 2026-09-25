"use client";

import { useFormState, useFormStatus } from "react-dom";
import { createVendorOrderAction } from "./actions";
import { Input, Select } from "@/components/ui/Field";

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <button type="submit" disabled={pending} className="h-9 rounded-md bg-primary px-4 text-sm font-semibold text-primary-fg hover:bg-primary-hover disabled:opacity-60">
      {pending ? "Membuat…" : "Buat Pesanan"}
    </button>
  );
}

export function OrderForm({ orgSlug, vendors }: { orgSlug: string; vendors: { id: string; name: string }[] }) {
  const [state, formAction] = useFormState(createVendorOrderAction, null);
  if (vendors.length === 0) return null;

  return (
    <form action={formAction} className="flex flex-wrap items-end gap-3 rounded-lg border border-dashed border-border-strong p-4">
      <input type="hidden" name="org_slug" value={orgSlug} />
      <div>
        <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-text-secondary">Vendor</label>
        <Select name="vendor_id" required defaultValue="" className="w-56">
          <option value="" disabled>Pilih vendor</option>
          {vendors.map((v) => (
            <option key={v.id} value={v.id}>{v.name}</option>
          ))}
        </Select>
      </div>
      <div className="flex-1">
        <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-text-secondary">Item Pesanan</label>
        <Input name="item" required placeholder="cth. 40 kamar Hotel Zamzam Tower, 5-13 Mar" />
      </div>
      <div>
        <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-text-secondary">Jumlah</label>
        <Input name="amount" type="number" min={1} required className="w-36" />
      </div>
      <SubmitButton />
      {state?.error && <p className="w-full text-sm text-danger">{state.error}</p>}
    </form>
  );
}
