import Link from "next/link";
import { PublicNav, PublicFooter } from "@/components/layout/PublicNav";
import { createClient } from "@/lib/supabase/server";
import { formatIDR } from "@/lib/utils";
import { EmptyState } from "@/components/ui/EmptyState";
import { Icon } from "@/components/layout/Icon";

const CATEGORIES = [
  { type: "umrah", label: "Umrah", desc: "Paket reguler, plus, hingga VIP", icon: "building" as const },
  { type: "haji", label: "Haji", desc: "Haji khusus & reguler berizin PIHK", icon: "route" as const },
  { type: "halal_tour", label: "Halal Tour", desc: "Wisata ramah muslim domestik & luar negeri", icon: "globe" as const },
  { type: "tour", label: "Tour", desc: "Perjalanan domestik & internasional umum", icon: "plane" as const },
];

export default async function HomePage() {
  const supabase = await createClient();
  const { data: packages } = await supabase
    .from("packages")
    .select("id, name, slug, type, duration_days, base_price, organizations(name, slug)")
    .eq("status", "published")
    .order("created_at", { ascending: false })
    .limit(8);

  return (
    <div className="min-h-screen bg-bg">
      <PublicNav />

      <section className="mx-auto max-w-6xl px-4 pb-10 pt-14">
        <p className="text-xs font-bold uppercase tracking-wider text-primary">Ekosistem Travel Umrah, Haji & Halal Tour</p>
        <h1 className="mt-2 max-w-2xl font-display text-4xl font-extrabold leading-tight text-text-primary md:text-5xl">
          Rencanakan perjalanan ibadah Anda bersama Travel terpercaya
        </h1>
        <p className="mt-4 max-w-xl text-base text-text-secondary">
          Bandingkan paket dari banyak Travel berizin, atau ajukan kebutuhan perjalanan Anda lewat SegaDeals dan biarkan Travel menawarkan harga terbaik.
        </p>
        <div className="mt-6 flex flex-wrap gap-3">
          <Link href="/paket/umrah" className="rounded-md bg-primary px-5 py-3 text-sm font-semibold text-primary-fg hover:bg-primary-hover">
            Jelajahi Paket
          </Link>
          <Link href="/segadeals/baru" className="rounded-md border border-border-strong bg-surface px-5 py-3 text-sm font-semibold text-text-primary hover:bg-bg">
            Ajukan SegaDeals
          </Link>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-4 py-6">
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {CATEGORIES.map((c) => (
            <Link
              key={c.type}
              href={`/paket/${c.type}`}
              className="group rounded-xl border border-border bg-surface p-5 shadow-card transition hover:border-primary/40"
            >
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 text-primary">
                <Icon name={c.icon} size={20} />
              </div>
              <p className="mt-3 font-display text-base font-bold text-text-primary">{c.label}</p>
              <p className="mt-1 text-sm text-text-secondary">{c.desc}</p>
            </Link>
          ))}
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-4 py-10">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="font-display text-xl font-bold text-text-primary">Paket Terbaru</h2>
          <Link href="/paket/umrah" className="text-sm font-semibold text-primary hover:underline">Lihat semua</Link>
        </div>

        {!packages || packages.length === 0 ? (
          <EmptyState
            title="Belum ada paket yang dipublikasikan"
            description="Travel yang telah terverifikasi dapat mempublikasikan paket dari dashboard mereka — paket akan muncul di sini secara otomatis, tanpa input ulang."
          />
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {packages.map((p) => (
              <Link key={p.id} href={`/paket/detail/${p.slug}`} className="rounded-xl border border-border bg-surface shadow-card transition hover:border-primary/40">
                <div className="aspect-[4/3] rounded-t-xl bg-gradient-to-br from-primary/20 to-secondary/20" />
                <div className="p-4">
                  <p className="text-xs font-semibold uppercase tracking-wide text-muted">{(p.organizations as any)?.name}</p>
                  <p className="mt-1 font-display text-sm font-bold text-text-primary line-clamp-2">{p.name}</p>
                  <p className="mt-1 text-xs text-text-secondary">{p.duration_days} hari</p>
                  <p className="mt-2 text-sm font-bold text-primary">{formatIDR(p.base_price)}</p>
                </div>
              </Link>
            ))}
          </div>
        )}
      </section>

      <section className="mx-auto max-w-6xl px-4 py-10">
        <div className="rounded-2xl border border-border bg-surface p-8 shadow-card md:p-10">
          <div className="grid gap-8 md:grid-cols-3">
            <div>
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-success-tint text-success"><Icon name="shield" size={18} /></div>
              <p className="mt-3 font-display text-base font-bold text-text-primary">Travel Terverifikasi</p>
              <p className="mt-1 text-sm text-text-secondary">Legalitas dan izin usaha setiap Travel diverifikasi tim Segaloka sebelum dapat berjualan.</p>
            </div>
            <div>
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-info-tint text-info"><Icon name="wallet" size={18} /></div>
              <p className="mt-3 font-display text-base font-bold text-text-primary">Pembayaran Terlindungi</p>
              <p className="mt-1 text-sm text-text-secondary">Jejak transaksi keuangan tercatat lengkap dari pembayaran hingga settlement ke Travel.</p>
            </div>
            <div>
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-secondary/10 text-secondary"><Icon name="handshake" size={18} /></div>
              <p className="mt-3 font-display text-base font-bold text-text-primary">SegaDeals</p>
              <p className="mt-1 text-sm text-text-secondary">Sampaikan kebutuhan perjalanan Anda sekali, terima penawaran dari banyak Travel sekaligus.</p>
            </div>
          </div>
        </div>
      </section>

      <PublicFooter />
    </div>
  );
}
