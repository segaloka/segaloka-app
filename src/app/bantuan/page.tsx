import type { Metadata } from "next";
import Link from "next/link";
import { PublicFooter, PublicNav } from "@/components/layout/PublicNav";

export const metadata: Metadata = {
  title: "Pusat Bantuan",
};

const help = [
  {
    title: "Akun & Akses",
    text: "Gunakan satu akun Segaloka untuk mengakses layanan traveler. Setelah masuk, fitur yang tersedia akan mengikuti profil dan akses akun Anda.",
  },
  {
    title: "Paket & Booking",
    text: "Pilih paket yang tersedia, buka detail perjalanan, pilih keberangkatan, kemudian lanjutkan proses booking.",
  },
  {
    title: "SegaDeals",
    text: "Sampaikan kebutuhan perjalanan Anda melalui SegaDeals agar permintaan dapat diproses melalui ekosistem Segaloka.",
  },
  {
    title: "Perubahan Perjalanan",
    text: "Permintaan pembatalan, refund, atau perubahan jadwal mengikuti ketentuan paket, Travel, dan transaksi terkait.",
  },
];

export default function BantuanPage() {
  return (
    <div className="min-h-screen bg-bg text-text-primary">
      <PublicNav />

      <main className="mx-auto max-w-5xl px-4 py-12 sm:py-16">
        <p className="text-xs font-extrabold uppercase tracking-[0.16em] text-primary">
          Bantuan
        </p>

        <h1 className="mt-3 font-display text-3xl font-extrabold">
          Pusat Bantuan Segaloka
        </h1>

        <p className="mt-3 max-w-2xl text-sm leading-7 text-text-secondary">
          Temukan informasi dasar untuk menggunakan marketplace dan layanan Segaloka.
        </p>

        <div className="mt-8 grid gap-4 sm:grid-cols-2">
          {help.map((item) => (
            <article
              key={item.title}
              className="rounded-2xl border border-border bg-surface p-5 shadow-sm"
            >
              <h2 className="font-display text-base font-extrabold">
                {item.title}
              </h2>
              <p className="mt-2 text-sm leading-6 text-text-secondary">
                {item.text}
              </p>
            </article>
          ))}
        </div>

        <div className="mt-8 rounded-2xl border border-border bg-surface p-6">
          <h2 className="font-display text-lg font-extrabold">
            Masih membutuhkan bantuan?
          </h2>
          <p className="mt-2 text-sm text-text-secondary">
            Hubungi Segaloka melalui halaman kontak.
          </p>
          <Link
            href="/kontak"
            className="mt-4 inline-flex rounded-lg bg-primary px-5 py-2.5 text-sm font-bold text-primary-fg hover:bg-primary-hover"
          >
            Hubungi Kami
          </Link>
        </div>
      </main>

      <PublicFooter />
    </div>
  );
}