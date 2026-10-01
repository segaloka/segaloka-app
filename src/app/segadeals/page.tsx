import type { Metadata } from "next";
import Link from "next/link";
import { PublicFooter, PublicNav } from "@/components/layout/PublicNav";

export const metadata: Metadata = {
  title: "SegaDeals",
  description:
    "Sampaikan kebutuhan perjalanan Anda melalui SegaDeals dan kelola permintaan melalui akun Segaloka.",
};

export default function SegaDealsPage() {
  return (
    <div className="min-h-screen bg-bg text-text-primary">
      <PublicNav />

      <main>
        <section className="border-b border-border bg-surface">
          <div className="mx-auto max-w-5xl px-4 py-14 sm:py-20">
            <p className="text-xs font-extrabold uppercase tracking-[0.16em] text-primary">
              SegaDeals
            </p>

            <h1 className="mt-3 max-w-3xl font-display text-3xl font-extrabold leading-tight sm:text-4xl">
              Sampaikan kebutuhan perjalanan Anda.
            </h1>

            <p className="mt-4 max-w-2xl text-sm leading-7 text-text-secondary sm:text-base">
              Gunakan SegaDeals untuk membuat permintaan perjalanan dan mengelolanya melalui akun Segaloka.
            </p>

            <div className="mt-7 flex flex-wrap gap-3">
              <Link
                href="/akun/segadeals/baru"
                className="inline-flex rounded-lg bg-primary px-5 py-3 text-sm font-bold text-primary-fg hover:bg-primary-hover"
              >
                Buat Permintaan
              </Link>

              <Link
                href="/akun/segadeals"
                className="inline-flex rounded-lg border border-border-strong bg-surface px-5 py-3 text-sm font-bold text-text-primary hover:bg-bg"
              >
                Lihat Permintaan Saya
              </Link>
            </div>
          </div>
        </section>

        <section className="mx-auto grid max-w-5xl gap-4 px-4 py-12 sm:grid-cols-3">
          {[
            ["1", "Sampaikan kebutuhan", "Isi kebutuhan perjalanan yang ingin Anda cari."],
            ["2", "Kelola permintaan", "Pantau permintaan dan penawaran melalui akun Anda."],
            ["3", "Lanjutkan transaksi", "Pilih penawaran yang sesuai dan lanjutkan proses booking."],
          ].map(([number, title, description]) => (
            <article
              key={number}
              className="rounded-2xl border border-border bg-surface p-5 shadow-sm"
            >
              <span className="flex h-9 w-9 items-center justify-center rounded-full bg-primary/10 text-sm font-extrabold text-primary">
                {number}
              </span>

              <h2 className="mt-4 font-display text-base font-extrabold">
                {title}
              </h2>

              <p className="mt-2 text-sm leading-6 text-text-secondary">
                {description}
              </p>
            </article>
          ))}
        </section>
      </main>

      <PublicFooter />
    </div>
  );
}