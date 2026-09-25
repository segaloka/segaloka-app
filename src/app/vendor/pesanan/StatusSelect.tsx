"use client";

import { updateOrderStatusAction } from "./actions";

const OPTIONS = ["draft", "sent", "confirmed", "paid", "cancelled"];

export function StatusSelect({ orderId, status }: { orderId: string; status: string }) {
  return (
    <form action={updateOrderStatusAction} onChange={(e) => (e.currentTarget as HTMLFormElement).requestSubmit()}>
      <input type="hidden" name="order_id" value={orderId} />
      <select name="status" defaultValue={status} className="h-8 rounded-md border border-border-strong bg-surface px-2 text-xs font-semibold capitalize outline-none focus:border-primary">
        {OPTIONS.map((o) => (
          <option key={o} value={o}>{o}</option>
        ))}
      </select>
    </form>
  );
}
