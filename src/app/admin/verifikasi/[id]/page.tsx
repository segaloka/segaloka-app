import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { PageHeader } from "@/components/layout/PageHeader";
import { Card, CardBody, CardHeader } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { EmptyState } from "@/components/ui/EmptyState";
import { DocumentLink } from "@/components/ui/DocumentLink";
import { formatDate, formatDateTime } from "@/lib/utils";
import { verifyOrgAction } from "../actions";

export default async function AdminOrgVerificationDetailPage({ params }: { params: { id: string } }) {
  const supabase = await createClient();
  const { data: org } = await supabase.from("organizations").select("*").eq("id", params.id).single();
  if (!org) notFound();

  const { data: docs } = await supabase
    .from("documents")
    .select("id, category, file_url, file_name, status, created_at")
    .eq("owner_type", "organization")
    .eq("owner_id", org.id)
    .order("created_at", { ascending: false });

  return (
    <div>
      <PageHeader eyebrow="Verifikasi" title={org.name} actions={<Badge status={org.status} />} />

      <div className="grid gap-6 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardHeader><p className="font-display font-bold text-text-primary">Legalitas</p></CardHeader>
          <CardBody className="grid gap-3 sm:grid-cols-2 text-sm">
            <div><p className="text-xs text-muted">Nama Badan Hukum</p><p className="font-semibold text-text-primary">{org.legal_name ?? "—"}</p></div>
            <div><p className="text-xs text-muted">Jenis Izin</p><p className="font-semibold text-text-primary">{org.license_type}</p></div>
            <div><p className="text-xs text-muted">No. Izin</p><p className="font-semibold text-text-primary">{org.license_number ?? "—"}</p></div>
            <div><p className="text-xs text-muted">Kadaluarsa</p><p className="font-semibold text-text-primary">{org.license_expiry ? formatDate(org.license_expiry) : "—"}</p></div>
            <div><p className="text-xs text-muted">Email Dukungan</p><p className="font-semibold text-text-primary">{org.support_email ?? "—"}</p></div>
            <div><p className="text-xs text-muted">Telepon Dukungan</p><p className="font-semibold text-text-primary">{org.support_phone ?? "—"}</p></div>
            <div className="sm:col-span-2"><p className="text-xs text-muted">Alamat</p><p className="text-text-secondary">{org.address ?? "—"}</p></div>
            <div><p className="text-xs text-muted">Terdaftar</p><p className="text-text-secondary">{formatDateTime(org.created_at)}</p></div>
          </CardBody>
        </Card>

        <Card>
          <CardHeader><p className="font-display font-bold text-text-primary">Tindakan</p></CardHeader>
          <CardBody className="space-y-2">
            {org.status === "pending_verification" && (
              <>
                <form action={verifyOrgAction}>
                  <input type="hidden" name="org_id" value={org.id} />
                  <input type="hidden" name="status" value="active" />
                  <button className="h-10 w-full rounded-md bg-success px-4 text-sm font-semibold text-white hover:opacity-90">Setujui & Aktifkan</button>
                </form>
                <form action={verifyOrgAction}>
                  <input type="hidden" name="org_id" value={org.id} />
                  <input type="hidden" name="status" value="rejected" />
                  <button className="h-10 w-full rounded-md border border-danger/40 px-4 text-sm font-semibold text-danger hover:bg-danger-tint">Tolak</button>
                </form>
              </>
            )}
            {org.status === "active" && (
              <form action={verifyOrgAction}>
                <input type="hidden" name="org_id" value={org.id} />
                <input type="hidden" name="status" value="suspended" />
                <button className="h-10 w-full rounded-md border border-danger/40 px-4 text-sm font-semibold text-danger hover:bg-danger-tint">Suspend</button>
              </form>
            )}
            {(org.status === "suspended" || org.status === "rejected") && (
              <form action={verifyOrgAction}>
                <input type="hidden" name="org_id" value={org.id} />
                <input type="hidden" name="status" value="active" />
                <button className="h-10 w-full rounded-md bg-success px-4 text-sm font-semibold text-white hover:opacity-90">Aktifkan Kembali</button>
              </form>
            )}
          </CardBody>
        </Card>
      </div>

      <div className="mt-6">
        <p className="mb-3 font-display text-sm font-bold text-text-primary">Dokumen Legalitas</p>
        {!docs || docs.length === 0 ? (
          <EmptyState title="Belum ada dokumen diunggah" description="Travel belum mengunggah dokumen legalitas pendukung." />
        ) : (
          <div className="space-y-2">
            {docs.map((d) => (
              <div key={d.id} className="flex items-center justify-between rounded-md border border-border px-3 py-2.5 text-sm">
                <div>
                  <p className="font-semibold capitalize text-text-primary">{d.category.replace(/_/g, " ")}</p>
                  <p className="text-xs text-muted">{formatDateTime(d.created_at)}</p>
                </div>
                <div className="flex items-center gap-3">
                  <DocumentLink path={d.file_url} name={d.file_name ?? "Berkas"} />
                  <Badge status={d.status} />
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
