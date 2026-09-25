"use client";

import { useFormState, useFormStatus } from "react-dom";
import { savePageAction } from "./actions";
import { Input, Textarea } from "@/components/ui/Field";

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <button type="submit" disabled={pending} className="h-9 rounded-md bg-primary px-4 text-sm font-semibold text-primary-fg hover:bg-primary-hover disabled:opacity-60">
      {pending ? "Menyimpan…" : "Simpan Halaman"}
    </button>
  );
}

export function PageForm({ orgSlug, page }: { orgSlug: string; page?: { id: string; title: string; body: string } }) {
  const [state, formAction] = useFormState(savePageAction, null);

  return (
    <form action={formAction} className="space-y-3 rounded-lg border border-dashed border-border-strong p-4">
      <input type="hidden" name="org_slug" value={orgSlug} />
      {page && <input type="hidden" name="page_id" value={page.id} />}
      <div>
        <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-text-secondary">Judul Halaman</label>
        <Input name="title" defaultValue={page?.title} required placeholder="cth. Tentang Kami" />
      </div>
      <div>
        <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-text-secondary">Konten</label>
        <Textarea name="body" defaultValue={page?.body} placeholder="Tulis konten halaman…" />
      </div>
      {state?.error && <p className="text-sm text-danger">{state.error}</p>}
      <SubmitButton />
    </form>
  );
}
