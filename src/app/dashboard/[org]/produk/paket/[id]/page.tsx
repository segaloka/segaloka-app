import { notFound } from "next/navigation";
import { getOrgBySlug, hasPermission } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import { PageHeader } from "@/components/layout/PageHeader";
import { Badge } from "@/components/ui/Badge";
import { EmptyState, ForbiddenState } from "@/components/ui/EmptyState";
import { formatDate, formatIDR } from "@/lib/utils";
import { EditPackageForm } from "./EditPackageForm";
import { DepartureForm } from "./DepartureForm";
import { DepartureStatusSelect } from "./DepartureStatusSelect";
import { togglePublishAction } from "../actions";

export default async function PaketDetailPage({ params }: { params: { org: string; id: string } }) {
  const org = await getOrgBySlug(params.org);
  if (!org) return null;
  const allowed = await hasPermission(org.id, "package.manage");
  if (!allowed) return <ForbiddenState reason="Anda tidak memiliki izin package.manage." />;
  const canPublish = await hasPermission(org.id, "package.publish");

  const supabase = await createClient();
  const { data: pkg } = await supabase.from("packages").select("*").eq("id", params.id).eq("org_id", org.id).single();
  if (!pkg) notFound();

  const { data: departures } = await supabase
    .from("departures")
    .select("*")
    .eq("package_id", pkg.id)
    .order("departure_date", { ascending: true });

  const inclusions = Array.isArray(pkg.inclusions) ? (pkg.inclusions as string[]) : [];
  const exclusions = Array.isArray(pkg.exclusions) ? (pkg.exclusions as string[]) : [];

  return (
    <div>
      <PageHeader
        eyebrow="Produk"
        title={pkg.name}
        description="Kelola detail paket dan jadwal keberangkatan."
        actions={
          <div className="flex items-center gap-2">
            <Badge status={pkg.status} />
            {canPublish && pkg.status === "draft" && (
              <form action={togglePublishAction}>
                <input type="hidden" name="org_slug" value={params.org} />
                <input type="hidden" name="pkg_id" value={pkg.id} />
                <input type="hidden" name="next_status" value="published" />
                <button
                  disabled={org.status !== "active"}
                  className="h-9 rounded-md bg-primary px-4 text-sm font-semibold text-primary-fg hover:bg-primary-hover disabled:opacity-50"
                  title={org.status !== "active" ? "Travel harus terverifikasi sebelum dapat publish paket" : undefined}
                >
                  Publish ke Website
                </button>
              </form>
            )}
            {canPublish && pkg.status === "published" && (
              <form action={togglePublishAction}>
                <input type="hidden" name="org_slug" value={params.org} />
                <input type="hidden" name="pkg_id" value={pkg.id} />
                <input type="hidden" name="next_status" value="archived" />
                <button className="h-9 rounded-md border border-border-strong px-4 text-sm font-semibold text-text-secondary hover:bg-bg">
                  Tarik dari Website
                </button>
              </form>
            )}
          </div>
        }
      />

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <div className="rounded-lg border border-border bg-surface p-5">
            <EditPackageForm
              orgSlug={params.org}
              pkgId={pkg.id}
              name={pkg.name}
              durationDays={pkg.duration_days}
              basePrice={Number(pkg.base_price)}
              description={pkg.description ?? ""}
              inclusions={inclusions}
              exclusions={exclusions}
            />
          </div>
        </div>
        <div className="rounded-lg border border-border bg-surface p-5">
          <p className="font-display text-sm font-bold text-text-primary">Ringkasan</p>
          <dl className="mt-3 space-y-2 text-sm">
            <div className="flex justify-between"><dt className="text-text-secondary">Tipe</dt><dd className="font-semibold text-text-primary capitalize">{pkg.type.replace("_", " ")}</dd></div>
            <div className="flex justify-between"><dt className="text-text-secondary">Harga Mulai</dt><dd className="font-semibold text-text-primary">{formatIDR(pkg.base_price)}</dd></div>
            <div className="flex justify-between"><dt className="text-text-secondary">Total Jadwal</dt><dd className="font-semibold text-text-primary">{departures?.length ?? 0}</dd></div>
          </dl>
          {pkg.status === "published" && (
            <p className="mt-3 rounded-md bg-success-tint px-3 py-2 text-xs text-success">
              Paket ini tampil otomatis di website Travel dan katalog publik Segaloka — tanpa perlu input ulang.
            </p>
          )}
        </div>
      </div>

      <div className="mt-6">
        <p className="mb-3 font-display text-sm font-bold text-text-primary">Jadwal Keberangkatan</p>
        <DepartureForm orgSlug={params.org} pkgId={pkg.id} />

        <div className="mt-4">
          {!departures || departures.length === 0 ? (
            <EmptyState title="Belum ada jadwal" description="Tambahkan jadwal keberangkatan agar paket dapat dipesan." />
          ) : (
            <div className="overflow-x-auto rounded-lg border border-border">
              <table className="w-full min-w-[640px] border-collapse text-sm">
                <thead>
                  <tr className="border-b border-border bg-bg text-left text-xs font-semibold uppercase tracking-wide text-muted">
                    <th className="px-4 py-3">Berangkat</th>
                    <th className="px-4 py-3">Pulang</th>
                    <th className="px-4 py-3">Kuota</th>
                    <th className="px-4 py-3">Terisi</th>
                    <th className="px-4 py-3">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {departures.map((d) => (
                    <tr key={d.id} className="border-b border-border last:border-0">
                      <td className="px-4 py-3 font-semibold text-text-primary">{formatDate(d.departure_date)}</td>
                      <td className="px-4 py-3">{formatDate(d.return_date)}</td>
                      <td className="px-4 py-3">{d.quota}</td>
                      <td className="px-4 py-3">{d.filled}</td>
                      <td className="px-4 py-3">
                        <DepartureStatusSelect orgSlug={params.org} pkgId={pkg.id} departureId={d.id} status={d.status} />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
