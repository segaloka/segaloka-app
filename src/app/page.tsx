import Link from "next/link";
import { PublicNav, PublicFooter } from "@/components/layout/PublicNav";
import { createClient } from "@/lib/supabase/server";
import { formatIDR } from "@/lib/utils";
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

function packageTypeLabel(type: string | null) {
  if (!type) return "Paket";
  if (type === "halal_tour") return "Halal Tour";
  return type.charAt(0).toUpperCase() + type.slice(1);
}

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
                      <span className="block text-sm font-extrabold text-[#10223f]">
                        {service.label}
                      </span>
                      <span className="hidden text-[10px] text-[#718198] lg:block">
                        {service.description}
                      </span>
                    </span>

                    {index === 0 ? (
                      <span className="absolute inset-x-3 bottom-0 h-0.5 rounded-full bg-primary" />
                    ) : null}
                  </Link>
                ))}

                <Link
                  href="/akun/segadeals/baru"
                  className="group relative flex min-w-[128px] items-center justify-center gap-2.5 px-4 py-4 text-[#52647e] transition hover:bg-[#fff9f0]"
                >
                  <span className="flex h-9 w-9 items-center justify-center rounded-full bg-[#fff1d9] text-[#d87900]">
                    <Icon name="handshake" size={17} />
                  </span>
                  <span className="text-left">
                    <span className="block text-sm font-extrabold text-[#10223f]">
                      SegaDeals
                    </span>
                    <span className="hidden text-[10px] text-[#718198] lg:block">
                      Minta Travel menawar
                    </span>
                  </span>
                </Link>
              </div>
            </div>

            <div className="p-4 sm:px-5 sm:py-4">
              <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
                <div className="flex min-w-0 items-center gap-3">
                  <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-[#edf5ff] text-primary">
                    <Icon name="building" size={19} />
                  </span>

                  <div className="min-w-0">
                    <p className="text-[10px] font-bold uppercase tracking-[0.08em] text-[#718198]">
                      Pilihan perjalanan
                    </p>
                    <p className="mt-0.5 truncate text-sm font-extrabold text-[#10223f]">
                      Jelajahi paket Umrah dari Travel di Segaloka
                    </p>
                  </div>
                </div>

                <div className="flex flex-col gap-2 sm:flex-row">
                  <Link
                    href="/akun/segadeals/baru"
                    className="inline-flex h-10 items-center justify-center gap-2 rounded-xl border border-[#f0d8b4] bg-[#fffaf2] px-4 text-xs font-extrabold text-[#b96800] transition hover:bg-[#fff4e3]"
                  >
                    <Icon name="handshake" size={15} />
                    Minta penawaran
                  </Link>

                  <Link
                    href="/paket/umrah"
                    className="inline-flex h-10 items-center justify-center gap-2 rounded-xl bg-primary px-5 text-xs font-extrabold text-white transition hover:bg-primary-hover"
                  >
                    <Icon name="search" size={15} />
                    Lihat Paket Umrah
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* QUICK TRUST */}
        <section className="mx-auto max-w-[1240px] px-4 py-4">
          <div className="flex flex-wrap items-center justify-center gap-x-8 gap-y-3 text-xs text-[#52647e]">
            <span className="flex items-center gap-2">
              <span className="text-success">
                <Icon name="shield" size={15} />
              </span>
              <strong className="text-[#10223f]">Travel terverifikasi</strong>
            </span>

            <span className="hidden h-4 w-px bg-[#dce4ee] sm:block" />

            <span className="flex items-center gap-2">
              <span className="text-info">
                <Icon name="wallet" size={15} />
              </span>
              <strong className="text-[#10223f]">Transaksi tercatat</strong>
            </span>

            <span className="hidden h-4 w-px bg-[#dce4ee] sm:block" />

            <span className="flex items-center gap-2">
              <span className="text-[#d87900]">
                <Icon name="handshake" size={15} />
              </span>
              <strong className="text-[#10223f]">SegaDeals</strong>
            </span>
          </div>
        </section>

        {/* LATEST PACKAGES */}
        <section className="mx-auto max-w-[1240px] px-4 py-6 md:py-7">
          <div className="mb-5 flex items-end justify-between gap-4">
            <div>
              <p className="text-xs font-extrabold uppercase tracking-[0.12em] text-primary">
                Rekomendasi perjalanan
              </p>
              <h2 className="mt-1 font-display text-2xl font-extrabold tracking-tight text-[#10223f] md:text-[28px]">
                Paket terbaru untuk Anda
              </h2>
              <p className="mt-1 text-sm text-[#718198]">
                Lihat paket yang telah dipublikasikan oleh Travel.
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
            <div className="flex flex-col items-start justify-between gap-4 rounded-2xl border border-dashed border-[#ccd8e6] bg-white px-5 py-5 sm:flex-row sm:items-center">
              <div className="flex items-center gap-4">
                <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-[#eef5ff] text-primary">
                  <Icon name="plane" size={19} />
                </div>
                <div>
                  <p className="text-sm font-extrabold text-[#10223f]">
                    Paket sedang disiapkan
                  </p>
                  <p className="mt-1 text-xs leading-5 text-[#718198]">
                    Paket yang dipublikasikan Travel akan tampil otomatis di
                    area ini.
                  </p>
                </div>
              </div>

              <Link
                href="/akun/segadeals/baru"
                className="inline-flex h-9 items-center justify-center rounded-lg border border-primary/20 bg-primary/[0.05] px-4 text-xs font-extrabold text-primary"
              >
                Coba SegaDeals
              </Link>
            </div>
          ) : (
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              {packages.map((p) => (
                <Link
                  key={p.id}
                  href={`/paket/detail/${p.slug}`}
                  className="group overflow-hidden rounded-2xl border border-[#dce4ee] bg-white transition duration-200 hover:-translate-y-1 hover:border-primary/30 hover:shadow-lg"
                >
                  <div className="relative aspect-[16/10] overflow-hidden bg-[linear-gradient(145deg,#dcecff_0%,#f7fbff_54%,#e7f2ff_100%)]">
                    <div className="absolute inset-x-0 bottom-0 h-1/2 bg-[linear-gradient(to_top,rgba(18,79,150,0.08),transparent)]" />

                    <div className="absolute left-3 top-3 rounded-full bg-white px-2.5 py-1 text-[10px] font-extrabold text-primary shadow-sm">
                      {packageTypeLabel(p.type)}
                    </div>

                    <div className="absolute inset-0 flex items-center justify-center text-primary/25">
                      <Icon name="plane" size={34} />
                    </div>
                  </div>

                  <div className="p-4">
                    <div className="flex items-center gap-1.5 text-[11px] font-bold text-[#718198]">
                      <Icon name="shield" size={13} />
                      <span className="truncate">
                        {(p.organizations as any)?.name ?? "Travel"}
                      </span>
                    </div>

                    <p className="mt-2 line-clamp-2 min-h-10 font-display text-sm font-extrabold leading-5 text-[#10223f]">
                      {p.name}
                    </p>

                    <div className="mt-3 flex items-end justify-between gap-3 border-t border-[#edf1f5] pt-3">
                      <span className="text-xs text-[#718198]">
                        {p.duration_days} hari
                      </span>

                      <div className="text-right">
                        <p className="text-[10px] text-[#718198]">
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
        </section>

        {/* SEGADEALS */}
        <section className="mx-auto max-w-[1240px] px-4 py-6 md:py-7">
          <div className="overflow-hidden rounded-3xl bg-[#10223f] text-white">
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

        {/* BUSINESS ECOSYSTEM */}
        <section className="mx-auto max-w-[1240px] px-4 py-6 md:py-7">
          <div className="rounded-3xl border border-[#dce4ee] bg-white p-6 md:flex md:items-center md:justify-between md:gap-8 md:p-8">
            <div>
              <p className="text-xs font-extrabold uppercase tracking-[0.12em] text-primary">
                Ekosistem Segaloka
              </p>
              <h2 className="mt-2 max-w-2xl font-display text-xl font-extrabold tracking-tight text-[#10223f] md:text-2xl">
                Kembangkan bisnis perjalanan bersama Segaloka
              </h2>
              <p className="mt-2 max-w-2xl text-sm leading-6 text-[#718198]">
                Travel, Vendor dan Affiliate terhubung dalam satu ekosistem
                perjalanan.
              </p>
            </div>

            <div className="mt-5 flex flex-col gap-3 sm:flex-row md:mt-0">
              <Link
                href="/register"
                className="inline-flex h-11 items-center justify-center rounded-xl border border-[#ccd8e6] px-5 text-sm font-extrabold text-[#10223f] transition hover:bg-[#f7f9fc]"
              >
                Gabung sebagai Vendor
              </Link>

              <Link
                href="/register"
                className="inline-flex h-11 items-center justify-center rounded-xl bg-primary px-5 text-sm font-extrabold text-white transition hover:bg-primary-hover"
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