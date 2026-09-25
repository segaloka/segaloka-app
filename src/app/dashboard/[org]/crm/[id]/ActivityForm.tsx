"use client";

import { useFormState, useFormStatus } from "react-dom";
import { addLeadActivityAction } from "../actions";
import { Select, Textarea } from "@/components/ui/Field";

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <button type="submit" disabled={pending} className="h-9 rounded-md bg-primary px-4 text-sm font-semibold text-primary-fg hover:bg-primary-hover disabled:opacity-60">
      {pending ? "Menyimpan…" : "Tambah Catatan"}
    </button>
  );
}

export function ActivityForm({ orgSlug, leadId }: { orgSlug: string; leadId: string }) {
  const [state, formAction] = useFormState(addLeadActivityAction, null);

  return (
    <form action={formAction} className="space-y-2 rounded-lg border border-dashed border-border-strong p-4">
      <input type="hidden" name="org_slug" value={orgSlug} />
      <input type="hidden" name="lead_id" value={leadId} />
      <div className="flex gap-2">
        <Select name="type" defaultValue="note" className="w-40">
          <option value="note">Catatan</option>
          <option value="call">Telepon</option>
          <option value="whatsapp">WhatsApp</option>
          <option value="email">Email</option>
          <option value="task">Tugas</option>
        </Select>
      </div>
      <Textarea name="body" placeholder="Tulis catatan interaksi dengan lead ini…" required />
      {state?.error && <p className="text-xs text-danger">{state.error}</p>}
      <SubmitButton />
    </form>
  );
}
