import Link from "next/link";
import { notFound } from "next/navigation";
import { MarketplaceHeader } from "@/components/marketplace/MarketplaceHeader";
import { createClient } from "@/lib/supabase/server";
import { formatIDR, formatDate } from "@/lib/utils";
import { WishlistButton } from "@/components/WishlistButton";
import { Icon } from "@/components/layout/Icon";

export default async function PackageDetailPage({ params }: { params: { slug: string } }) {
  const supabase = await createClient();
  const { data: pkg } = await supabase
    .from("packages")
    .select("*, organizations(id, name, slug, status, support_phone, support_email, address, license_type, license_number)")
    .eq("slug", params.slug)
    .eq("status", "published")
    .single();

  if (!pkg) notFound();

  const { data: departures } = await supabase
    .from("departures")
    .select("*")
    .eq("package_id", pkg.id)
    .in("status", ["open", "almost_full"])
    .gte("departure_date", new Date().toISOString().slice(0, 10))
    .order("departure_date", { ascending: true });

  const org = pkg.organizations as {
    id: string; name: string; slug: string; status: string; support_phone: string | null;
    support_email: string | null; address: string | null; license_type: string | null;
    license_number: string | null;
  } | null;

  const rating = null as { average_rating: number | null; review_count: number } | null;

  const inclusions = Array.isArray(pkg.inclusions) ? (pkg.inclusions as string[]) : [];
  const exclusions = Array.isArray(pkg.exclusions) ? (pkg.exclusions as string[]) : [];

  const { data: { user } } = await supabase.auth.getUser();
  let saved = false;
  if (user) {
    const { data: wishlist } = await supabase.from("wishlists").select("id").eq("user_id", user.id).eq("package_id", pkg.id).maybeSingle();
    saved = Boolean(wishlist);
  }

  return (
    <div className="min-h-screen bg-[#f7f9fc] text-[#10223f]">
      <MarketplaceHeader />
      <main className="mx-auto max-w-[1180px] px-3 pb-24 pt-4 sm:px-4 sm:pb-12 sm:pt-6">
        <nav className="mb-3 flex items-center gap-1.5 overflow-hidden text-[11px] font-bold text-[#748297] sm:text-xs">
          <Link href="/" className="shrink-0 hover:text-primary">Beranda</Link><span>/</span>
          <Link href={`/paket/${pkg.type}`} className="shrink-0 hover:text-primary">{pkg.type === "halal_tour" ? "Halal Tour" : pkg.type.charAt(0).toUpperCase() + pkg.type.slice(1)}</Link>
          <span>/</span><span className="truncate text-[#40546f]">{pkg.name}</span>
        </nav>

        <section className="overflow-hidden rounded-[20px] border border-[#dfe7f0] bg-white sm:rounded-[26px]">
          <div className="relative min-h-[180px] bg-[linear-gradient(135deg,#e5f2ff_0%,#f5faff_52%,#e9f8f2_100%)] sm:min-h-[280px]">
            <div className="absolute -right-16 -top-20 h-64 w-64 rounded-full border-[42px] border-white/60" />
            <div className="absolute bottom-4 left-4 flex h-12 w-12 items-center justify-center rounded-2xl bg-white text-primary shadow-sm sm:bottom-6 sm:left-6 sm:h-14 sm:w-14">
              <Icon name={pkg.type === "umrah" ? "building" : pkg.type === "haji" ? "route" : pkg.type === "halal_tour" ? "globe" : "plane"} size={24} />
            </div>
          </div>

          <div className="p-4 sm:p-6">
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0">
                <div className="flex flex-wrap items-center gap-2 text-[11px] font-extrabold sm:text-xs">
                  <span className="rounded-full bg-[#eaf3ff] px-2.5 py-1 text-primary">{pkg.duration_days} hari</span>
                  <span className="rounded-full bg-[#eef8f3] px-2.5 py-1 text-[#167453]">Paket tersedia</span>
                </div>
                <h1 className="mt-2.5 font-display text-[22px] font-extrabold leading-[1.18] tracking-[-0.025em] sm:text-[30px]">{pkg.name}</h1>
              </div>
              <WishlistButton packageId={pkg.id} initialSaved={saved} />
            </div>

            {org && (
              <div className="mt-4 flex flex-wrap items-center gap-3 border-t border-[#edf1f6] pt-4">
                <Link href={`/travel/${org.slug}`} className="flex min-w-0 items-center gap-2.5">
                  <span className="flex h-10 w-10 shrink-0 items-center justify-center overflow-hidden rounded-xl border border-[#dfe7f0] bg-[#f8fbff] text-primary">
                    <Icon name="building" size={18} />
                  </span>
                  <span className="min-w-0"><span className="block truncate text-[13px] font-extrabold sm:text-sm">{org.name}</span><span className="block text-[11px] text-[#748297]">Travel di Segaloka</span></span>
                </Link>
                <span className="h-8 w-px bg-[#e4eaf1]" />
                <div className="flex items-center gap-1.5">
                  <span className="text-[#f5a000]">★</span>
                  {rating && rating.review_count > 0 ? (
                    <><span className="text-sm font-extrabold">{Number(rating.average_rating).toFixed(1)}</span><span className="text-xs text-[#748297]">({rating.review_count} ulasan)</span></>
                  ) : <span className="text-xs font-bold text-[#748297]">Belum ada ulasan</span>}
                </div>
              </div>
            )}
          </div>
        </section>

        <div className="mt-4 grid gap-4 lg:grid-cols-[minmax(0,1fr)_360px] lg:items-start">
          <div className="space-y-4">
            {pkg.description && <section className="rounded-[18px] border border-[#dfe7f0] bg-white p-4 sm:p-6"><h2 className="font-display text-lg font-extrabold">Tentang paket</h2><p className="mt-2 whitespace-pre-line text-[13px] leading-6 text-[#60738d] sm:text-sm">{pkg.description}</p></section>}

            <section className="grid gap-3 sm:grid-cols-2">
              <div className="rounded-[18px] border border-[#dfe7f0] bg-white p-4 sm:p-5">
                <h2 className="flex items-center gap-2 font-display text-base font-extrabold"><span className="text-[#20a67a]">✓</span> Termasuk</h2>
                {inclusions.length ? <ul className="mt-3 space-y-2">{inclusions.map((item, i) => <li key={i} className="flex gap-2 text-[13px] leading-5 text-[#60738d]"><span className="text-[#20a67a]">✓</span><span>{item}</span></li>)}</ul> : <p className="mt-3 text-xs text-[#748297]">Detail fasilitas akan diperbarui Travel.</p>}
              </div>
              <div className="rounded-[18px] border border-[#dfe7f0] bg-white p-4 sm:p-5">
                <h2 className="flex items-center gap-2 font-display text-base font-extrabold"><span className="text-[#b16b00]">×</span> Tidak termasuk</h2>
                {exclusions.length ? <ul className="mt-3 space-y-2">{exclusions.map((item, i) => <li key={i} className="flex gap-2 text-[13px] leading-5 text-[#60738d]"><span className="text-[#b16b00]">×</span><span>{item}</span></li>)}</ul> : <p className="mt-3 text-xs text-[#748297]">Tidak ada informasi tambahan.</p>}
              </div>
            </section>

            {org && <section className="rounded-[18px] border border-[#dfe7f0] bg-white p-4 sm:p-6">
              <div className="flex items-start justify-between gap-3"><div><p className="text-[11px] font-extrabold uppercase tracking-[0.12em] text-primary">Penyelenggara perjalanan</p><h2 className="mt-1 font-display text-lg font-extrabold">{org.name}</h2></div><Link href={`/travel/${org.slug}`} className="text-xs font-extrabold text-primary">Lihat Travel →</Link></div>
              <div className="mt-4 grid gap-2 text-xs text-[#60738d] sm:grid-cols-2">
                {org.license_type && <p><span className="font-extrabold text-[#40546f]">Izin:</span> {org.license_type}{org.license_number ? ` · ${org.license_number}` : ""}</p>}
                {org.address && <p><span className="font-extrabold text-[#40546f]">Alamat:</span> {org.address}</p>}
                {org.support_phone && <p><span className="font-extrabold text-[#40546f]">Kontak:</span> {org.support_phone}</p>}
                {org.support_email && <p><span className="font-extrabold text-[#40546f]">Email:</span> {org.support_email}</p>}
              </div>
            </section>}
          </div>

          <aside className="lg:sticky lg:top-[82px]">
            <div className="rounded-[18px] border border-[#d7e3ef] bg-white p-4 shadow-[0_10px_30px_rgba(15,45,90,0.07)] sm:p-5">
              <p className="text-[11px] font-extrabold uppercase tracking-[0.12em] text-[#748297]">Mulai dari</p>
              <p className="mt-1 font-display text-[26px] font-extrabold text-primary">{formatIDR(pkg.base_price)}</p>
              <p className="text-xs text-[#748297]">per jamaah</p>
              <div className="mt-4 border-t border-[#edf1f6] pt-4">
                <h2 className="text-xs font-extrabold uppercase tracking-[0.1em]">Pilih keberangkatan</h2>
                {!departures?.length ? <div className="mt-3 rounded-xl bg-[#f7f9fc] p-3 text-xs leading-5 text-[#60738d]">Belum ada jadwal terbuka. Silakan lihat kembali nanti atau hubungi Travel.</div> : (
                  <div className="mt-3 space-y-2">
                    {departures.map((d) => {
                      const seats = Math.max(0, d.quota - d.filled);
                      return <Link key={d.id} href={`/booking/baru?departure=${d.id}`} className="group flex items-center justify-between gap-3 rounded-xl border border-[#dfe7f0] p-3 transition hover:border-primary hover:bg-[#f8fbff]">
                        <div><p className="text-[13px] font-extrabold">{formatDate(d.departure_date)}</p><p className={`mt-1 text-[11px] font-bold ${seats <= 10 ? "text-[#b16b00]" : "text-[#60738d]"}`}>{seats} kursi tersisa</p></div><span className="text-sm font-extrabold text-primary">Pilih →</span>
                      </Link>;
                    })}
                  </div>
                )}
              </div>
              <p className="mt-4 text-[11px] leading-4 text-[#748297]">Harga dan ketersediaan mengikuti jadwal yang dipilih. Detail final ditampilkan sebelum konfirmasi booking.</p>
            </div>
          </aside>
        </div>
      </main>
    </div>
  );
}
