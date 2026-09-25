import { createClient } from "@/lib/supabase/server";
import { requireUser } from "@/lib/auth";
import { PageHeader } from "@/components/layout/PageHeader";
import { EmptyState } from "@/components/ui/EmptyState";
import { formatDateTime, cx } from "@/lib/utils";
import { markReadAction, markAllReadAction } from "./actions";

export default async function NotifikasiPage() {
  const user = await requireUser();
  const supabase = await createClient();
  const { data } = await supabase
    .from("notifications")
    .select("*")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false })
    .limit(50);

  const rows = data ?? [];
  const unread = rows.filter((r) => !r.read_at).length;

  return (
    <div>
      <PageHeader
        eyebrow="Traveler"
        title="Notifikasi"
        description={unread > 0 ? `${unread} belum dibaca` : "Semua sudah dibaca"}
        actions={
          unread > 0 ? (
            <form action={markAllReadAction}>
              <button className="h-9 rounded-md border border-border-strong px-3 text-sm font-semibold text-text-secondary hover:bg-bg">
                Tandai semua dibaca
              </button>
            </form>
          ) : undefined
        }
      />
      {rows.length === 0 ? (
        <EmptyState title="Belum ada notifikasi" description="Pemberitahuan booking, pembayaran, dan SegaDeals akan muncul di sini." />
      ) : (
        <div className="divide-y divide-border rounded-lg border border-border bg-surface">
          {rows.map((n) => (
            <form key={n.id} action={markReadAction} className={cx("flex items-start gap-3 px-4 py-3", !n.read_at && "bg-primary/5")}>
              <input type="hidden" name="id" value={n.id} />
              <div className={cx("mt-1.5 h-2 w-2 flex-none rounded-full", !n.read_at ? "bg-primary" : "bg-transparent")} />
              <div className="flex-1">
                <p className="text-sm font-semibold text-text-primary">{n.title}</p>
                {n.body && <p className="text-sm text-text-secondary">{n.body}</p>}
                <p className="mt-1 text-xs text-muted">{formatDateTime(n.created_at)}</p>
              </div>
              {!n.read_at && (
                <button className="text-xs font-semibold text-primary hover:underline">Tandai dibaca</button>
              )}
            </form>
          ))}
        </div>
      )}
    </div>
  );
}
