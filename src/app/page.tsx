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
    shortLabel: "UM",
    desc: "Paket reguler, plus, hingga VIP",
    icon: "building" as const,
  },
  {
    type: "haji",
    label: "Haji",
    shortLabel: "HJ",
    desc: "Pilihan perjalanan Haji dari Travel",
    icon: "route" as const,
  },
  {
    type: "halal_tour",
    label: "Halal Tour",
    shortLabel: "HT",
    desc: "Wisata ramah muslim dalam & luar negeri",
    icon: "globe" as const,
  },
  {
    type: "tour",
    label: "Tour",
    shortLabel: "TR",
    desc: "Perjalanan domestik & internasional",
    icon: "plane" as const,
  },
];

const SEGADEALS_STEPS = [
  "Sampaikan kebutuhan perjalanan",
  "Travel mengirim penawaran",
  "Bandingkan dan pilih penawaran",
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
        {/* HERO */}
        <section className="relative overflow-hidden bg-[#0b2b57] text-white">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_80%_18%,rgba(65,145,255,0.42),transparent_31%),radial-gradient(circle_at_12%_100%,rgba(10,102,224,0.40),transparent_38%)]" />
          <div className="absolute -right-24 top-8 h-72 w-72 rounded-full border border-white/10" />
          <div className="absolute -right-8 top-24 h-52 w-52 rounded-full border border-white/10" />

          <div className="relative mx-auto max-w-6xl px-4 pb-24 pt-10 sm:pt-12 md:pb-28 md:pt-14">
            <div className="max-w-4xl">
              <p className="text-[11px] font-extrabold uppercase tracking-[0.16em] text-[#d6e7ff] sm:text-xs">
                Ekosistem Travel Umrah, Haji & Halal Tour
              </p>

              <h1 className="mt-3 max-w-3xl font-display text-[32px] font-extrabold leading-[1.1] tracking-[-0.025em] sm:text-4xl md:text-[46px]">
                Temukan perjalanan yang tepat dari Travel terverifikasi
              </h1>

              <p className="mt-4 max-w-2xl text-sm leading-6 text-[#dce9fb] sm:text-base sm:leading-7">
                Jelajahi paket Umrah, Haji, Halal Tour dan Tour dalam satu
                marketplace, lalu bandingkan pilihan yang sesuai dengan
                kebutuhan perjalanan Anda.
              </p>
            </div>
          </div>
        </section>

        {/* MARKETPLACE SEARCH */}
        <section className="relative z-10 mx-auto -mt-12 max-w-6xl px-4">
          <div className="overflow-hidden rounded-2xl border border-border bg-white shadow-[0_18px_50px_rgba(15,27,45,0.12)]">
            <div className="border-b border-border px-4 py-3.5 sm:px-5">
              <div className="flex items-center justify-between gap-4">
                <div>
                  <p className="font-display text-base font-extrabold text-text-primary">
                    Mau perjalanan ke mana?
                  </p>
                  <p className="mt-0.5 text-xs text-text-secondary">
                    Pilih jenis perjalanan untuk melihat paket yang tersedia.
                  </p>
                </div>

                <span className="hidden rounded-full bg-primary/10 px-3 py-1.5 text-[11px] font-extrabold text-primary sm:inline-flex">
                  Travel Marketplace
                </span>
              </div>
            </div>

            <div className="grid grid-cols-2 divide-x divide-y divide-border sm:grid-cols-4 sm:divide-y-0">
              {CATEGORIES.map((category) => (
                <Link
                  key={category.type}
                  href={`/paket/${category.type}`}
                  className="group flex min-h-[88px] items-center gap-3 px-4 py-4 transition hover:bg-primary/[0.035]"
                >
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary transition group-hover:bg-primary group-hover:text-white">
                    <Icon name={category.icon} size={19} />
                  </div>

                  <div className="min-w-0">
                    <p className="font-display text-sm font-extrabold text-text-primary">
                      {category.label}
                    </p>
                    <p className="mt-1 hidden truncate text-[11px] leading-4 text-text-secondary lg:block">
                      {category.desc}
                    </p>
                  </div>
                </Link>
              ))}
            </div>

            <div className="flex flex-col gap-3 border-t border-border bg-[#fbfcfe] px-4 py-3.5 sm:flex-row sm:items-center sm:justify-between sm:px-5">
              <div className="flex items-center gap-2 text-xs text-text-secondary">
                <Icon name="shield" size={15} />
                <span>
                  Paket yang tampil berasal dari Travel yang telah bergabung di
                  ekosistem Segaloka.
                </span>
              </div>

              <Link
                href="/paket/umrah"
                className="inline-flex h-10 shrink-0 items-center justify-center rounded-xl bg-primary px-5 text-sm font-extrabold text-primary-fg transition hover:bg-primary-hover"
              >
                <Icon name="search" size={16} />
                <span className="ml-2">Cari Paket</span>
              </Link>
            </div>
          </div>
        </section>

        {/* TRUST */}
        <section className="mx-auto max-w-6xl px-4 py-7 md:py-8">
          <div className="grid gap-3 md:grid-cols-3">
            <div className="flex items-start gap-3 rounded-2xl border border-border/70 bg-white p-4">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-success-tint text-success">
                <Icon name="shield" size={18} />
              </div>
              <div>
                <p className="text-sm font-extrabold text-text-primary">
                  Travel Terverifikasi
                </p>
                <p className="mt-1 text-xs leading-5 text-text-secondary">
                  Legalitas dan izin usaha Travel diverifikasi sebelum dapat
                  berjualan di Segaloka.
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3 rounded-2xl border border-border/70 bg-white p-4">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-info-tint text-info">
                <Icon name="wallet" size={18} />
              </div>
              <div>
                <p className="text-sm font-extrabold text-text-primary">
                  Transaksi Tercatat
                </p>
                <p className="mt-1 text-xs leading-5 text-text-secondary">
                  Aktivitas pembayaran dan booking tercatat dalam ekosistem
                  Segaloka sesuai alur transaksi.
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3 rounded-2xl border border-border/70 bg-white p-4">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-secondary/10 text-secondary">
                <Icon name="handshake" size={18} />
              </div>
              <div>
                <p className="text-sm font-extrabold text-text-primary">
                  SegaDeals
                </p>
                <p className="mt-1 text-xs leading-5 text-text-secondary">
                  Sampaikan kebutuhan sekali dan terima penawaran dari Travel.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* LATEST PACKAGES — REAL DATA */}
        <section className="mx-auto max-w-6xl px-4 py-7 md:py-9">
          <div className="mb-5 flex items-end justify-between gap-4">
            <div>
              <p className="text-xs font-extrabold uppercase tracking-[0.12em] text-primary">
                Pilihan perjalanan
              </p>
              <h2 className="mt-1 font-display text-2xl font-extrabold tracking-tight text-text-primary md:text-[28px]">
                Paket Terbaru
              </h2>
              <p className="mt-1 text-sm text-text-secondary">
                Paket terbaru yang telah dipublikasikan oleh Travel.
              </p>
            </div>

            <Link
              href="/paket/umrah"
              className="hidden text-sm font-extrabold text-primary hover:underline sm:block"
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
                  className="group overflow-hidden rounded-2xl border border-border bg-white shadow-card transition duration-200 hover:-translate-y-1 hover:border-primary/30 hover:shadow-lg"
                >
                  <div className="relative aspect-[16/10] overflow-hidden bg-[linear-gradient(145deg,#dbe9fb_0%,#f2f7fd_52%,#d8e7fa_100%)]">
                    <div className="absolute -right-5 -top-8 h-28 w-28 rounded-full border border-primary/10" />
                    <div className="absolute right-6 top-4 h-16 w-16 rounded-full border border-primary/10" />

                    <div className="absolute left-3 top-3 rounded-full bg-white/95 px-2.5 py-1 text-[10px] font-extrabold uppercase tracking-wide text-primary shadow-sm">
                      {String(p.type ?? "").replaceAll("_", " ")}
                    </div>

                    <div className="absolute inset-0 flex items-center justify-center text-primary/30">
                      <Icon name="plane" size={34} />
                    </div>
                  </div>

                  <div className="p-4">
                    <div className="flex items-center gap-1.5 text-[11px] font-bold text-text-secondary">
                      <Icon name="shield" size={13} />
                      <span className="truncate">
                        {(p.organizations as any)?.name ?? "Travel"}
                      </span>
                    </div>

                    <p className="mt-2 line-clamp-2 min-h-10 font-display text-sm font-extrabold leading-5 text-text-primary">
                      {p.name}
                    </p>

                    <div className="mt-3 flex items-end justify-between gap-3 border-t border-border/70 pt-3">
                      <span className="text-xs text-text-secondary">
                        {p.duration_days} hari
                      </span>

                      <div className="text-right">
                        <p className="text-[10px] text-text-secondary">
                          Mulai dari
                        </p>
                        <p className="text-sm font-extrabold text-primary">
                          {formatIDR(p.base_price)}
                        </p>
                      </div>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          )}

          <Link
            href="/paket/umrah"
            className="mt-5 flex h-11 items-center justify-center rounded-xl border border-border-strong bg-white text-sm font-extrabold text-primary sm:hidden"
          >
            Lihat semua paket
          </Link>
        </section>

        {/* SEGADEALS */}
        <section className="mx-auto max-w-6xl px-4 py-7 md:py-9">
          <div className="overflow-hidden rounded-3xl bg-[#0b1f3f] text-white">
            <div className="grid gap-8 p-6 md:grid-cols-[1.08fr_0.92fr] md:p-9">
              <div>
                <span className="inline-flex rounded-full bg-[#ff9f1c] px-3 py-1.5 text-xs font-extrabold text-[#241400]">
                  SegaDeals
                </span>

                <h2 className="mt-4 max-w-xl font-display text-2xl font-extrabold leading-tight md:text-[30px]">
                  Belum menemukan paket yang pas? Biar Travel yang menawar
                  untuk Anda.
                </h2>

                <p className="mt-3 max-w-xl text-sm leading-6 text-[#c7d6ee]">
                  Sampaikan kebutuhan perjalanan Anda satu kali. Travel dapat
                  memberikan penawaran untuk Anda bandingkan sebelum memilih.
                </p>

                <Link
                  href="/akun/segadeals/baru"
                  className="mt-6 inline-flex h-11 items-center justify-center rounded-xl bg-[#ff9f1c] px-5 text-sm font-extrabold text-[#241400] transition hover:brightness-95"
                >
                  Ajukan SegaDeals
                </Link>
              </div>

              <div className="grid content-center gap-2.5">
                {SEGADEALS_STEPS.map((step, index) => (
                  <div
                    key={step}
                    className="flex items-center gap-3 rounded-2xl border border-white/10 bg-white/[0.06] p-3.5"
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

        {/* ECOSYSTEM CTA */}
        <section className="mx-auto max-w-6xl px-4 py-7 md:py-9">
          <div className="rounded-3xl border border-border bg-white p-6 shadow-card md:flex md:items-center md:justify-between md:gap-8 md:p-8">
            <div>
              <p className="text-xs font-extrabold uppercase tracking-[0.12em] text-primary">
                Ekosistem Segaloka
              </p>
              <h2 className="mt-2 max-w-2xl font-display text-xl font-extrabold tracking-tight text-text-primary md:text-2xl">
                Punya bisnis Travel, Vendor, atau ingin menjadi Affiliate?
              </h2>
              <p className="mt-2 max-w-2xl text-sm leading-6 text-text-secondary">
                Kelola layanan dan operasional bisnis Anda dalam satu ekosistem
                perjalanan.
              </p>
            </div>

            <div className="mt-5 flex flex-col gap-3 sm:flex-row md:mt-0">
              <Link
                href="/register"
                className="inline-flex h-11 items-center justify-center rounded-xl border border-border-strong px-5 text-sm font-extrabold text-text-primary transition hover:bg-bg"
              >
                Gabung sebagai Vendor
              </Link>

              <Link
                href="/register"
                className="inline-flex h-11 items-center justify-center rounded-xl bg-primary px-5 text-sm font-extrabold text-primary-fg transition hover:bg-primary-hover"
              >
                Daftarkan Travel
              </Link>
            </div>
          </div>
        </section>
      </main>

      <PublicFooter />

      {/* MOBILE BOTTOM NAV */}
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