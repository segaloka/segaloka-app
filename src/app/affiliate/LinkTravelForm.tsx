"use client";

import { useFormState, useFormStatus } from "react-dom";
import { linkToTravelAction } from "./actions";
import { Input } from "@/components/ui/Field";

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <button type="submit" disabled={pending} className="h-9 rounded-md bg-primary px-4 text-sm font-semibold text-primary-fg hover:bg-primary-hover disabled:opacity-60">
      {pending ? "Menghubungkan…" : "Hubungkan"}
    </button>
  );
}

export function LinkTravelForm() {
  const [state, formAction] = useFormState(linkToTravelAction, null);

  return (
    <form action={formAction} className="flex flex-wrap items-end gap-3 rounded-lg border border-dashed border-border-strong p-4">
      <div>
        <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-text-secondary">Slug Travel</label>
        <Input name="org_slug" required placeholder="cth. nurul-iman-tour" className="w-56" />
      </div>
      <SubmitButton />
      {state?.error && <p className="w-full text-sm text-danger">{state.error}</p>}
    </form>
  );
}
