"use client";

import { updateDepartureStatusAction } from "../actions";

const OPTIONS = ["open", "almost_full", "full", "closed", "cancelled"];

export function DepartureStatusSelect({
  orgSlug,
  pkgId,
  departureId,
  status,
}: {
  orgSlug: string;
  pkgId: string;
  departureId: string;
  status: string;
}) {
  return (
    <form
      action={updateDepartureStatusAction}
      onChange={(e) => (e.currentTarget as HTMLFormElement).requestSubmit()}
    >
      <input type="hidden" name="org_slug" value={orgSlug} />
      <input type="hidden" name="pkg_id" value={pkgId} />
      <input type="hidden" name="departure_id" value={departureId} />
      <select
        name="status"
        defaultValue={status}
        className="h-8 rounded-md border border-border-strong bg-surface px-2 text-xs font-semibold capitalize outline-none focus:border-primary"
      >
        {OPTIONS.map((o) => (
          <option key={o} value={o}>
            {o.replace("_", " ")}
          </option>
        ))}
      </select>
    </form>
  );
}
