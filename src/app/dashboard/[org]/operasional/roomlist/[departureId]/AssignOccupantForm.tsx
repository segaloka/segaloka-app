"use client";

import { assignRoomOccupantAction } from "../../actions";

export function AssignOccupantForm({
  orgSlug,
  departureId,
  roomId,
  unassigned,
}: {
  orgSlug: string;
  departureId: string;
  roomId: string;
  unassigned: { id: string; full_name: string }[];
}) {
  if (unassigned.length === 0) return <p className="text-xs text-muted">Semua jamaah sudah dialokasikan.</p>;

  return (
    <form action={assignRoomOccupantAction} className="flex items-center gap-2" onChange={(e) => (e.currentTarget as HTMLFormElement).requestSubmit()}>
      <input type="hidden" name="org_slug" value={orgSlug} />
      <input type="hidden" name="departure_id" value={departureId} />
      <input type="hidden" name="room_id" value={roomId} />
      <select name="passenger_id" defaultValue="" className="h-8 flex-1 rounded-md border border-border-strong bg-surface px-2 text-xs outline-none focus:border-primary">
        <option value="" disabled>+ Tambahkan jamaah…</option>
        {unassigned.map((p) => (
          <option key={p.id} value={p.id}>{p.full_name}</option>
        ))}
      </select>
    </form>
  );
}
