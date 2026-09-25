import { notFound } from "next/navigation";
import { getOrgBySlug, hasPermission } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import { PageHeader } from "@/components/layout/PageHeader";
import { EmptyState, ForbiddenState } from "@/components/ui/EmptyState";
import { Select } from "@/components/ui/Field";
import { formatDate, formatDateTime } from "@/lib/utils";
import { generateManifestAction } from "../../actions";

export default async function ManifestDetailPage({ params }: { params: { org: string; departureId: string } }) {
  const org = await getOrgBySlug(params.org);
  if (!org) return null;
  const allowed = await hasPermission(org.id, "operations.manage");
  if (!allowed) return <ForbiddenState reason="Anda tidak memiliki izin operations.manage." />;

  const supabase = await createClient();
  const { data: departure } = await supabase
    .from("departures")
    .select("id, departure_date, packages!inner(name, org_id)")
    .eq("id", params.departureId)
    .eq("packages.org_id", org.id)
    .single();
  if (!departure) notFound();

  const { data: manifest } = await supabase
    .from("manifests")
    .select("id, template_type, generated_at, manifest_entries(*)")
    .eq("departure_id", departure.id)
    .order("generated_at", { ascending: false })
    .limit(1)
    .maybeSingle();

  const pkg = departure.packages as any;

  return (
    <div>
      <PageHeader eyebrow="Operasional" title={`Manifest — ${pkg?.name}`} description={`Keberangkatan ${formatDate(departure.departure_date)}`} />

      {!manifest ? (
        <div className="rounded-lg border border-dashed border-border-strong p-6">
          <p className="text-sm text-text-secondary">Belum ada manifest untuk keberangkatan ini. Buat manifest dari data jamaah yang bookingnya sudah terkonfirmasi.</p>
          <form action={generateManifestAction} className="mt-4 flex flex-wrap items-end gap-3">
            <input type="hidden" name="org_slug" value={params.org} />
            <input type="hidden" name="departure_id" value={departure.id} />
            <div>
              <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-text-secondary">Template</label>
              <Select name="template_type" defaultValue="standard" className="w-48">
                <option value="standard">Standard</option>
                <option value="siskopatuh">Siskopatuh</option>
                <option value="custom">Custom</option>
              </Select>
            </div>
            <button className="h-10 rounded-md bg-primary px-5 text-sm font-semibold text-primary-fg hover:bg-primary-hover">Generate Manifest</button>
          </form>
        </div>
      ) : (
        <div>
          <div className="mb-3 flex items-center justify-between">
            <p className="text-sm text-text-secondary">
              Template <b className="capitalize text-text-primary">{manifest.template_type}</b> · dibuat {formatDateTime(manifest.generated_at)}
            </p>
          </div>
          {(manifest.manifest_entries as any[]).length === 0 ? (
            <EmptyState title="Tidak ada jamaah" description="Belum ada booking terkonfirmasi untuk keberangkatan ini." />
          ) : (
            <div className="overflow-x-auto rounded-lg border border-border">
              <table className="w-full min-w-[560px] border-collapse text-sm">
                <thead>
                  <tr className="border-b border-border bg-bg text-left text-xs font-semibold uppercase tracking-wide text-muted">
                    <th className="px-4 py-3">Nama</th>
                    <th className="px-4 py-3">No. Paspor</th>
                    <th className="px-4 py-3">Tgl Lahir</th>
                    <th className="px-4 py-3">Gender</th>
                  </tr>
                </thead>
                <tbody>
                  {(manifest.manifest_entries as any[]).map((e) => (
                    <tr key={e.id} className="border-b border-border last:border-0">
                      <td className="px-4 py-3 font-semibold text-text-primary">{e.data?.full_name}</td>
                      <td className="px-4 py-3">{e.data?.passport_number ?? "—"}</td>
                      <td className="px-4 py-3">{e.data?.dob ? formatDate(e.data.dob) : "—"}</td>
                      <td className="px-4 py-3">{e.data?.gender ?? "—"}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
