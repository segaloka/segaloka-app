import Image from "next/image";
import Link from "next/link";
import { PublicNav, PublicFooter } from "@/components/layout/PublicNav";
import { createClient } from "@/lib/supabase/server";
import { formatIDR, formatDate } from "@/lib/utils";
import { Icon } from "@/components/layout/Icon";

const SERVICES = [
  {
    type: "umrah",
    label: "Umrah",
    description: "Reguler, Plus & VIP",
    icon: "building" as const,
  },
  {
    type: "haji",
    label: "Haji",
    description: "Pilihan perjalanan Haji",
    icon: "route" as const,
  },
  {
    type: "halal_tour",
    label: "Halal Tour",
    description: "Wisata ramah muslim",
    icon: "globe" as const,
  },
  {
    type: "tour",
    label: "Tour",
    description: "Domestik & internasional",
    icon: "plane" as const,
  },
];

const SEGADEALS_STEPS = [
  "Sampaikan kebutuhan perjalanan",
  "Travel mengirim penawaran",
  "Bandingkan dan pilih penawaran",
];

type OrganizationRelation = {
  name: string;
  slug: string;
  status: string;
  logo_light_url: string | null;
  logo_dark_url: string | null;
} | null;

type DepartureRelation = {
  id: string;
  departure_date: string;
  return_date: string | null;
  quota: number;
  filled: number;
  status: string;
};

type MarketplacePackage = {
  id: string;
  name: string;
  slug: string;
  type: string;
  duration_days: number;
  base_price: number;
  organizations: OrganizationRelation;
  departures: DepartureRelation[];
};

function packageTypeLabel(type: string | null) {
  if (!type) return "Paket";
  if (type === "halal_tour") return "Halal Tour";
  return type.charAt(0).toUpperCase() + type.slice(1);
}

function packageIcon(type: string) {
  if (type === "umrah") return "building" as const;
  if (type === "haji") return "route" as const;
  if (type === "halal_tour") return "globe" as const;
  return "plane" as const;
}

function availableSeats(departure: DepartureRelation | undefined) {
  if (!departure) return null;
  return Math.max(0, departure.quota - departure.filled);
}

/**
 * TEMPORARY UI PREVIEW DATA
 *
 * Data ini hanya dipakai ketika Supabase belum mempunyai inventory marketplace
 * yang dapat ditampilkan. Jangan gunakan data ini sebagai sumber transaksi.
 * Hapus fallback ini setelah inventory production tersedia.
 */
const PREVIEW_PACKAGES: MarketplacePackage[] = [
  {
    id: "preview-umrah-01",
    name: "Umrah Reguler 9 Hari",
    slug: "preview-umrah-reguler-9-hari",
    type: "umrah",
    duration_days: 9,
    base_price: 28900000,
    organizations: {
      name: "Travel Amanah",
      slug: "travel-amanah",
      status: "active",
      logo_light_url: null,
      logo_dark_url: null,
    },
    departures: [
      {
        id: "preview-departure-01",
        departure_date: "2026-10-18",
        return_date: "2026-10-26",
        quota: 45,
        filled: 33,
        status: "open",
      },
    ],
  },
  {
    id: "preview-umrah-02",
    name: "Umrah Plus Thaif 12 Hari",
    slug: "preview-umrah-plus-thaif-12-hari",
    type: "umrah",
    duration_days: 12,
    base_price: 34500000,
    organizations: {
      name: "Nusantara Haramain",
      slug: "nusantara-haramain",
      status: "active",
      logo_light_url: null,
      logo_dark_url: null,
    },
    departures: [
      {
        id: "preview-departure-02",
        departure_date: "2026-11-03",
        return_date: "2026-11-14",
        quota: 45,
        filled: 17,
        status: "open",
      },
    ],
  },
  {
    id: "preview-haji-01",
    name: "Program Haji Pilihan",
    slug: "preview-program-haji-pilihan",
    type: "haji",
    duration_days: 25,
    base_price: 185000000,
    organizations: {
      name: "Safar Indonesia",
      slug: "safar-indonesia",
      status: "active",
      logo_light_url: null,
      logo_dark_url: null,
    },
    departures: [
      {
        id: "preview-departure-03",
        departure_date: "2027-05-08",
        return_date: "2027-06-01",
        quota: 40,
        filled: 31,
        status: "almost_full",
      },
    ],
  },
  {
    id: "preview-halal-01",
    name: "Halal Tour Turki 8 Hari",
    slug: "preview-halal-tour-turki-8-hari",
    type: "halal_tour",
    duration_days: 8,
    base_price: 23900000,
    organizations: {
      name: "Jelajah Muslim",
      slug: "jelajah-muslim",
      status: "active",
      logo_light_url: null,
      logo_dark_url: null,
    },
    departures: [
      {
        id: "preview-departure-04",
        departure_date: "2026-12-12",
        return_date: "2026-12-19",
        quota: 30,
        filled: 12,
        status: "open",
      },
    ],
  },
  {
    id: "preview-tour-01",
    name: "Explore Jepang 7 Hari",
    slug: "preview-explore-jepang-7-hari",
    type: "tour",
    duration_days: 7,
    base_price: 21900000,
    organizations: {
      name: "Langkah Dunia",
      slug: "langkah-dunia",
      status: "active",
      logo_light_url: null,
      logo_dark_url: null,
    },
    departures: [
      {
        id: "preview-departure-05",
        departure_date: "2027-01-16",
        return_date: "2027-01-22",
        quota: 30,
        filled: 8,
        status: "open",
      },
    ],
  },
  {
    id: "preview-umrah-03",
    name: "Umrah Awal Tahun 9 Hari",
    slug: "preview-umrah-awal-tahun-9-hari",
    type: "umrah",
    duration_days: 9,
    base_price: 30500000,
    organizations: {
      name: "Berkah Journey",
      slug: "berkah-journey",
      status: "active",
      logo_light_url: null,
      logo_dark_url: null,
    },
    departures: [
      {
        id: "preview-departure-06",
        departure_date: "2027-01-09",
        return_date: "2027-01-17",
        quota: 45,
        filled: 22,
        status: "open",
      },
    ],
  },
  {
    id: "preview-halal-02",
    name: "Halal Tour Korea 7 Hari",
    slug: "preview-halal-tour-korea-7-hari",
    type: "halal_tour",
    duration_days: 7,
    base_price: 24900000,
    organizations: {
      name: "Jelajah Muslim",
      slug: "jelajah-muslim",
      status: "active",
      logo_light_url: null,
      logo_dark_url: null,
    },
    departures: [
      {
        id: "preview-departure-07",
        departure_date: "2027-02-06",
        return_date: "2027-02-12",
        quota: 30,
        filled: 19,
        status: "open",
      },
    ],
  },
  {
    id: "preview-tour-02",
    name: "Explore Singapore & Malaysia",
    slug: "preview-singapore-malaysia",
    type: "tour",
    duration_days: 5,
    base_price: 8900000,
    organizations: {
      name: "Langkah Dunia",
      slug: "langkah-dunia",
      status: "active",
      logo_light_url: null,
      logo_dark_url: null,
    },
    departures: [
      {
        id: "preview-departure-08",
        departure_date: "2026-11-21",
        return_date: "2026-11-25",
        quota: 35,
        filled: 29,
        status: "almost_full",
      },
    ],
  },
];

export default async function HomePage() {
  const supabase = await createClient();

  const today = new Date().toISOString().slice(0, 10);

  const { data: packageRows } = await supabase
    .from("packages")
    .select(
      `
        id,
        name,
        slug,
        type,
        duration_days,
        base_price,
        created_at,
        organizations!inner(
          name,
          slug,
          status,
          logo_light_url,
          logo_dark_url
        ),
        departures(
          id,
          departure_date,
          return_date,
          quota,
          filled,
          status
        )
      `,
    )
    .eq("status", "published")
    .eq("organizations.status", "active")
    .order("created_at", { ascending: false })
    .limit(12);

  const marketplacePackages = ((packageRows ?? []) as unknown as MarketplacePackage[])
    .map((pkg) => ({
      ...pkg,
      departures: (pkg.departures ?? [])
        .filter(
          (departure) =>
            ["open", "almost_full"].includes(departure.status) &&
            departure.departure_date >= today,
        )
        .sort(
          (a, b) =>
            new Date(a.departure_date).getTime() -
            new Date(b.departure_date).getTime(),
        ),
    }))
    .slice(0, 8);

  const displayPackages =
    marketplacePackages.length > 0 ? marketplacePackages : PREVIEW_PACKAGES;

  const isPreviewInventory = marketplacePackages.length === 0;

  const upcomingPackages = displayPackages
    .filter((pkg) => pkg.departures.length > 0)
    .sort(
      (a, b) =>
        new Date(a.departures[0].departure_date).getTime() -
        new Date(b.departures[0].departure_date).getTime(),
    )
    .slice(0, 4);

  return (
    <div className="min-h-screen bg-[#f7f9fc]">
      <PublicNav />

      <main className="pb-16 md:pb-0">
        {/* TRAVEL MARKETPLACE HERO */}
        <section className="relative overflow-hidden border-b border-[#dfe9f4] bg-[#eaf4ff]">
          <div className="absolute inset-0 bg-[linear-gradient(105deg,#f8fcff_0%,#eef7ff_48%,#d8ebff_100%)]" />

          <div className="absolute -right-12 -top-24 hidden h-[360px] w-[520px] rotate-[-8deg] rounded-[50%] border border-white/70 bg-white/30 lg:block" />
          <div className="absolute right-[8%] top-8 hidden h-36 w-36 rounded-full border-[26px] border-white/35 lg:block" />

          <div className="absolute right-[19%] top-14 hidden lg:block">
            <div className="relative h-28 w-48">
              <div className="absolute left-0 top-10 h-16 w-16 rounded-2xl border border-white/80 bg-white/75 shadow-[0_12px_30px_rgba(25,94,166,0.10)]" />
              <div className="absolute left-5 top-0 flex h-16 w-16 items-center justify-center rounded-2xl bg-primary text-white shadow-[0_14px_34px_rgba(17,104,219,0.24)]">
                <Icon name="plane" size={25} />
              </div>
              <div className="absolute bottom-0 right-0 flex h-14 w-28 items-center gap-2 rounded-2xl border border-white/80 bg-white/85 px-3 shadow-[0_12px_30px_rgba(25,94,166,0.10)]">
                <span className="flex h-8 w-8 items-center justify-center rounded-full bg-[#eaf3ff] text-primary">
                  <Icon name="globe" size={16} />
                </span>
                <span className="text-[10px] font-extrabold leading-4 text-[#10223f]">
                  Jelajahi
                  <br />
                  perjalanan
                </span>
              </div>
            </div>
          </div>

          <div className="relative mx-auto max-w-[1240px] px-4 pb-28 pt-7 md:pb-32 md:pt-8">
            <div className="max-w-[640px]">
              <p className="inline-flex items-center gap-2 rounded-full border border-white/80 bg-white/80 px-3 py-1.5 text-[11px] font-extrabold text-primary shadow-sm">
                <Icon name="shield" size={13} />
                Marketplace perjalanan dalam ekosistem Segaloka
              </p>

              <h1 className="mt-3 font-display text-[30px] font-extrabold leading-[1.08] tracking-[-0.035em] text-[#10223f] sm:text-[34px] md:text-[38px]">
                Mau perjalanan ke mana?
              </h1>

              <p className="mt-2.5 max-w-[560px] text-sm leading-6 text-[#52647e]">
                Temukan paket Umrah, Haji, Halal Tour dan Tour dari Travel
                dalam satu marketplace.
              </p>
            </div>
          </div>
        </section>

        {/* TRANSACTION CENTER */}
        <section className="relative z-20 mx-auto -mt-20 max-w-[1240px] px-4">
          <div className="overflow-hidden rounded-2xl border border-[#dce4ee] bg-white shadow-[0_18px_50px_rgba(16,34,63,0.14)]">
            <div className="overflow-x-auto border-b border-[#e8edf3]">
              <div className="flex min-w-max items-stretch px-2 sm:px-4">
                {SERVICES.map((service, index) => (
                  <Link
                    key={service.type}
                    href={`/paket/${service.type}`}
                    className={`group relative flex min-w-[118px] items-center justify-center gap-2.5 px-4 py-4 text-center transition hover:bg-[#f7fbff] ${
                      index === 0 ? "text-primary" : "text-[#52647e]"
                    }`}
                  >
                    <span
                      className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-full ${
                        index === 0
                          ? "bg-primary text-white"
                          : "bg-[#eef4fb] text-primary"
                      }`}
                    >
                      <Icon name={service.icon} size={17} />
                    </span>

                    <span className="text-left">
                      <span className="block text-xs font-extrabold text-[#10223f]">
                        {service.label}
                      </span>
                      <span className="mt-0.5 block text-[9px] font-medium text-[#77869a]">
                        {service.description}
                      </span>
                    </span>

                    {index === 0 && (
                      <span className="absolute inset-x-0 bottom-0 h-0.5 bg-primary" />
                    )}
                  </Link>
                ))}

                <Link
                  href="/akun/segadeals/baru"
                  className="group relative flex min-w-[132px] items-center justify-center gap-2.5 px-4 py-4 transition hover:bg-[#fffaf1]"
                >
                  <span className="flex h-9 w-9 items-center justify-center rounded-full bg-[#fff2d9] text-[#d67a00]">
                    <Icon name="handshake" size={17} />
                  </span>
                  <span>
                    <span className="block text-xs font-extrabold text-[#10223f]">
                      SegaDeals
                    </span>
                    <span className="mt-0.5 block text-[9px] font-medium text-[#77869a]">
                      Minta Travel menawar
                    </span>
                  </span>
                </Link>
              </div>
            </div>

            <div className="flex flex-col gap-3 px-4 py-3.5 sm:flex-row sm:items-center sm:justify-between sm:px-6">
              <div className="flex items-center gap-3">
                <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-[#eef5ff] text-primary">
                  <Icon name="building" size={16} />
                </span>
                <div>
                  <p className="text-[9px] font-extrabold uppercase tracking-[0.08em] text-[#7c8a9d]">
                    Pilihan perjalanan
                  </p>
                  <p className="text-xs font-extrabold text-[#10223f]">
                    Jelajahi paket Umrah dari Travel di Segaloka
                  </p>
                </div>
              </div>

              <div className="flex flex-wrap gap-2">
                <Link
                  href="/akun/segadeals/baru"
                  className="inline-flex items-center justify-center gap-2 rounded-full border border-[#efd09d] bg-[#fffaf2] px-4 py-2.5 text-[11px] font-extrabold text-[#b96a00] transition hover:bg-[#fff3df]"
                >
                  <Icon name="handshake" size={14} />
                  Minta penawaran
                </Link>

                <Link
                  href="/paket/umrah"
                  className="inline-flex items-center justify-center gap-2 rounded-full bg-primary px-5 py-2.5 text-[11px] font-extrabold text-white transition hover:opacity-90"
                >
                  <Icon name="search" size={14} />
                  Lihat Paket Umrah
                </Link>
              </div>
            </div>
          </div>

          <div className="mx-auto flex max-w-[720px] items-center justify-center divide-x divide-[#dce4ee] py-3 text-[10px] font-bold text-[#243b5a]">
            <span className="flex items-center gap-2 px-5">
              <span className="text-[#1b9c55]">
                <Icon name="shield" size={13} />
              </span>
              Travel aktif
            </span>
            <span className="flex items-center gap-2 px-5">
              <span className="text-primary">
                <Icon name="wallet" size={13} />
              </span>
              Transaksi tercatat
            </span>
            <span className="flex items-center gap-2 px-5">
              <span className="text-[#d67a00]">
                <Icon name="handshake" size={13} />
              </span>
              SegaDeals
            </span>
          </div>
        </section>

        {/* REAL MARKETPLACE INVENTORY */}
        <section className="mx-auto max-w-[1240px] px-4 pb-8 pt-6">
          <div className="flex items-end justify-between gap-4">
            <div>
              <p className="text-[10px] font-extrabold uppercase tracking-[0.14em] text-primary">
                Rekomendasi perjalanan
              </p>
              <h2 className="mt-1 font-display text-[24px] font-extrabold tracking-[-0.025em] text-[#10223f]">
                Paket terbaru untuk Anda
              </h2>
              <p className="mt-1 text-xs text-[#6d7c91]">
                Paket yang telah dipublikasikan oleh Travel aktif di Segaloka.
              </p>

              {isPreviewInventory && (
                <p className="mt-2 inline-flex rounded-full bg-[#fff4dd] px-2.5 py-1 text-[9px] font-extrabold text-[#a65f00]">
                  Preview layout — data contoh sementara
                </p>
              )}
            </div>

            <Link
              href="/paket/umrah"
              className="hidden text-xs font-extrabold text-primary hover:underline sm:inline"
            >
              Lihat semua →
            </Link>
          </div>

          {displayPackages.length === 0 ? (
            <div className="mt-5 flex flex-col gap-4 rounded-2xl border border-dashed border-[#cfdbea] bg-white px-5 py-5 sm:flex-row sm:items-center sm:justify-between">
              <div className="flex items-center gap-4">
                <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-[#eef5ff] text-primary">
                  <Icon name="plane" size={19} />
                </span>
                <div>
                  <p className="text-sm font-extrabold text-[#10223f]">
                    Paket sedang disiapkan
                  </p>
                  <p className="mt-1 text-[11px] leading-5 text-[#718096]">
                    Paket published dari Travel aktif akan tampil otomatis di area ini.
                  </p>
                </div>
              </div>

              <Link
                href="/akun/segadeals/baru"
                className="inline-flex shrink-0 items-center justify-center rounded-full border border-[#d8e1ec] px-4 py-2 text-[11px] font-extrabold text-primary hover:border-primary/40"
              >
                Coba SegaDeals
              </Link>
            </div>
          ) : (
            <div className="mt-5 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              {displayPackages.map((pkg) => {
                const org = pkg.organizations;
                const departure = pkg.departures[0];
                const seats = availableSeats(departure);
                const logo = org?.logo_light_url || org?.logo_dark_url;

                return (
                  <Link
                    key={pkg.id}
                    href={`/paket/detail/${pkg.slug}`}
                    className="group overflow-hidden rounded-2xl border border-[#dde5ef] bg-white shadow-[0_8px_24px_rgba(16,34,63,0.06)] transition hover:-translate-y-0.5 hover:border-primary/30 hover:shadow-[0_14px_32px_rgba(16,34,63,0.10)]"
                  >
                    <div className="relative flex aspect-[16/9] items-center justify-center overflow-hidden bg-[linear-gradient(135deg,#e9f4ff_0%,#f8fbff_55%,#eaf7f5_100%)]">
                      <div className="absolute -right-8 -top-10 h-32 w-32 rounded-full border-[20px] border-white/45" />
                      <div className="absolute -bottom-12 -left-8 h-28 w-28 rounded-full bg-white/45" />

                      <span className="relative flex h-14 w-14 items-center justify-center rounded-2xl bg-white text-primary shadow-[0_10px_28px_rgba(16,34,63,0.10)]">
                        <Icon name={packageIcon(pkg.type)} size={25} />
                      </span>

                      <span className="absolute left-3 top-3 rounded-full bg-white/90 px-2.5 py-1 text-[9px] font-extrabold text-[#27405f] shadow-sm">
                        {packageTypeLabel(pkg.type)}
                      </span>
                    </div>

                    <div className="p-4">
                      <div className="flex min-h-8 items-center gap-2">
                        {logo ? (
                          <span className="relative h-7 w-7 shrink-0 overflow-hidden rounded-full border border-[#e2e8f0] bg-white">
                            <Image
                              src={logo}
                              alt={org?.name ?? "Travel"}
                              fill
                              sizes="28px"
                              className="object-contain p-1"
                            />
                          </span>
                        ) : (
                          <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-[#eef5ff] text-primary">
                            <Icon name="building" size={13} />
                          </span>
                        )}

                        <p className="truncate text-[10px] font-bold text-[#63738a]">
                          {org?.name ?? "Travel Segaloka"}
                        </p>
                      </div>

                      <h3 className="mt-2 min-h-10 text-sm font-extrabold leading-5 text-[#10223f] group-hover:text-primary">
                        {pkg.name}
                      </h3>

                      <div className="mt-3 flex items-center gap-3 text-[10px] font-semibold text-[#687990]">
                        <span>{pkg.duration_days} hari</span>
                        {departure && (
                          <>
                            <span className="h-1 w-1 rounded-full bg-[#a8b4c4]" />
                            <span>{formatDate(departure.departure_date)}</span>
                          </>
                        )}
                      </div>

                      {departure && seats !== null && (
                        <p className="mt-2 text-[10px] font-bold text-[#52647e]">
                          {seats > 0 ? `${seats} kursi tersedia` : "Kuota penuh"}
                        </p>
                      )}

                      {!departure && (
                        <p className="mt-2 text-[10px] font-medium text-[#8996a8]">
                          Jadwal keberangkatan belum dibuka
                        </p>
                      )}

                      <div className="mt-4 border-t border-[#edf1f5] pt-3">
                        <p className="text-[9px] font-bold uppercase tracking-wide text-[#8a97a8]">
                          Mulai dari
                        </p>
                        <p className="mt-0.5 font-display text-base font-extrabold text-primary">
                          {formatIDR(pkg.base_price)}
                        </p>
                      </div>
                    </div>
                  </Link>
                );
              })}
            </div>
          )}
        </section>

        {/* UPCOMING DEPARTURES */}
        {upcomingPackages.length > 0 && (
          <section className="mx-auto max-w-[1240px] px-4 pb-10 pt-2">
            <div className="rounded-2xl border border-[#dce5ef] bg-white p-5 sm:p-6">
              <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
                <div>
                  <p className="text-[10px] font-extrabold uppercase tracking-[0.14em] text-primary">
                    Jadwal perjalanan
                  </p>
                  <h2 className="mt-1 font-display text-xl font-extrabold text-[#10223f]">
                    Keberangkatan terdekat
                  </h2>
                </div>

                <p className="text-[11px] text-[#748297]">
                  Jadwal terbuka yang paling dekat dari paket marketplace.
                </p>
              </div>

              <div className="mt-5 grid gap-3 lg:grid-cols-2">
                {upcomingPackages.map((pkg) => {
                  const departure = pkg.departures[0];
                  const seats = availableSeats(departure);

                  return (
                    <Link
                      key={`${pkg.id}-${departure.id}`}
                      href={`/paket/detail/${pkg.slug}`}
                      className="flex items-center gap-4 rounded-xl border border-[#e2e8f0] p-4 transition hover:border-primary/35 hover:bg-[#f9fbfe]"
                    >
                      <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-[#eef5ff] text-primary">
                        <Icon name={packageIcon(pkg.type)} size={19} />
                      </span>

                      <div className="min-w-0 flex-1">
                        <p className="truncate text-xs font-extrabold text-[#10223f]">
                          {pkg.name}
                        </p>
                        <p className="mt-1 truncate text-[10px] text-[#748297]">
                          {pkg.organizations?.name ?? "Travel Segaloka"} ·{" "}
                          {packageTypeLabel(pkg.type)}
                        </p>
                      </div>

                      <div className="shrink-0 text-right">
                        <p className="text-[11px] font-extrabold text-[#10223f]">
                          {formatDate(departure.departure_date)}
                        </p>
                        <p className="mt-1 text-[9px] font-semibold text-[#748297]">
                          {seats !== null ? `${seats} kursi` : ""}
                        </p>
                      </div>
                    </Link>
                  );
                })}
              </div>
            </div>
          </section>
        )}

        {/* SEGADEALS */}
        <section className="mx-auto max-w-[1240px] px-4 pb-10">
          <div className="overflow-hidden rounded-[22px] bg-[#10294d]">
            <div className="grid gap-6 p-6 sm:p-8 lg:grid-cols-[1.05fr_0.95fr] lg:items-center">
              <div>
                <span className="inline-flex rounded-full bg-[#ffad27] px-3 py-1 text-[10px] font-extrabold text-[#382000]">
                  SegaDeals
                </span>

                <h2 className="mt-4 max-w-[600px] font-display text-[25px] font-extrabold leading-[1.2] tracking-[-0.025em] text-white sm:text-[28px]">
                  Belum menemukan paket yang pas?
                  <br />
                  Biar Travel yang menawar untuk Anda.
                </h2>

                <p className="mt-3 max-w-[620px] text-xs leading-6 text-[#c9d6e8]">
                  Sampaikan kebutuhan perjalanan Anda satu kali. Travel dapat
                  memberikan penawaran untuk Anda bandingkan sebelum memilih.
                </p>

                <Link
                  href="/akun/segadeals/baru"
                  className="mt-5 inline-flex items-center gap-2 rounded-full bg-white px-5 py-2.5 text-[11px] font-extrabold text-[#10294d] transition hover:bg-[#f3f7fb]"
                >
                  Buat permintaan SegaDeals
                  <span>→</span>
                </Link>
              </div>

              <div className="space-y-2">
                {SEGADEALS_STEPS.map((step, index) => (
                  <div
                    key={step}
                    className="flex items-center gap-3 rounded-xl border border-white/10 bg-white/[0.06] px-4 py-3"
                  >
                    <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-[#4ba2ff] text-xs font-extrabold text-[#09213f]">
                      {index + 1}
                    </span>
                    <p className="text-xs font-bold text-white">{step}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* BUSINESS ECOSYSTEM */}
        <section className="mx-auto max-w-[1240px] px-4 pb-12">
          <div className="grid gap-4 rounded-2xl border border-[#dce4ee] bg-white p-6 sm:p-7 lg:grid-cols-[1fr_auto] lg:items-center">
            <div>
              <p className="text-[10px] font-extrabold uppercase tracking-[0.14em] text-primary">
                Ekosistem Segaloka
              </p>
              <h2 className="mt-1.5 font-display text-xl font-extrabold text-[#10223f]">
                Kelola bisnis perjalanan dalam satu ekosistem.
              </h2>
              <p className="mt-2 max-w-[720px] text-xs leading-5 text-[#6d7c91]">
                Travel, Vendor, Agen, Mitra dan Affiliate terhubung dengan
                marketplace dan proses transaksi Segaloka.
              </p>
            </div>

            <Link
              href="/daftar"
              className="inline-flex items-center justify-center rounded-full bg-primary px-5 py-2.5 text-[11px] font-extrabold text-white hover:opacity-90"
            >
              Bergabung dengan Segaloka
            </Link>
          </div>
        </section>
      </main>

      <PublicFooter />

      <nav className="fixed inset-x-0 bottom-0 z-40 border-t border-[#dfe5ed] bg-white/95 px-2 py-2 backdrop-blur md:hidden">
        <div className="mx-auto grid max-w-md grid-cols-5">
          {[
            ["home", "Beranda", "/"],
            ["search", "Jelajah", "/paket/umrah"],
            ["handshake", "SegaDeals", "/akun/segadeals"],
            ["booking", "Booking", "/akun/booking"],
            ["user", "Akun", "/akun"],
          ].map(([icon, label, href], index) => (
            <Link
              key={label}
              href={href}
              className={`flex flex-col items-center gap-1 py-1 text-[9px] font-bold ${
                index === 0 ? "text-primary" : "text-[#748297]"
              }`}
            >
              <Icon name={icon as any} size={17} />
              {label}
            </Link>
          ))}
        </div>
      </nav>
    </div>
  );
}