"use client";

import { updateBookingStatusAction } from "./actions";

const OPTIONS = ["pending", "confirmed", "cancelled", "completed"];

export function BookingStatusForm({ orgSlug, bookingId, status }: { orgSlug: string; bookingId: string; status: string }) {
  return (
    <form action={updateBookingStatusAction} onChange={(e) => (e.currentTarget as HTMLFormElement).requestSubmit()}>
      <input type="hidden" name="org_slug" value={orgSlug} />
      <input type="hidden" name="booking_id" value={bookingId} />
      <select
        name="status"
        defaultValue={status}
        className="h-9 rounded-md border border-border-strong bg-surface px-2.5 text-sm font-semibold capitalize outline-none focus:border-primary"
      >
        {OPTIONS.map((o) => (
          <option key={o} value={o}>{o}</option>
        ))}
      </select>
    </form>
  );
}
