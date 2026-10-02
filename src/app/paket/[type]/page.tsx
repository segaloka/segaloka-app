import Link from "next/link";
import { PublicNav, PublicFooter } from "@/components/layout/PublicNav";
import { createClient } from "@/lib/supabase/server";
import { formatIDR } from "@/lib/utils";
import { EmptyState } from "@/components/ui/EmptyState";

const LABELS: Record<string, string> = {
  umrah: "Umrah",
  haji: "Haji",
  halal_tour: "Halal Tour",
  tour: "Tour",
};

type SearchParams = {
  origin?: string;
  destination?: string;
  from?: string;
  to?: string;
  travelers?: string;
  scope?: string;
  travel?: string;
};

export default async function PackageTypePage({
  params,
  searchParams,
}: {
  params: { type: string };
  searchParams: SearchParams;
}) {
  const label = LABELS[params.type] ?? params.type;
  const supabase = await createClient();

  const { data: packages } = await supabase
    .from("packages")
    .select("id, name, slug, duration_days, base_price, organizations(name, slug), departures(departure_date, return_date, status)")
    .eq("status", "published")
    .eq("type", params.type)
    .order("created_at", { ascending: false });

  const normalizedDestination = searchParams.destination?.trim().toLowerCase();
  const normalizedTravel = searchParams.travel?.trim().toLowerCase();

  const filteredPackages = (packages ?? []).filter((pkg) => {
    const organizationName = (pkg.organizations as { name?: string | null } | null)?.name?.toLowerCase() ?? "";
    const searchableText = [pkg.name, pkg.description, organizationName]
      .filter(Boolean)
      .join(" ")
      .toLowerCase();

    if (normalizedDestination && !searchableText.includes(normalizedDestination)) {
      return false;
    }

    if (normalizedTravel && !organizationName.includes(normalizedTravel)) {
      return false;
    }

    if (searchParams.from || searchParams.to) {
      const departures = (pkg.departures ?? []) as Array<{
        departure_date: string;
        return_date: string | null;
        status: string;
      }>;

      const matchesDate = departures.some((departure) => {
        if (!["open", "almost_full"].includes(departure.status)) return false;
        if (searchParams.from && departure.departure_date < searchParams.from) return false;
        if (searchParams.to && departure.departure_date > searchParams.to) return false;
        return true;
      });

      if (!matchesDate) return false;
    }

    return true;
  });

  const context = [
    searchParams.origin ? `Dari ${searchParams.origin}` : null,
    searchParams.destination ? `Tujuan ${searchParams.destination}` : null,
    searchParams.from ? `Mulai ${searchParams.from}` : null,
    searchParams.to ? `Sampai ${searchParams.to}` : null,
    searchParams.travelers ? `${searchParams.travelers} traveler` : null,
    searchParams.travel ? `Travel ${searchParams.travel}` : null,
  ].filter((item): item is string => Boolean(item));

  return (
    <div className="min-h-screen bg-bg">
      <PublicNav />

      <div className="mx-auto max-w-6xl px-4 py-10">
        <p className="text-xs font-bold uppercase tracking-wider text-primary">
          Katalog Paket
        </p>

        <h1 className="mt-1 font-display text-2xl font-bold text-text-primary">
          Paket {label}
        </h1>

        <p className="mt-1 text-sm text-text-secondary">
          {filteredPackages.length} paket sesuai pencarian dari Travel terverifikasi.
        </p>

        {context.length > 0 && (
          <div className="mt-4 flex flex-wrap gap-2">
            {context.map((item) => (
              <span
                key={item}
                className="rounded-full border border-border bg-surface px-3 py-1.5 text-xs font-semibold text-text-secondary"
              >
                {item}
              </span>
            ))}
          </div>
        )}

        <div className="mt-6">
          {filteredPackages.length === 0 ? (
            <EmptyState
              title={`Belum ada paket ${label} yang dipublikasikan`}
              description="Coba ubah pencarian Anda atau ajukan kebutuhan perjalanan melalui SegaDeals."
            />
          ) : (
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {filteredPackages.map((pkg) => (
                <Link
                  key={pkg.id}
                  href={`/paket/detail/${pkg.slug}`}
                  className="rounded-xl border border-border bg-surface shadow-card transition hover:border-primary/40"
                >
                  <div className="aspect-[16/10] rounded-t-xl bg-gradient-to-br from-primary/20 to-secondary/20" />

                  <div className="p-4">
                    <p className="text-xs font-semibold uppercase tracking-wide text-muted">
                      {(pkg.organizations as any)?.name}
                    </p>

                    <p className="mt-1 font-display text-base font-bold text-text-primary">
                      {pkg.name}
                    </p>

                    <p className="mt-1 text-xs text-text-secondary">
                      {pkg.duration_days} hari
                    </p>

                    <p className="mt-2 text-base font-bold text-primary">
                      {formatIDR(pkg.base_price)}
                    </p>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
      </div>

      <PublicFooter />
    </div>
  );
}