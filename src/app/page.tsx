import Link from "next/link";
import { PublicNav, PublicFooter } from "@/components/layout/PublicNav";
import { createClient } from "@/lib/supabase/server";
import { formatIDR } from "@/lib/utils";
import { EmptyState } from "@/components/ui/EmptyState";
import { Icon } from "@/components/layout/Icon";

const CATEGORIES = [
  {
    type: "umrah",
    label: "Umrah",
    desc: "Paket reguler, plus, hingga VIP",
    icon: "building" as const,
  },
  {
    type: "haji",
    label: "Haji",
    desc: "Pilihan perjalanan Haji dari Travel",
    icon: "route" as const,
  },
  {
    type: "halal_tour",
    label: "Halal Tour",
    desc: "Wisata ramah muslim dalam & luar negeri",
    icon: "globe" as const,
  },
  {
    type: "tour",
    label: "Tour",
    desc: "Perjalanan domestik & internasional",
    icon: "plane" as const,
  },
];

export default async function HomePage() {
  const supabase = await createClient();

  const { data: packages } = await supabase
    .from("packages")
    .select(
      "id, name, slug, type, duration_days, base_price, organizations(name, slug)",
    )
    .eq("status", "published")
    .order("created_at", { ascending: false })
    .limit(8);

  return (
    <div className="min-h-screen bg-bg">
      <PublicNav />

      <main className="pb-16 md:pb-0">
        {/* ==================================================
            HERO
        ================================================== */}
        <section className="relative overflow-hidden bg-[#0b2b57] text-white">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_82%_18%,rgba(77,155,255,0.34),transparent_30%),radial-gradient(circle_at_10%_100%,rgba(10,102,224,0.34),transparent_36%)]" />

          <div className="relative mx-auto max-w-6xl px-4 pb-28 pt-12 md:pb-32 md:pt-16">
            <p className="text-xs font-bold uppercase tracking-[0.14em] text-[#d6e7ff]">
              Ekosistem Travel Umrah, Haji & Halal Tour
            </p>

            <h1 className="mt-3 max-w-4xl font-display text-3xl font-extrabold leading-[1.12] tracking-tight sm:text-4xl md:text-5xl">
              Temukan paket ibadah & wisata halal dari Travel terverifikasi
            </h1>

            <p className="mt-4 max-w-2xl text-sm leading-7 text-[#e3eeff] sm:text-base md:text-lg">
              Bandingkan paket, jadwal dan fasilitas dari berbagai Travel dalam
              satu tempat, lalu pilih perjalanan yang paling sesuai dengan
              kebutuhan Anda.
            </p>
          </div>
        </section>

        {/* ==================================================
            MARKETPLACE SEARCH / CATEGORY PANEL
        ================================================== */}
        <section className="relative z-10 mx-auto -mt-20 max-w-6xl px-4">
          <div className="rounded-2xl border border-border bg-surface p-4 shadow-card sm:p-5 md:rounded-3xl md:p-6">
            <div className="flex items-center justify-between gap-4">
              <div>
                <p className="font-display text-base font-bold text-text-primary md:text-lg">
                  Cari perjalanan Anda
                </p>
                <p className="mt-1 text-xs text-text-secondary md:text-sm">
                  Pilih jenis perjalanan untuk melihat paket yang tersedia.
                </p>
              </div>

              <div className="hidden rounded-full bg-primary/10 px-3 py-1.5 text-xs font-bold text-primary sm:block">
                Travel Marketplace
              </div>
            </div>

            <div className="mt-5 grid grid-cols-2 gap-3 md:grid-cols-4">
              {CATEGORIES.map((category) => (
                <Link
                  key={category.type}
                  href={`/paket/${category.type}`}
                  className="group flex min-h-28 flex-col justify-between rounded-2xl border border-border bg-white p-4 transition hover:border-primary/50 hover:shadow-card"
                >
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10 text-primary transition group-hover:bg-primary group-hover:text-white">
                    <Icon name={category.icon} size={20} />
                  </div>

                  <div className="mt-4">
                    <div className="flex items-center justify-between gap-2">
                      <p className="font-display text-sm font-bold text-text-primary md:text-base">
                        {category.label}
                      </p>
                      <span className="text-primary">→</span>
                    </div>

                    <p className="mt-1 hidden text-xs leading-5 text-text-secondary sm:block">
                      {category.desc}
                    </p>
                  </div>
                </Link>
              ))}
            </div>

            <div className="mt-4 flex flex-col gap-3 rounded-2xl bg-[#f5f8fd] p-4 sm:flex-row sm:items-center sm:justify-between">
              <div className="flex items-start gap-3">
                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-white text-primary shadow-sm">
                  <Icon name="search" size={18} />
                </div>
                <div>
                  <p className="text-sm font-bold text-text-primary">
                    Belum tahu ingin memilih paket yang mana?
                  </p>
                  <p className="mt-0.5 text-xs leading-5 text-text-secondary">
                    Jelajahi paket Umrah terlebih dahulu atau gunakan SegaDeals
                    agar Travel dapat memberikan penawaran.
                  </p>
                </div>
              </div>

              <Link
                href="/paket/umrah"
                className="inline-flex h-11 shrink-0 items-center justify-center rounded-xl bg-primary px-5 text-sm font-bold text-primary-fg transition hover:bg-primary-hover"
              >
                Cari Paket
              </Link>
            </div>
          </div>
        </section>

        {/* ==================================================
            TRUST STRIP
        ================================================== */}
        <section className="mx-auto max-w-6xl px-4 py-8">
          <div className="grid gap-3 md:grid-cols-3">
            <div className="flex items-start gap-3 rounded-2xl bg-white p-4">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-success-tint text-success">
                <Icon name="shield" size={18} />
              </div>
              <div>
                <p className="text-sm font-bold text-text-primary">
                  Travel Terverifikasi
                </p>
                <p className="mt-1 text-xs leading-5 text-text-secondary">
                  Legalitas dan izin usaha Travel diverifikasi sebelum dapat
                  berjualan di Segaloka.
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3 rounded-2xl bg-white p-4">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-info-tint text-info">
                <Icon name="wallet" size={18} />
              </div>
              <div>
                <p className="text-sm font-bold text-text-primary">
                  Pembayaran Terlindungi
                </p>
                <p className="mt-1 text-xs leading-5 text-text-secondary">
                  Jejak transaksi tercatat dari pembayaran hingga proses
                  settlement.
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3 rounded-2xl bg-white p-4">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-secondary/10 text-secondary">
                <Icon name="handshake" size={18} />
              </div>
              <div>
                <p className="text-sm font-bold text-text-primary">SegaDeals</p>
                <p className="mt-1 text-xs leading-5 text-text-secondary">
                  Sampaikan kebutuhan sekali dan terima penawaran dari Travel.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* ==================================================
            LATEST PACKAGES — REAL SUPABASE DATA
        ================================================== */}
        <section className="mx-auto max-w-6xl px-4 py-8 md:py-10">
          <div className="mb-5 flex items-end justify-between gap-4">
            <div>
              <p className="text-xs font-bold uppercase tracking-wider text-primary">
                Jelajahi
              </p>
              <h2 className="mt-1 font-display text-2xl font-extrabold text-text-primary md:text-3xl">
                Paket Terbaru
              </h2>
              <p className="mt-1 text-sm text-text-secondary">
                Paket terbaru yang telah dipublikasikan oleh Travel.
              </p>
            </div>

            <Link
              href="/paket/umrah"
              className="hidden text-sm font-bold text-primary hover:underline sm:block"
            >
              Lihat semua →
            </Link>
          </div>

          {!packages || packages.length === 0 ? (
            <EmptyState
              title="Belum ada paket yang dipublikasikan"
              description="Travel yang telah terverifikasi dapat mempublikasikan paket dari dashboard mereka. Paket akan muncul di sini secara otomatis."
            />
          ) : (
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              {packages.map((p) => (
                <Link
                  key={p.id}
                  href={`/paket/detail/${p.slug}`}
                  className="group overflow-hidden rounded-2xl border border-border bg-surface shadow-card transition hover:-translate-y-0.5 hover:border-primary/40"
                >
                  <div className="relative aspect-[4/3] bg-gradient-to-br from-[#dbe7f8] via-[#eef5ff] to-[#d8e8ff]">
                    <div className="absolute left-3 top-3 rounded-full bg-white/95 px-3 py-1 text-[11px] font-bold uppercase tracking-wide text-primary shadow-sm">
                      {String(p.type ?? "").replaceAll("_", " ")}
                    </div>

                    <div className="absolute inset-0 flex items-center justify-center text-primary/35">
                      <Icon name="plane" size={36} />
                    </div>
                  </div>

                  <div className="p-4">
                    <div className="flex items-center gap-1.5 text-xs font-semibold text-text-secondary">
                      <Icon name="shield" size={13} />
                      <span className="truncate">
                        {(p.organizations as any)?.name ?? "Travel"}
                      </span>
                    </div>

                    <p className="mt-2 line-clamp-2 min-h-10 font-display text-sm font-bold leading-5 text-text-primary">
                      {p.name}
                    </p>

                    <div className="mt-3 flex items-center justify-between gap-3">
                      <span className="text-xs text-text-secondary">
                        {p.duration_days} hari
                      </span>

                      <span className="text-sm font-extrabold text-primary">
                        {formatIDR(p.base_price)}
                      </span>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          )}

          <Link
            href="/paket/umrah"
            className="mt-5 flex h-11 items-center justify-center rounded-xl border border-border-strong bg-white text-sm font-bold text-primary sm:hidden"
          >
            Lihat semua paket
          </Link>
        </section>

        {/* ==================================================
            SEGADEALS
        ================================================== */}
        <section className="mx-auto max-w-6xl px-4 py-8 md:py-10">
          <div className="overflow-hidden rounded-3xl bg-[#0b1f3f] text-white">
            <div className="grid gap-8 p-6 md:grid-cols-[1.15fr_0.85fr] md:p-10">
              <div>
                <span className="inline-flex rounded-full bg-[#ff9f1c] px-3 py-1.5 text-xs font-extrabold text-[#241400]">
                  SegaDeals
                </span>

                <h2 className="mt-4 max-w-xl font-display text-2xl font-extrabold leading-tight md:text-3xl">
                  Belum menemukan paket yang pas? Biar Travel yang menawar
                  untuk Anda.
                </h2>

                <p className="mt-3 max-w-xl text-sm leading-6 text-[#c7d6ee] md:text-base">
                  Sampaikan kebutuhan perjalanan Anda, kemudian bandingkan
                  penawaran yang masuk sebelum menentukan pilihan.
                </p>

                <Link
                  href="/akun/segadeals/baru"
                  className="mt-6 inline-flex h-12 items-center justify-center rounded-xl bg-[#ff9f1c] px-5 text-sm font-extrabold text-[#241400] transition hover:brightness-95"
                >
                  Ajukan SegaDeals
                </Link>
              </div>

              <div className="grid gap-3">
                {[
                  "Sampaikan kebutuhan perjalanan",
                  "Travel mengirim penawaran",
                  "Bandingkan dan pilih penawaran",
                ].map((step, index) => (
                  <div
                    key={step}
                    className="flex items-center gap-3 rounded-2xl bg-[#13305c] p-4"
                  >
                    <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-[#4d9bff] text-sm font-extrabold text-[#04142e]">
                      {index + 1}
                    </span>
                    <span className="text-sm font-semibold">{step}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* ==================================================
            PARTNER CTA
        ================================================== */}
        <section className="mx-auto max-w-6xl px-4 py-8 md:py-10">
          <div className="rounded-3xl border border-border bg-white p-6 shadow-card md:flex md:items-center md:justify-between md:gap-8 md:p-8">
            <div>
              <p className="font-display text-xl font-extrabold text-text-primary md:text-2xl">
                Punya bisnis Travel, Vendor, atau ingin menjadi Affiliate?
              </p>
              <p className="mt-2 max-w-2xl text-sm leading-6 text-text-secondary">
                Kelola operasional dan layanan bisnis Anda dalam ekosistem
                Segaloka.
              </p>
            </div>

            <div className="mt-5 flex flex-col gap-3 sm:flex-row md:mt-0">
              <Link
                href="/register"
                className="inline-flex h-12 items-center justify-center rounded-xl border border-border-strong px-5 text-sm font-bold text-text-primary transition hover:bg-bg"
              >
                Gabung sebagai Vendor
              </Link>

              <Link
                href="/register"
                className="inline-flex h-12 items-center justify-center rounded-xl bg-primary px-5 text-sm font-bold text-primary-fg transition hover:bg-primary-hover"
              >
                Daftarkan Travel
              </Link>
            </div>
          </div>
        </section>
      </main>

      <PublicFooter />

      {/* ==================================================
          MOBILE BOTTOM NAVIGATION — MASTER HOMEPAGE
      ================================================== */}
      <nav className="fixed inset-x-0 bottom-0 z-40 grid h-16 grid-cols-5 border-t border-border bg-white md:hidden">
        <Link
          href="/"
          className="flex flex-col items-center justify-center gap-1 text-[10px] font-extrabold text-primary"
        >
          <Icon name="home" size={19} />
          Beranda
        </Link>

        <Link
          href="/paket/umrah"
          className="flex flex-col items-center justify-center gap-1 text-[10px] font-bold text-text-secondary"
        >
          <Icon name="search" size={19} />
          Jelajah
        </Link>

        <Link
          href="/akun/segadeals"
          className="flex flex-col items-center justify-center gap-1 text-[10px] font-bold text-text-secondary"
        >
          <Icon name="handshake" size={19} />
          SegaDeals
        </Link>

        <Link
          href="/akun/booking"
          className="flex flex-col items-center justify-center gap-1 text-[10px] font-bold text-text-secondary"
        >
          <Icon name="booking" size={19} />
          Booking
        </Link>

        <Link
          href="/akun"
          className="flex flex-col items-center justify-center gap-1 text-[10px] font-bold text-text-secondary"
        >
          <Icon name="user" size={19} />
          Akun
        </Link>
      </nav>
    </div>
  );
}