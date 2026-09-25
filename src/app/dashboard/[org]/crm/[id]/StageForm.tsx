"use client";

import { updateLeadStageAction } from "../actions";

const OPTIONS = ["new", "contacted", "qualified", "offer_sent", "won", "lost"];
const LABEL: Record<string, string> = { new: "Baru", contacted: "Dihubungi", qualified: "Qualified", offer_sent: "Penawaran Terkirim", won: "Menang", lost: "Hilang" };

export function StageForm({ orgSlug, leadId, stage }: { orgSlug: string; leadId: string; stage: string }) {
  return (
    <form action={updateLeadStageAction} onChange={(e) => (e.currentTarget as HTMLFormElement).requestSubmit()}>
      <input type="hidden" name="org_slug" value={orgSlug} />
      <input type="hidden" name="lead_id" value={leadId} />
      <select
        name="stage"
        defaultValue={stage}
        className="h-9 rounded-md border border-border-strong bg-surface px-2.5 text-sm font-semibold outline-none focus:border-primary"
      >
        {OPTIONS.map((o) => (
          <option key={o} value={o}>{LABEL[o]}</option>
        ))}
      </select>
    </form>
  );
}
