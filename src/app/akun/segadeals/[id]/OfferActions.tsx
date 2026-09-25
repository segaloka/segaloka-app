"use client";

import { useFormState, useFormStatus } from "react-dom";
import { acceptOfferAction, declineOfferAction } from "./actions";

function Btn({ children, tone }: { children: React.ReactNode; tone: "primary" | "ghost" }) {
  const { pending } = useFormStatus();
  return (
    <button
      type="submit"
      disabled={pending}
      className={
        tone === "primary"
          ? "h-9 rounded-md bg-primary px-4 text-sm font-semibold text-primary-fg hover:bg-primary-hover disabled:opacity-60"
          : "h-9 rounded-md border border-border-strong px-4 text-sm font-semibold text-text-secondary hover:bg-bg disabled:opacity-60"
      }
    >
      {pending ? "Memproses…" : children}
    </button>
  );
}

export function OfferActions({ offerId, requestId }: { offerId: string; requestId: string }) {
  const [acceptState, acceptFormAction] = useFormState(acceptOfferAction, null);
  const [, declineFormAction] = useFormState(declineOfferAction, null);

  return (
    <div className="flex items-center gap-2">
      <form action={acceptFormAction}>
        <input type="hidden" name="offer_id" value={offerId} />
        <Btn tone="primary">Terima Penawaran</Btn>
      </form>
      <form action={declineFormAction}>
        <input type="hidden" name="offer_id" value={offerId} />
        <input type="hidden" name="request_id" value={requestId} />
        <Btn tone="ghost">Tolak</Btn>
      </form>
      {acceptState?.error && <p className="text-xs text-danger">{acceptState.error}</p>}
    </div>
  );
}
