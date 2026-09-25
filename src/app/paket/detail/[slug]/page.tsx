import Link from "next/link";
import { notFound } from "next/navigation";
import { PublicNav, PublicFooter } from "@/components/layout/PublicNav";
import { createClient } from "@/lib/supabase/server";
import { formatIDR, formatDate } from "@/lib/utils";
import { Badge } from "@/components/ui/Badge";
import { EmptyState } from "@/components/ui/EmptyState";
import { WishlistButton } from "@/components/WishlistButton";

export default async function PackageDetailPage({ params }: { params: { slug: string } }) {
  const supabase = await createClient();
  const { data: pkg } = await supabase
    .from("packages")
    .select("*, organizations(name, slug, support_phone, support_email)")
    .eq("slug", params.slug)
    .eq("status", "published")
    .single();

  if (!pkg) notFound();

  const { data: departures } = await supabase
    .from("departures")
    .select("*")
    .eq("package_id", pkg.id)
    .in("status", ["open", "almost_full"])
    .order("departure_date", { ascending: true });

  const inclusions = Array.isArray(pkg.inclusions) ? (pkg.inclusions as string[]) : [];
  const exclusions = Array.isArray(pkg.exclusions) ? (pkg.exclusions as string[]) : [];
  const org = pkg.organizations as any;

  const {
    data: { user },
  } = await supabase.auth.getUser();
  let saved = false;
  if (user) {
    const { data: w } = await supabase.from("wishlists").select("id").eq("user_id", user.id).eq("package_id", pkg.id).maybeSingle();
    saved = Boolean(w);
  }

  return (
    <div className="min-h-screen bg-bg">
      <PublicNav />
      <div className="mx-auto max-w-6xl px-4 py-8">
        <div className="aspect-[21/9] rounded-2xl bg-gradient-to-br from-primary/25 to-secondary/25" />

        <div className="mt-6 grid gap-8 lg:grid-cols-3">
          <div className="lg:col-span-2">
            <p className="text-xs font-semibold uppercase tracking-wide text-muted">
              <Link href={`/travel/${org?.slug}`} className="hover:text-primary">{org?.name}</Link>
            </p>
            <div className="mt-1 flex items-start justify-between gap-3">
              <h1 className="font-display text-2xl font-bold text-text-primary">{pkg.name}</h1>
              <WishlistButton packageId={pkg.id} initialSaved={saved} />
            </div>
            <p className="mt-1 text-sm text-text-secondary">{pkg.duration_days} hari</p>

            {pkg.description && <p className="mt-4 whitespace-pre-line text-sm leading-relaxed text-text-secondary">{pkg.description}</p>}

            {inclusions.length > 0 && (
              <div className="mt-6">
                <p className="font-display text-sm font-bold text-text-primary">Fasilitas Termasuk</p>
                <ul className="mt-2 grid gap-1.5 sm:grid-cols-2">
                  {inclusions.map((i, idx) => (
                    <li key={idx} className="flex items-start gap-2 text-sm text-text-secondary">
                      <span className="mt-1 h-1.5 w-1.5 flex-none rounded-full bg-success" /> {i}
                    </li>
                  ))}
                </ul>
              </div>
            )}
            {exclusions.length > 0 && (
              <div className="mt-4">
                <p className="font-display text-sm font-bold text-text-primary">Tidak Termasuk</p>
                <ul className="mt-2 grid gap-1.5 sm:grid-cols-2">
                  {exclusions.map((i, idx) => (
                    <li key={idx} className="flex items-start gap-2 text-sm text-text-secondary">
                      <span className="mt-1 h-1.5 w-1.5 flex-none rounded-full bg-muted" /> {i}
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>

          <div>
            <div className="rounded-xl border border-border bg-surface p-5 shadow-card">
              <p className="text-xs font-semibold uppercase tracking-wide text-muted">Mulai dari</p>
              <p className="mt-1 font-display text-2xl font-bold text-primary">{formatIDR(pkg.base_price)}</p>
              <p className="text-xs text-text-secondary">per jamaah</p>

              <div className="mt-4 space-y-2">
                <p className="text-xs font-bold uppercase tracking-wide text-text-secondary">Jadwal Keberangkatan</p>
                {!departures || departures.length === 0 ? (
                  <EmptyState title="Belum ada jadwal terbuka" description="Hubungi Travel untuk info jadwal berikutnya." />
                ) : (
                  departures.map((d) => (
                    <Link
                      key={d.id}
                      href={`/booking/baru?departure=${d.id}`}
                      className="flex items-center justify-between rounded-md border border-border px-3 py-2.5 text-sm hover:border-primary/50"
                    >
                      <div>
                        <p className="font-semibold text-text-primary">{formatDate(d.departure_date)}</p>
                        <p className="text-xs text-text-secondary">{d.quota - d.filled} kursi tersisa dari {d.quota}</p>
                      </div>
                      <Badge status={d.status} />
                    </Link>
                  ))
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
      <PublicFooter />
    </div>
  );
}
