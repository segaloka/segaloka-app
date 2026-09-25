"use client";

import { useFormState, useFormStatus } from "react-dom";
import { createLeadAction } from "../actions";
import { Input, Select } from "@/components/ui/Field";

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <button type="submit" disabled={pending} className="h-10 rounded-md bg-primary px-5 text-sm font-semibold text-primary-fg hover:bg-primary-hover disabled:opacity-60">
      {pending ? "Menyimpan…" : "Simpan Lead"}
    </button>
  );
}

export function LeadForm({ orgSlug }: { orgSlug: string }) {
  const [state, formAction] = useFormState(createLeadAction, null);

  return (
    <form action={formAction} className="max-w-lg space-y-4">
      <input type="hidden" name="org_slug" value={orgSlug} />
      <div>
        <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-text-secondary">Nama *</label>
        <Input name="name" required />
      </div>
      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-text-secondary">Nomor WhatsApp</label>
          <Input name="phone" placeholder="08xx-xxxx-xxxx" />
        </div>
        <div>
          <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-text-secondary">Email</label>
          <Input name="email" type="email" />
        </div>
      </div>
      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-text-secondary">Sumber</label>
          <Select name="source" defaultValue="manual">
            <option value="manual">Input Manual</option>
            <option value="website">Website</option>
            <option value="whatsapp">WhatsApp</option>
            <option value="referral">Referral</option>
            <option value="affiliate">Affiliate</option>
            <option value="mitra">Mitra</option>
          </Select>
        </div>
        <div>
          <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-text-secondary">Minat Produk</label>
          <Select name="interest_type" defaultValue="">
            <option value="">Belum ditentukan</option>
            <option value="umrah">Umrah</option>
            <option value="haji">Haji</option>
            <option value="halal_tour">Halal Tour</option>
            <option value="tour">Tour</option>
          </Select>
        </div>
      </div>
      {state?.error && <p role="alert" className="rounded-md bg-danger-tint px-3 py-2 text-sm text-danger">{state.error}</p>}
      <SubmitButton />
    </form>
  );
}
