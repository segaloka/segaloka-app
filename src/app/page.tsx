import Link from "next/link";
import { MarketplaceHeader } from "@/components/marketplace/MarketplaceHeader";
import { MarketplaceAdCarousel } from "@/components/marketplace/MarketplaceAdCarousel";
import { MarketplaceSearch } from "@/components/marketplace/MarketplaceSearch";
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
    label: "Tour Domestik",
    description: "Jelajahi Indonesia",
    icon: "route" as const,
  },
  {
    type: "tour",
    label: "Tour Internasional",
    description: "Jelajahi dunia",
    icon: "plane" as const,
  },
];

const SEGADEALS_STEPS = [
  "Sampaikan kebutuhan perjalanan",
  "Travel mengirim penawaran",
  "Bandingkan dan pilih penawaran",
];

/**
 * HOMEPAGE MARKETPLACE V4 - TEMPORARY VISUAL DATA
 *
 * Hanya untuk membentuk layout marketplace selama data CMS/ads/destination
 * production belum tersedia. Tidak ditulis ke Supabase dan bukan sumber transaksi.
 */
const PREVIEW_PROMOS = [
  { id: "promo-umrah", label: "Umrah", title: "Promo Umrah Pilihan", detail: "Paket perjalanan dari Travel aktif", icon: "building" as const },
  { id: "promo-domestik", label: "Domestik", title: "Liburan di Indonesia", detail: "Bali, Lombok, Labuan Bajo & lainnya", icon: "route" as const },
  { id: "promo-halal", label: "Halal Tour", title: "Jelajahi Dunia", detail: "Turki, Jepang, Korea & destinasi lainnya", icon: "globe" as const },
];

const PREVIEW_DOMESTIC_DESTINATIONS = [
  { name: "Bali", detail: "Pantai, budaya & keluarga", icon: "route" as const },
  { name: "Lombok", detail: "Pulau, resort & wisata halal", icon: "globe" as const },
  { name: "Labuan Bajo", detail: "Komodo & island hopping", icon: "plane" as const },
  { name: "Yogyakarta", detail: "Budaya, sejarah & kuliner", icon: "building" as const },
  { name: "Raja Ampat", detail: "Bahari & petualangan", icon: "globe" as const },
];

const PREVIEW_WORLD_DESTINATIONS = [
  { name: "Turki", detail: "Istanbul & Cappadocia", icon: "globe" as const },
  { name: "Jepang", detail: "Tokyo, Osaka & Kyoto", icon: "plane" as const },
  { name: "Korea Selatan", detail: "Seoul & Busan", icon: "building" as const },
  { name: "Malaysia", detail: "Kuala Lumpur & sekitarnya", icon: "route" as const },
  { name: "Singapura", detail: "City break & keluarga", icon: "plane" as const },
];

const PREVIEW_INSPIRATIONS = [
  { title: "Panduan memilih paket Umrah sesuai kebutuhan", category: "Umrah" },
  { title: "Destinasi domestik untuk liburan keluarga", category: "Indonesia" },
  { title: "Persiapan perjalanan Halal Tour pertama Anda", category: "Halal Tour" },
  { title: "Tips membandingkan penawaran perjalanan", category: "Panduan" },
];

/**
 * TEMPORARY HOMEPAGE PREVIEW CONTENT
 *
 * Data di bawah hanya untuk memvalidasi layout Ads Travel, Vendor Pilihan,
 * dan Travel Pilihan. Data ini tidak ditulis ke Supabase dan tidak boleh
 * dipakai sebagai sumber transaksi production.
 */
const PREVIEW_VENDORS = [
  {
    id: "vendor-hotel",
    name: "Nusa Hotel Partner",
    category: "Hotel",
    description: "Akomodasi untuk kebutuhan perjalanan grup dan FIT.",
    icon: "building" as const,
  },
  {
    id: "vendor-ticket",
    name: "Aero Ticket Partner",
    category: "Tiket & Flight",
    description: "Kebutuhan tiket perjalanan untuk Travel dalam ekosistem.",
    icon: "plane" as const,
  },
  {
    id: "vendor-handling",
    name: "Haramain Handling",
    category: "Visa & Handling",
    description: "Dukungan dokumen, handling dan kebutuhan operasional.",
    icon: "shield" as const,
  },
  {
    id: "vendor-land",
    name: "Nusantara Land Service",
    category: "Transport & Land",
    description: "Transportasi, catering dan layanan darat perjalanan.",
    icon: "route" as const,
  },
];

const PREVIEW_TRAVELS = [
  {
    id: "travel-amanah",
    name: "Travel Amanah",
    specialty: "Umrah",
    rating: "4.8",
    reviews: 120,
    icon: "building" as const,
  },
  {
    id: "nusantara-haramain",
    name: "Nusantara Haramain",
    specialty: "Umrah Plus",
    rating: "4.7",
    reviews: 98,
    icon: "building" as const,
  },
  {
    id: "safar-indonesia",
    name: "Safar Indonesia",
    specialty: "Haji",
    rating: "4.9",
    reviews: 156,
    icon: "route" as const,
  },
  {
    id: "jelajah-muslim",
    name: "Jelajah Muslim",
    specialty: "Halal Tour",
    rating: "4.6",
    reviews: 74,
    icon: "globe" as const,
  },
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
 * TEMPORARY UI PREVIEW RATING
 *
 * Rating ini hanya untuk memperlihatkan komposisi card selama fase UI preview.
 * Jangan dianggap sebagai rating Travel production.
 */
function previewTravelRating(orgName: string) {
  const ratings: Record<string, { score: string; reviews: number }> = {
    "Travel Amanah": { score: "4.8", reviews: 120 },
    "Nusantara Haramain": { score: "4.7", reviews: 98 },
    "Safar Indonesia": { score: "4.9", reviews: 156 },
    "Jelajah Muslim": { score: "4.6", reviews: 74 },
    "Langkah Dunia": { score: "4.7", reviews: 102 },
    "Berkah Journey": { score: "4.8", reviews: 89 },
  };

  return ratings[orgName] ?? { score: "4.8", reviews: 0 };
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

// Homepage Marketplace V4.3 — card-system refinement; production data flow preserved.
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
    .slice(0, 4);

  const displayPackages = (
    marketplacePackages.length > 0 ? marketplacePackages : PREVIEW_PACKAGES
  ).slice(0, 4);

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
      <MarketplaceHeader />

      <main className="pb-16 md:pb-0">
        {/* MARKETPLACE V4 HERO */}
        <section className="relative overflow-hidden border-b border-[#d9e6f4] bg-[#dff1ff]">
          <div className="absolute inset-0 bg-[linear-gradient(105deg,#edf8ff_0%,#d8efff_50%,#c8e8ff_100%)]" />
          <div className="absolute -right-16 -top-28 hidden h-[420px] w-[620px] rounded-[50%] border border-white/60 bg-white/25 lg:block" />
          <div className="absolute right-[13%] top-10 hidden h-44 w-44 rounded-full border-[30px] border-white/25 lg:block" />

          <div className="relative mx-auto max-w-[1180px] px-4 pb-24 pt-8 sm:pb-28 md:pt-10">
            <div className="grid gap-6 lg:grid-cols-[1fr_0.72fr] lg:items-center">
              <div className="max-w-[700px]">
                <p className="inline-flex items-center gap-2 rounded-full border border-white/80 bg-white/80 px-3 py-1.5 text-xs font-extrabold text-primary shadow-sm">
                  <Icon name="globe" size={13} />
                  Domestik · Internasional · Umrah · Haji
                </p>
                <h1 className="mt-3 font-display text-[31px] font-extrabold leading-[1.08] tracking-[-0.035em] text-[#10223f] sm:text-[36px] md:text-[42px]">
                  Dari Indonesia untuk perjalanan ke mana saja.
                </h1>
                <p className="mt-3 max-w-[650px] text-sm leading-6 text-[#52647e]">
                  Temukan paket Umrah, Haji, Halal Tour, Tour Domestik dan Tour Internasional dari Travel dalam ekosistem Segaloka.
                </p>
              </div>

              <div className="hidden justify-end lg:flex">
                <div className="grid w-[330px] grid-cols-2 gap-3">
                  <div className="rounded-2xl border border-white/80 bg-white/80 p-4 shadow-[0_12px_30px_rgba(25,94,166,0.10)]">
                    <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#eaf3ff] text-primary">
                      <Icon name="route" size={17} />
                    </span>
                    <p className="mt-3 text-xs font-extrabold text-[#10223f]">Jelajahi Indonesia</p>
                    <p className="mt-1 text-xs leading-4 text-[#718096]">Bali hingga Raja Ampat</p>
                  </div>
                  <div className="mt-7 rounded-2xl border border-white/80 bg-white/80 p-4 shadow-[0_12px_30px_rgba(25,94,166,0.10)]">
                    <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary text-white">
                      <Icon name="plane" size={17} />
                    </span>
                    <p className="mt-3 text-xs font-extrabold text-[#10223f]">Jelajahi Dunia</p>
                    <p className="mt-1 text-xs leading-4 text-[#718096]">Asia, Timur Tengah & lainnya</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* MARKETPLACE CATEGORY + SEARCH CENTER */}
        <section className="relative z-20 mx-auto -mt-16 max-w-[1180px] px-4">
          <MarketplaceSearch />

          {/* AUTO MARKETPLACE ADS V4.5 */}
          <MarketplaceAdCarousel />
        </section>

        {/* MARKETPLACE PROMO STRIP — V4.3 */}
        <section className="mx-auto max-w-[1180px] px-4 pb-4 pt-3">
          <div className="grid gap-3 md:grid-cols-3">
            {PREVIEW_PROMOS.map((promo, index) => (
              <Link
                key={promo.id}
                href={index === 0 ? "/paket/umrah" : index === 1 ? "/paket/tour" : "/paket/halal_tour"}
                className={`group relative min-h-[110px] overflow-hidden rounded-[18px] border p-4 transition duration-300 hover:-translate-y-0.5 hover:shadow-[0_14px_34px_rgba(15,45,90,0.09)] ${
                  index === 0
                    ? "border-[#cfe4ff] bg-[linear-gradient(135deg,#e9f5ff_0%,#f8fcff_68%,#ddecff_100%)]"
                    : index === 1
                      ? "border-[#d8eee5] bg-[linear-gradient(135deg,#ecfaf4_0%,#fbfffd_68%,#dcf4e9_100%)]"
                      : "border-[#eadff8] bg-[linear-gradient(135deg,#f6efff_0%,#fdfbff_68%,#eadfff_100%)]"
                }`}
              >
                <div className="absolute -right-7 -top-10 h-28 w-28 rounded-full border-[18px] border-white/45 transition duration-300 group-hover:scale-110" />
                <div className="relative flex h-full items-start gap-3.5">
                  <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl border border-white/80 bg-white/90 text-primary shadow-sm">
                    <Icon name={promo.icon} size={19} />
                  </span>
                  <div className="min-w-0">
                    <p className="text-xs font-black uppercase tracking-[0.12em] text-primary">{promo.label}</p>
                    <p className="mt-1 text-sm font-extrabold leading-5 text-[#10223f]">{promo.title}</p>
                    <p className="mt-1 text-xs leading-4 text-[#718096]">{promo.detail}</p>
                    <span className="mt-2.5 inline-flex items-center gap-1 text-xs font-extrabold text-primary">
                      Jelajahi <span aria-hidden="true">→</span>
                    </span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </section>

        {/* REAL MARKETPLACE INVENTORY — V4.3 CARD SYSTEM */}
        <section className="mx-auto max-w-[1180px] px-4 pb-10 pt-5">
          <div className="flex items-end justify-between gap-4">
            <div>
              <p className="text-xs font-extrabold uppercase tracking-[0.14em] text-primary">
                Rekomendasi perjalanan
              </p>
              <h2 className="mt-1 font-display text-[24px] font-extrabold tracking-[-0.025em] text-[#10223f]">
                Paket pilihan untuk Anda
              </h2>
              <p className="mt-1 text-sm text-[#6d7c91]">
                Umrah, Haji, perjalanan domestik dan internasional dari Travel di Segaloka.
              </p>
              {isPreviewInventory && (
                <p className="mt-2 inline-flex rounded-full bg-[#fff4dd] px-2.5 py-1 text-xs font-extrabold text-[#a65f00]">
                  Preview layout — data contoh sementara
                </p>
              )}
            </div>
            <Link href="/paket/umrah" className="hidden text-sm font-extrabold text-primary hover:underline sm:inline">
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
                  <p className="text-sm font-extrabold text-[#10223f]">Paket sedang disiapkan</p>
                  <p className="mt-1 text-sm leading-5 text-[#718096]">
                    Paket published dari Travel aktif akan tampil otomatis di area ini.
                  </p>
                </div>
              </div>
              <Link href="/akun/segadeals/baru" className="inline-flex shrink-0 items-center justify-center rounded-full border border-[#d8e1ec] px-4 py-2 text-sm font-extrabold text-primary hover:border-primary/40">
                Coba SegaDeals
              </Link>
            </div>
          ) : (
            <div className="mt-5 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              {displayPackages.map((pkg) => {
                const org = pkg.organizations;
                const departure = pkg.departures[0];
                const seats = availableSeats(departure);
                const orgName = org?.name ?? "Travel Segaloka";
                const orgLogo = org?.logo_light_url ?? org?.logo_dark_url ?? null;
                const rating = previewTravelRating(orgName);

                return (
                  <Link
                    key={pkg.id}
                    href={`/paket/detail/${pkg.slug}`}
                    className="group flex min-h-[338px] flex-col overflow-hidden rounded-[20px] border border-[#dfe7f0] bg-white shadow-[0_8px_24px_rgba(15,45,90,0.05)] transition duration-200 hover:-translate-y-1 hover:border-[#b9d2ee] hover:shadow-[0_16px_38px_rgba(15,45,90,0.11)]"
                  >
                    <div className="relative h-[132px] overflow-hidden bg-[linear-gradient(145deg,#dcefff_0%,#eff8ff_48%,#e8f8f2_100%)] p-3.5">
                      <div className="absolute -bottom-14 -left-10 h-36 w-36 rounded-full border-[24px] border-white/40" />
                      <div className="absolute -right-10 -top-12 h-36 w-36 rounded-full bg-white/40" />
                      <div className="absolute bottom-3 right-3 text-primary/10 transition duration-300 group-hover:scale-110 group-hover:text-primary/15">
                        <Icon name={packageIcon(pkg.type)} size={72} />
                      </div>

                      <div className="relative z-10 flex items-start justify-between gap-3">
                        <span className="inline-flex rounded-full border border-white/90 bg-white/95 px-2.5 py-1 text-xs font-extrabold text-[#183a64] shadow-sm">
                          {packageTypeLabel(pkg.type)}
                        </span>
                        <div className="flex h-10 w-10 shrink-0 items-center justify-center overflow-hidden rounded-xl border border-white bg-white shadow-sm">
                          {orgLogo ? (
                            // eslint-disable-next-line @next/next/no-img-element
                            <img src={orgLogo} alt={`Logo ${orgName}`} className="h-full w-full object-contain p-1" />
                          ) : (
                            <Icon name={packageIcon(pkg.type)} size={17} />
                          )}
                        </div>
                      </div>

                      <div className="absolute bottom-3 left-3.5 z-10 inline-flex items-center gap-1.5 rounded-full bg-[#10294d]/90 px-2.5 py-1 text-xs font-bold text-white backdrop-blur">
                        <span className="text-[#ffbd3d]">★</span>
                        <span>{rating.score}</span>
                        <span className="text-white/70">({rating.reviews})</span>
                      </div>
                    </div>

                    <div className="flex flex-1 flex-col p-3.5">
                      <p className="truncate text-xs font-bold text-[#60748f]">{orgName}</p>
                      <h3 className="mt-1.5 line-clamp-2 min-h-[40px] text-sm font-extrabold leading-5 text-[#071f43]">
                        {pkg.name}
                      </h3>

                      <div className="mt-3 flex flex-wrap items-center gap-x-2 gap-y-1.5 text-xs font-medium text-[#657892]">
                        {departure && (
                          <span className="inline-flex items-center gap-1">
                            <Icon name="booking" size={12} />
                            {formatDate(departure.departure_date)}
                          </span>
                        )}
                        {pkg.duration_days && (
                          <span className="inline-flex items-center gap-1">
                            <span className="h-1 w-1 rounded-full bg-[#b6c3d3]" />
                            {pkg.duration_days} hari
                          </span>
                        )}
                      </div>

                      {seats !== null && (
                        <div className="mt-2 flex items-center gap-1.5 text-xs font-semibold text-[#536985]">
                          <span className={`h-1.5 w-1.5 rounded-full ${seats <= 10 ? "bg-[#f5a000]" : "bg-[#16a36a]"}`} />
                          <span>{seats} kursi tersedia</span>
                        </div>
                      )}

                      <div className="mt-auto flex items-end justify-between gap-3 border-t border-[#edf1f6] pt-3">
                        <div>
                          <p className="text-xs font-semibold uppercase tracking-[0.08em] text-[#8b9aae]">Harga</p>
                          <p className="mt-0.5 text-lg font-black leading-none text-[#0b6ee8]">{formatIDR(pkg.base_price)}</p>
                        </div>
                        <span className="flex h-8 w-8 items-center justify-center rounded-full bg-[#eef5ff] text-primary transition group-hover:bg-primary group-hover:text-white">
                          →
                        </span>
                      </div>
                    </div>
                  </Link>
                );
              })}
            </div>
          )}
        </section>

        {/* MARKETPLACE ADS — AFTER PACKAGES */}
        <div className="mx-auto w-full max-w-[1180px] px-4 pb-6 lg:pb-4">
          <MarketplaceAdCarousel placement="after_packages" />
        </div>
        {/* EXPLORE INDONESIA — V4.3 DESTINATION CARDS */}
        <section className="mx-auto max-w-[1180px] px-4 pb-10 lg:pb-8">
          <div className="flex items-end justify-between gap-4">
            <div>
              <p className="text-xs font-extrabold uppercase tracking-[0.14em] text-primary">Jelajahi Indonesia</p>
              <h2 className="mt-1 font-display text-xl font-extrabold text-[#10223f] sm:text-[22px]">Destinasi domestik pilihan</h2>
              <p className="mt-1 text-sm text-[#748297]">Dari wisata kota hingga bahari dalam satu marketplace.</p>
            </div>
            <Link href="/paket/tour" className="hidden text-sm font-extrabold text-primary hover:underline sm:inline">Lihat Tour Domestik →</Link>
          </div>

          <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
            {PREVIEW_DOMESTIC_DESTINATIONS.map((destination, index) => (
              <Link
                key={destination.name}
                href="/paket/tour"
                className={`group relative min-h-[148px] overflow-hidden rounded-[18px] border p-4 transition duration-300 hover:-translate-y-0.5 hover:shadow-[0_12px_26px_rgba(15,45,90,0.08)] lg:min-h-[132px] ${
                  index % 3 === 0
                    ? "border-[#cfe4ff] bg-[linear-gradient(160deg,#dff1ff_0%,#f6fbff_62%,#ffffff_100%)]"
                    : index % 3 === 1
                      ? "border-[#d7ecdf] bg-[linear-gradient(160deg,#e2f7eb_0%,#f7fdf9_62%,#ffffff_100%)]"
                      : "border-[#e6def4] bg-[linear-gradient(160deg,#f0e9ff_0%,#fbf9ff_62%,#ffffff_100%)]"
                }`}
              >
                <div className="absolute -bottom-12 -right-10 h-28 w-28 rounded-full border-[16px] border-white/55 transition duration-300 group-hover:scale-110" />
                <span className="relative flex h-9 w-9 items-center justify-center rounded-xl border border-white bg-white/90 text-primary shadow-sm">
                  <Icon name={destination.icon} size={17} />
                </span>
                <div className="absolute inset-x-4 bottom-3.5">
                  <p className="text-[15px] font-extrabold leading-tight text-[#10223f]">{destination.name}</p>
                  <p className="mt-1 line-clamp-1 text-xs leading-4 text-[#657892]">{destination.detail}</p>
                  <span className="mt-1.5 inline-flex items-center gap-1 text-xs font-extrabold text-primary">Lihat paket <span aria-hidden="true">→</span></span>
                </div>
              </Link>
            ))}
          </div>
        </section>

        {/* MARKETPLACE ADS — AFTER DOMESTIC */}
        <div className="mx-auto w-full max-w-[1180px] px-4 pb-6 lg:pb-4">
          <MarketplaceAdCarousel placement="after_domestic" />
        </div>
        {/* UPCOMING DEPARTURES — V4.3 */}
        {upcomingPackages.length > 0 && (
          <section className="mx-auto max-w-[1180px] px-4 pb-10 lg:pb-8">
            <div className="overflow-hidden rounded-[22px] border border-[#dce5ef] bg-white shadow-[0_8px_24px_rgba(15,45,90,0.04)]">
              <div className="flex flex-col gap-2 border-b border-[#edf1f6] px-5 py-4 sm:flex-row sm:items-end sm:justify-between sm:px-6">
                <div>
                  <p className="text-xs font-extrabold uppercase tracking-[0.14em] text-primary">Jadwal perjalanan</p>
                  <h2 className="mt-1 font-display text-xl font-extrabold text-[#10223f]">Keberangkatan terdekat</h2>
                </div>
                <p className="text-sm text-[#748297]">Jadwal terbuka terdekat dari inventory marketplace.</p>
              </div>

              <div className="grid md:grid-cols-2">
                {upcomingPackages.map((pkg, index) => {
                  const departure = pkg.departures[0];
                  const seats = availableSeats(departure);
                  return (
                    <Link
                      key={`${pkg.id}-${departure.id}`}
                      href={`/paket/detail/${pkg.slug}`}
                      className={`group flex items-center gap-3.5 px-5 py-3.5 transition duration-200 hover:bg-[#f8fbff] sm:px-6 ${
                        index % 2 === 0 ? "md:border-r md:border-[#edf1f6]" : ""
                      } ${index > 1 ? "border-t border-[#edf1f6]" : index === 1 ? "border-t border-[#edf1f6] md:border-t-0" : ""}`}
                    >
                      <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-[14px] bg-[#eef5ff] text-primary transition duration-200 group-hover:bg-primary group-hover:text-white">
                        <Icon name={packageIcon(pkg.type)} size={19} />
                      </span>
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-[13px] font-extrabold leading-5 text-[#10223f] sm:text-sm">{pkg.name}</p>
                        <p className="mt-0.5 truncate text-xs text-[#748297]">{pkg.organizations?.name ?? "Travel Segaloka"} · {packageTypeLabel(pkg.type)}</p>
                      </div>
                      <div className="ml-auto flex shrink-0 items-center gap-3">
                        <div className="text-right"><p className="whitespace-nowrap text-xs font-extrabold text-[#10223f]">{formatDate(departure.departure_date)}</p>
                        <p className={`mt-1 inline-flex whitespace-nowrap rounded-full px-2 py-0.5 text-[11px] font-bold ${seats !== null && seats <= 10 ? "bg-[#fff4dc] text-[#a96600]" : "bg-[#eaf8f2] text-[#167453]"}`}>
                          {seats !== null ? `${seats} kursi` : ""}
                        </p></div>
                        <span aria-hidden="true" className="hidden text-lg font-bold text-[#a6b4c5] transition group-hover:translate-x-0.5 group-hover:text-primary sm:inline">→</span>
                      </div>
                    </Link>
                  );
                })}
              </div>
            </div>
          </section>
        )}

        {/* EXPLORE THE WORLD — V4.3 */}
        <section className="mx-auto max-w-[1180px] px-4 pb-10 lg:pb-8">
          <div className="overflow-hidden rounded-[22px] border border-[#dfe9f3] bg-[linear-gradient(135deg,#f4f9ff_0%,#f8fbff_52%,#f1faf7_100%)] p-5 sm:p-6">
            <div className="flex items-end justify-between gap-4">
              <div>
                <p className="text-xs font-extrabold uppercase tracking-[0.14em] text-primary">Jelajahi Dunia</p>
                <h2 className="mt-1 font-display text-xl font-extrabold text-[#10223f] sm:text-[22px]">Destinasi internasional populer</h2>
                <p className="mt-1 text-sm text-[#748297]">Halal Tour dan Tour Internasional untuk perjalanan berikutnya.</p>
              </div>
              <Link href="/paket/halal_tour" className="hidden text-sm font-extrabold text-primary hover:underline sm:inline">Lihat Internasional →</Link>
            </div>

            <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
              {PREVIEW_WORLD_DESTINATIONS.map((destination, index) => (
                <Link
                  key={destination.name}
                  href="/paket/halal_tour"
                  className="group relative min-h-[148px] overflow-hidden rounded-[18px] border border-white/90 bg-white p-4 shadow-[0_6px_18px_rgba(15,45,90,0.045)] transition duration-300 hover:-translate-y-0.5 hover:border-[#d7e7f5] hover:shadow-[0_12px_26px_rgba(15,45,90,0.08)] lg:min-h-[132px]"
                >
                  <div className={`absolute -right-9 -top-9 h-24 w-24 rounded-full ${index % 2 === 0 ? "bg-[#e8f3ff]" : "bg-[#e9f8f2]"}`} />
                  <span className="relative flex h-9 w-9 items-center justify-center rounded-[11px] bg-[#edf5ff] text-primary transition duration-300 group-hover:bg-primary group-hover:text-white">
                    <Icon name={destination.icon} size={17} />
                  </span>
                  <div className="absolute inset-x-4 bottom-3.5">
                    <p className="text-[15px] font-extrabold leading-tight text-[#10223f]">{destination.name}</p>
                    <p className="mt-1 line-clamp-1 text-xs leading-4 text-[#748297]">{destination.detail}</p>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </section>

        {/* MARKETPLACE ADS — AFTER WORLD */}
        <div className="mx-auto w-full max-w-[1180px] px-4 pb-6 lg:pb-4">
          <MarketplaceAdCarousel placement="after_world" />
        </div>
        {/* VENDOR PICKS — V4.3 SERVICE CARDS */}
        <section className="mx-auto max-w-[1180px] px-4 pb-10 lg:pb-8">
          <div className="flex items-end justify-between gap-4">
            <div>
              <p className="text-xs font-extrabold uppercase tracking-[0.14em] text-primary">Vendor Pilihan</p>
              <h2 className="mt-1 font-display text-xl font-extrabold text-[#10223f] sm:text-[22px]">Vendor perjalanan pilihan</h2>
              <p className="mt-1 text-sm text-[#748297]">Kategori Vendor untuk kebutuhan Travel dan perjalanan.</p>
            </div>
            <span className="hidden rounded-full bg-[#f3f7fb] px-3 py-1.5 text-xs font-extrabold text-[#60738d] sm:inline">Mitra pendukung Segaloka</span>
          </div>

          <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
            {PREVIEW_VENDORS.map((vendor, index) => (
              <div key={vendor.id} className="group relative min-h-[184px] overflow-hidden rounded-[18px] border border-[#dfe7f0] bg-white p-5 transition duration-300 hover:-translate-y-0.5 hover:border-[#bfd5ee] hover:shadow-[0_12px_26px_rgba(15,45,90,0.08)]">
                <div className={`absolute inset-x-0 top-0 h-1 ${index % 2 === 0 ? "bg-[#0b6ee8]" : "bg-[#20a67a]"}`} />
                <div className="flex items-start justify-between gap-3">
                  <span className="flex h-10 w-10 items-center justify-center rounded-[14px] bg-[#eef5ff] text-primary transition group-hover:bg-primary group-hover:text-white">
                    <Icon name={vendor.icon} size={19} />
                  </span>
                  <span className="rounded-full border border-[#e4eaf1] bg-[#f8fafc] px-2 py-1 text-[10px] font-extrabold uppercase tracking-[0.08em] text-[#718096]">Preview</span>
                </div>
                <p className="mt-4 text-xs font-extrabold uppercase tracking-[0.1em] text-primary">{vendor.category}</p>
                <h3 className="mt-1 truncate text-sm font-extrabold text-[#10223f]">{vendor.name}</h3>
                <p className="mt-1.5 line-clamp-2 text-xs leading-[1.45] text-[#748297]">{vendor.description}</p>
                <span className="mt-3 inline-flex text-xs font-extrabold text-primary">Lihat layanan →</span>
              </div>
            ))}
          </div>
        </section>

        {/* SEGADEALS — V4.3 FEATURE */}
        <section className="mx-auto max-w-[1180px] px-4 pb-10 lg:pb-8">
          <div className="relative overflow-hidden rounded-[26px] bg-[linear-gradient(120deg,#082b58_0%,#0d447f_55%,#126b91_100%)]">
            <div className="absolute -right-24 -top-28 h-80 w-80 rounded-full border-[54px] border-white/[0.06]" />
            <div className="grid gap-7 p-6 sm:p-8 lg:grid-cols-[1.05fr_0.95fr] lg:items-center">
              <div className="relative">
                <span className="inline-flex rounded-full bg-[#ffbd3d] px-3 py-1 text-xs font-extrabold text-[#382000]">SegaDeals</span>
                <h2 className="mt-4 max-w-[600px] font-display text-[25px] font-extrabold leading-[1.18] tracking-[-0.025em] text-white sm:text-[30px]">
                  Belum menemukan paket yang pas?
                  <br />
                  Biar Travel yang menawar untuk Anda.
                </h2>
                <p className="mt-3 max-w-[620px] text-sm leading-6 text-[#c9d6e8]">
                  Sampaikan kebutuhan perjalanan satu kali. Bandingkan penawaran dari Travel sebelum memilih yang sesuai.
                </p>
                <Link href="/akun/segadeals/baru" className="mt-5 inline-flex items-center gap-2 rounded-full bg-white px-5 py-2.5 text-sm font-extrabold text-[#10294d] transition hover:bg-[#f3f7fb]">
                  Buat permintaan SegaDeals <span>→</span>
                </Link>
              </div>

              <div className="relative space-y-2.5">
                {SEGADEALS_STEPS.map((step, index) => (
                  <div key={step} className="flex items-center gap-3 rounded-2xl border border-white/10 bg-white/[0.08] px-4 py-3.5 backdrop-blur-sm">
                    <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-[#63b6ff] text-xs font-extrabold text-[#09213f]">{index + 1}</span>
                    <p className="text-sm font-bold text-white">{step}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* MARKETPLACE ADS — LOWER HOME */}
        <div className="mx-auto w-full max-w-[1180px] px-4 pb-6 lg:pb-4">
          <MarketplaceAdCarousel placement="lower_home" />
        </div>
        {/* TRAVEL DIRECTORY — V4.3 IDENTITY CARDS */}
        <section className="mx-auto max-w-[1180px] px-4 pb-10 lg:pb-8">
          <div className="flex items-end justify-between gap-4">
            <div>
              <p className="text-xs font-extrabold uppercase tracking-[0.14em] text-primary">Travel Pilihan</p>
              <h2 className="mt-1 font-display text-xl font-extrabold text-[#10223f] sm:text-[22px]">Kenali Travel di Segaloka</h2>
              <p className="mt-1 text-sm text-[#748297]">Rating saat ini masih data contoh untuk preview komposisi UI.</p>
            </div>
            <Link href="/paket/umrah" className="hidden text-sm font-extrabold text-primary hover:underline sm:inline">Jelajahi marketplace →</Link>
          </div>

          <div className="mt-4 grid grid-cols-2 gap-3 lg:grid-cols-4">
            {PREVIEW_TRAVELS.map((travel) => (
              <div key={travel.id} className="group overflow-hidden rounded-[20px] border border-[#dfe7f0] bg-white transition hover:-translate-y-0.5 hover:border-[#bfd5ee] hover:shadow-[0_12px_28px_rgba(15,45,90,0.08)]">
                <div className="h-16 bg-[linear-gradient(135deg,#e5f2ff,#f4f9ff,#e9f8f2)]" />
                <div className="-mt-7 px-4 pb-4">
                  <div className="flex items-end justify-between gap-3">
                    <span className="flex h-14 w-14 items-center justify-center rounded-2xl border-4 border-white bg-[#f8fbff] text-primary shadow-sm">
                      <Icon name={travel.icon} size={20} />
                    </span>
                    <span className="mb-1 inline-flex items-center gap-1 rounded-full bg-[#fff7e5] px-2 py-1 text-xs font-extrabold text-[#40546f]">
                      <span className="text-[#f5a000]">★</span>{travel.rating}
                    </span>
                  </div>
                  <h3 className="mt-3 truncate text-sm font-extrabold text-[#10223f]">{travel.name}</h3>
                  <div className="mt-1 flex flex-wrap items-center gap-1.5 text-xs text-[#748297]">
                    <span>{travel.specialty}</span><span>·</span><span>{travel.reviews} ulasan</span>
                  </div>
                  <div className="mt-3 flex items-center justify-between border-t border-[#edf2f7] pt-3">
                    <span className="text-xs font-bold text-[#63758e]">Travel aktif · Preview</span>
                    <span className="text-xs font-extrabold text-primary">Lihat →</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* TRAVEL INSPIRATION — V4.3 EDITORIAL CARDS */}
        <section className="mx-auto max-w-[1180px] px-4 pb-10 lg:pb-8">
          <div>
            <p className="text-xs font-extrabold uppercase tracking-[0.14em] text-primary">Inspirasi Perjalanan</p>
            <h2 className="mt-1 font-display text-xl font-extrabold text-[#10223f] sm:text-[22px]">Ide dan panduan sebelum berangkat</h2>
            <p className="mt-1 text-sm text-[#748297]">Konten panduan untuk membantu menyiapkan perjalanan Anda.</p>
          </div>

          <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            {PREVIEW_INSPIRATIONS.map((item, index) => (
              <div key={item.title} className="group overflow-hidden rounded-[20px] border border-[#dfe7f0] bg-white transition hover:-translate-y-0.5 hover:shadow-[0_12px_28px_rgba(15,45,90,0.08)]">
                <div className={`relative flex h-[116px] items-center justify-center overflow-hidden ${
                  index % 3 === 0 ? "bg-[#e4f2ff]" : index % 3 === 1 ? "bg-[#e8f7ef]" : "bg-[#f2ebff]"
                }`}>
                  <div className="absolute -right-8 -top-10 h-28 w-28 rounded-full border-[18px] border-white/50" />
                  <span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-white/85 text-primary shadow-sm">
                    <Icon name={index % 2 === 0 ? "globe" : "route"} size={20} />
                  </span>
                </div>
                <div className="p-4">
                  <p className="text-xs font-extrabold uppercase tracking-[0.1em] text-primary">{item.category}</p>
                  <h3 className="mt-1.5 line-clamp-2 min-h-[40px] text-sm font-extrabold leading-5 text-[#10223f]">{item.title}</h3>
                  <div className="mt-3 flex items-center justify-between border-t border-[#edf2f7] pt-3">
                    <span className="text-xs font-bold text-[#748297]">Konten preview</span>
                    <span className="text-xs font-extrabold text-primary">Baca →</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* BUSINESS ECOSYSTEM */}
        <section className="mx-auto max-w-[1180px] px-4 pb-12">
          <div className="grid gap-4 rounded-2xl border border-[#dce4ee] bg-white p-6 sm:p-7 lg:grid-cols-[1fr_auto] lg:items-center">
            <div>
              <p className="text-xs font-extrabold uppercase tracking-[0.14em] text-primary">
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
              className="inline-flex items-center justify-center rounded-full bg-primary px-5 py-2.5 text-xs font-extrabold text-white hover:opacity-90"
            >
              Bergabung dengan Segaloka
            </Link>
          </div>
        </section>
      </main>

      <footer className="border-t border-[#d9e3ef] bg-[#082d63] pb-20 text-white md:pb-0">
        <div className="mx-auto max-w-[1180px] px-4 py-10 sm:py-12">
          <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-[1.25fr_0.8fr_0.8fr_0.9fr]">
            <div>
              <div className="flex items-center">
                <img
                  src="/brand/segaloka-logo.png"
                  alt="Segaloka"
                  className="h-11 w-auto object-contain brightness-0 invert"
                />
              </div>
              <p className="mt-4 max-w-[330px] text-xs leading-5 text-[#c5d7ed]">
                Ekosistem perjalanan yang menghubungkan Traveler, Travel, Vendor, Agen, Mitra dan Affiliate dalam satu platform.
              </p>
              <div className="mt-5 flex flex-wrap gap-2">
                {["Instagram", "Facebook", "TikTok"].map((social) => (
                  <span key={social} className="rounded-full border border-white/20 px-3 py-1.5 text-xs font-bold text-[#dce9f8]">{social}</span>
                ))}
              </div>
            </div>

            <div>
              <h3 className="text-xs font-extrabold">Produk</h3>
              <div className="mt-4 grid gap-2.5 text-xs text-[#c5d7ed]">
                <Link href="/paket/umrah">Umrah</Link>
                <Link href="/paket/haji">Haji</Link>
                <Link href="/paket/halal_tour">Halal Tour</Link>
                <Link href="/paket/tour">Tour Domestik</Link>
                <Link href="/paket/tour">Tour Internasional</Link>
                <Link href="/akun/segadeals">SegaDeals</Link>
              </div>
            </div>

            <div>
              <h3 className="text-xs font-extrabold">Ekosistem</h3>
              <div className="mt-4 grid gap-2.5 text-xs text-[#c5d7ed]">
                <span>Traveler</span><span>Travel</span><span>Vendor</span>
                <span>Agen</span><span>Mitra</span><span>Affiliate</span>
              </div>
            </div>

            <div>
              <h3 className="text-xs font-extrabold">Bantuan & Perusahaan</h3>
              <div className="mt-4 grid gap-2.5 text-xs text-[#c5d7ed]">
                <span>Pusat Bantuan</span><span>Tentang Segaloka</span>
                <span>Syarat & Ketentuan</span><span>Kebijakan Privasi</span>
                <span>Keamanan Transaksi</span><span>Hubungi Kami</span>
              </div>
              <div className="mt-5">
                <p className="text-xs font-extrabold uppercase tracking-[0.12em] text-[#8fb2da]">Aplikasi Segaloka</p>
                <div className="mt-2 flex gap-2">
                  <span className="rounded-lg border border-white/20 px-3 py-2 text-xs font-bold">Android</span>
                  <span className="rounded-lg border border-white/20 px-3 py-2 text-xs font-bold">iOS</span>
                </div>
              </div>
            </div>
          </div>

          <div className="mt-9 grid gap-5 border-t border-white/15 pt-6 sm:grid-cols-2 lg:grid-cols-3">
            <div>
              <p className="text-xs font-extrabold uppercase tracking-[0.12em] text-[#8fb2da]">Pembayaran</p>
              <p className="mt-2 text-xs leading-5 text-[#c5d7ed]">Payment gateway dan metode pembayaran akan mengikuti konfigurasi production Segaloka.</p>
            </div>
            <div>
              <p className="text-xs font-extrabold uppercase tracking-[0.12em] text-[#8fb2da]">Partner</p>
              <p className="mt-2 text-xs leading-5 text-[#c5d7ed]">Travel dan Vendor terhubung melalui ekosistem Segaloka.</p>
            </div>
            <div>
              <p className="text-xs font-extrabold uppercase tracking-[0.12em] text-[#8fb2da]">Keamanan</p>
              <p className="mt-2 text-xs leading-5 text-[#c5d7ed]">Transaksi, status dan audit mengikuti sistem Segaloka.</p>
            </div>
          </div>

          <div className="mt-7 flex flex-col gap-2 border-t border-white/15 pt-5 text-xs text-[#9eb9d8] sm:flex-row sm:items-center sm:justify-between">
            <span>© 2026 Segaloka. All rights reserved.</span>
            <span>Satu ekosistem untuk perjalanan dan bisnis travel.</span>
          </div>
        </div>
      </footer>

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
              className={`flex flex-col items-center gap-1 py-1 text-xs font-bold ${
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
