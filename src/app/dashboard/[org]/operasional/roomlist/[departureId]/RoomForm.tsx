"use client";

import { useFormState, useFormStatus } from "react-dom";
import { createRoomAction } from "../../actions";
import { Input } from "@/components/ui/Field";

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <button type="submit" disabled={pending} className="h-9 rounded-md bg-primary px-4 text-sm font-semibold text-primary-fg hover:bg-primary-hover disabled:opacity-60">
      {pending ? "Menambah…" : "+ Tambah Kamar"}
    </button>
  );
}

export function RoomForm({ orgSlug, departureId }: { orgSlug: string; departureId: string }) {
  const [state, formAction] = useFormState(createRoomAction, null);

  return (
    <form action={formAction} className="flex flex-wrap items-end gap-3 rounded-lg border border-dashed border-border-strong p-4">
      <input type="hidden" name="org_slug" value={orgSlug} />
      <input type="hidden" name="departure_id" value={departureId} />
      <div>
        <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-text-secondary">Hotel</label>
        <Input name="hotel_name" placeholder="cth. Hilton Makkah" />
      </div>
      <div>
        <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-text-secondary">Tipe Kamar</label>
        <Input name="room_type" placeholder="cth. Quad" className="w-32" />
      </div>
      <div>
        <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-text-secondary">No. Kamar</label>
        <Input name="room_number" className="w-28" />
      </div>
      <div>
        <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-text-secondary">Kapasitas</label>
        <Input name="capacity" type="number" min={1} defaultValue={2} className="w-24" required />
      </div>
      <SubmitButton />
      {state?.error && <p className="w-full text-sm text-danger">{state.error}</p>}
    </form>
  );
}
