"use client";

import { useFormState, useFormStatus } from "react-dom";
import { createOfferAction } from "../actions";
import { Input, Textarea } from "@/components/ui/Field";

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <button type="submit" disabled={pending} className="h-10 rounded-md bg-primary px-5 text-sm font-semibold text-primary-fg hover:bg-primary-hover disabled:opacity-60">
      {pending ? "Mengirim…" : "Kirim Penawaran"}
    </button>
  );
}

export function OfferForm({ orgSlug, requestId }: { orgSlug: string; requestId: string }) {
  const [state, formAction] = useFormState(createOfferAction, null);

  return (
    <form action={formAction} className="space-y-4">
      <input type="hidden" name="org_slug" value={orgSlug} />
      <input type="hidden" name="request_id" value={requestId} />
      <div>
        <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-text-secondary">Harga Penawaran (total) *</label>
        <Input name="price" type="number" min={1} required />
      </div>
      <div>
        <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-text-secondary">Catatan Penawaran</label>
        <Textarea name="notes" placeholder="Jelaskan detail hotel, penerbangan, dan fasilitas yang ditawarkan." />
      </div>
      <div>
        <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-text-secondary">Berlaku selama (hari)</label>
        <Input name="expires_in_days" type="number" min={1} defaultValue={3} className="w-28" />
      </div>
      {state?.error && <p role="alert" className="rounded-md bg-danger-tint px-3 py-2 text-sm text-danger">{state.error}</p>}
      <SubmitButton />
    </form>
  );
}
