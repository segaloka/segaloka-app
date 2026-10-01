import type { Metadata } from "next";
import Link from "next/link";
import { PublicFooter, PublicNav } from "@/components/layout/PublicNav";

export const metadata: Metadata = {
  title: "Kontak",
};

export default function KontakPage() {
  return (
    <div className="min-h-screen bg-bg text-text-primary">
      <PublicNav />

      <main className="mx-auto max-w-4xl px-4 py-12 sm:py-16">
        <p className="text-xs font-extrabold uppercase tracking-[0.16em] text-primary">
          Kontak
        </p>

        <h1 className="mt-3 font-display text-3xl font-extrabold">
          Hubungi Segaloka
        </h1>

        <p className="mt-3 max-w-2xl text-sm leading-7 text-text-secondary">
          Untuk pertanyaan mengenai akun, perjalanan, kerja sama, atau penggunaan platform, gunakan kanal bantuan Segaloka.
        </p>

        <div className="mt-8 rounded-2xl border border-border bg-surface p-6 shadow-sm">
          <h2 className="font-display text-lg font-extrabold">
            Pusat Bantuan
          </h2>
          <p className="mt-2 text-sm leading-6 text-text-secondary">
            Informasi kontak operasional akan mengikuti konfigurasi resmi Segaloka. Gunakan Pusat Bantuan untuk melihat panduan layanan yang tersedia.
          </p>
          <Link
            href="/bantuan"
            className="mt-5 inline-flex rounded-lg bg-primary px-5 py-2.5 text-sm font-bold text-primary-fg hover:bg-primary-hover"
          >
            Buka Pusat Bantuan
          </Link>
        </div>
      </main>

      <PublicFooter />
    </div>
  );
}