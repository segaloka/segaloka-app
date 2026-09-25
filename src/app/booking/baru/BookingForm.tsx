"use client";

import { useState } from "react";
import { useFormState, useFormStatus } from "react-dom";
import { createBookingAction } from "./actions";
import { Input, Textarea } from "@/components/ui/Field";
import { formatIDR } from "@/lib/utils";

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <button type="submit" disabled={pending} className="h-11 w-full rounded-md bg-primary font-semibold text-primary-fg hover:bg-primary-hover disabled:opacity-60">
      {pending ? "Memproses…" : "Buat Booking"}
    </button>
  );
}

export function BookingForm({ departureId, basePrice, maxPax }: { departureId: string; basePrice: number; maxPax: number }) {
  const [state, formAction] = useFormState(createBookingAction, null);
  const [paxCount, setPaxCount] = useState(1);

  return (
    <form action={formAction} className="space-y-5">
      <input type="hidden" name="departure_id" value={departureId} />

      <div>
        <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-text-secondary">Jumlah Jamaah</label>
        <Input
          type="number"
          name="pax_count"
          min={1}
          max={maxPax}
          value={paxCount}
          onChange={(e) => setPaxCount(Math.max(1, Math.min(maxPax, Number(e.target.value) || 1)))}
        />
        <p className="mt-1 text-xs text-muted">Maksimal {maxPax} kursi tersedia pada jadwal ini.</p>
      </div>

      <div className="space-y-3">
        <p className="text-xs font-semibold uppercase tracking-wide text-text-secondary">Data Jamaah</p>
        {Array.from({ length: paxCount }).map((_, idx) => (
          <Input key={idx} name="passenger_name" required placeholder={`Nama lengkap jamaah ${idx + 1} (sesuai paspor)`} />
        ))}
      </div>

      <div>
        <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-text-secondary">Catatan (opsional)</label>
        <Textarea name="notes" placeholder="Permintaan khusus, kondisi kesehatan, dsb." />
      </div>

      <div className="rounded-md bg-bg px-4 py-3">
        <div className="flex items-center justify-between text-sm">
          <span className="text-text-secondary">Total Tagihan</span>
          <span className="font-display text-lg font-bold text-text-primary">{formatIDR(basePrice * paxCount)}</span>
        </div>
      </div>

      {state?.error && <p role="alert" className="rounded-md bg-danger-tint px-3 py-2 text-sm text-danger">{state.error}</p>}
      <SubmitButton />
    </form>
  );
}
