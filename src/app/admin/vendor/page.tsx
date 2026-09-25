import { createClient } from "@/lib/supabase/server";
import { PageHeader } from "@/components/layout/PageHeader";
import { Badge } from "@/components/ui/Badge";
import { EmptyState } from "@/components/ui/EmptyState";
import { formatDate } from "@/lib/utils";
import { verifyVendorAction } from "./actions";

export default async function AdminVendorPage() {
  const supabase = await createClient();
  const { data: vendors } = await supabase
    .from("vendors")
    .select("id, name, legal_name, category_code, status, contact_email, contact_phone, created_at")
    .order("created_at", { ascending: false });

  return (
    <div>
      <PageHeader eyebrow="Verifikasi" title="Verifikasi Vendor" description="Tinjau vendor (hotel, visa, tiket, dan kategori lainnya) yang mendaftar di Segaloka." />
      {!vendors || vendors.length === 0 ? (
        <EmptyState title="Belum ada vendor terdaftar" />
      ) : (
        <div className="space-y-3">
          {vendors.map((v) => (
            <div key={v.id} className="flex flex-wrap items-center justify-between gap-3 rounded-lg border border-border bg-surface p-4">
              <div>
                <div className="flex items-center gap-2">
                  <p className="font-semibold text-text-primary">{v.name}</p>
                  <Badge status={v.status} />
                </div>
                <p className="text-xs text-muted capitalize">{v.category_code ?? "—"} · {v.legal_name ?? "—"}</p>
                <p className="text-xs text-muted">{[v.contact_email, v.contact_phone].filter(Boolean).join(" · ")} · daftar {formatDate(v.created_at)}</p>
              </div>
              {v.status === "pending_verification" && (
                <div className="flex gap-2">
                  <form action={verifyVendorAction}>
                    <input type="hidden" name="vendor_id" value={v.id} />
                    <input type="hidden" name="status" value="active" />
                    <button className="h-9 rounded-md bg-success px-4 text-xs font-semibold text-white hover:opacity-90">Setujui</button>
                  </form>
                  <form action={verifyVendorAction}>
                    <input type="hidden" name="vendor_id" value={v.id} />
                    <input type="hidden" name="status" value="suspended" />
                    <button className="h-9 rounded-md border border-danger/40 px-4 text-xs font-semibold text-danger hover:bg-danger-tint">Tolak</button>
                  </form>
                </div>
              )}
              {v.status === "active" && (
                <form action={verifyVendorAction}>
                  <input type="hidden" name="vendor_id" value={v.id} />
                  <input type="hidden" name="status" value="suspended" />
                  <button className="h-9 rounded-md border border-danger/40 px-4 text-xs font-semibold text-danger hover:bg-danger-tint">Suspend</button>
                </form>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
