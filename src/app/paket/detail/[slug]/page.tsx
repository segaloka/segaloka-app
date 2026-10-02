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

  let rating: { average_rating: number | null; review_count: number } | null = null;
  if (org?.id) {
    const { data: ratingRows } = await supabase.rpc("get_travel_rating", { p_org_id: org.id });
    rating = ratingRows?.[0] ?? null;
  }

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
          <div className="relative min-h-[220px] bg-[linear-gradient(135deg,#e5f2ff_0%,#f5faff_52%,#e9f8f2_100%)] sm:min-h-[320px]">
            <div className="absolute -right-16 -top-20 h-64 w-64 rounded-full border-[42px] border-white/60" />
            <div className="absolute bottom-4 right-4 flex gap-1.5 sm:bottom-6 sm:right-6"><span className="h-1.5 w-6 rounded-full bg-primary" /><span className="h-1.5 w-1.5 rounded-full bg-white/90" /><span className="h-1.5 w-1.5 rounded-full bg-white/90" /></div>\n            <div className="absolute bottom-4 left-4 flex h-12 w-12 items-center justify-center rounded-2xl bg-white text-primary shadow-sm sm:bottom-6 sm:left-6 sm:h-14 sm:w-14">
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
            <div className="-mx-3 overflow-x-auto px-3 sm:mx-0 sm:px-0">
              <div className="flex min-w-max gap-2">
                <a href="#itinerary" className="rounded-full border border-[#dfe7f0] bg-white px-3 py-2 text-[11px] font-extrabold text-[#40546f]">Itinerary</a>
                <a href="#transport-hotel" className="rounded-full border border-[#dfe7f0] bg-white px-3 py-2 text-[11px] font-extrabold text-[#40546f]">Pesawat & Hotel</a>
                <a href="#facilities" className="rounded-full border border-[#dfe7f0] bg-white px-3 py-2 text-[11px] font-extrabold text-[#40546f]">Fasilitas</a>
                <a href="#travel" className="rounded-full border border-[#dfe7f0] bg-white px-3 py-2 text-[11px] font-extrabold text-[#40546f]">Travel</a>\n                <a href="#reviews" className="rounded-full border border-[#dfe7f0] bg-white px-3 py-2 text-[11px] font-extrabold text-[#40546f]">Ulasan</a>\n                <a href="#terms" className="rounded-full border border-[#dfe7f0] bg-white px-3 py-2 text-[11px] font-extrabold text-[#40546f]">Ketentuan</a>
              </div>
            </div>
            {pkg.description && <section className="rounded-[18px] border border-[#dfe7f0] bg-white p-4 sm:p-6"><h2 className="font-display text-lg font-extrabold">Tentang paket</h2><p className="mt-2 whitespace-pre-line text-[13px] leading-6 text-[#60738d] sm:text-sm">{pkg.description}</p></section>}

            <section className="rounded-[18px] border border-[#dfe7f0] bg-white p-4 sm:p-6">
              <div className="flex items-center justify-between gap-3">
                <div><p className="text-[11px] font-extrabold uppercase tracking-[0.12em] text-primary">Ringkasan perjalanan</p><h2 className="mt-1 font-display text-lg font-extrabold">Detail paket</h2></div>
                <span className="hidden rounded-full bg-[#f2f6fb] px-3 py-1 text-[10px] font-extrabold text-[#748297] sm:inline-flex">Detail perjalanan</span>
              </div>
              <div className="mt-4 grid grid-cols-2 gap-2 sm:grid-cols-4 sm:gap-3">
                {[["route", "Jenis", pkg.type === "halal_tour" ? "Halal Tour" : pkg.type.charAt(0).toUpperCase() + pkg.type.slice(1)], ["globe", "Durasi", `${pkg.duration_days} hari`], ["plane", "Keberangkatan", departures?.[0] ? formatDate(departures[0].departure_date) : "Belum tersedia"], ["users", "Ketersediaan", departures?.length ? `${departures.length} jadwal · ${Math.max(0, departures[0].quota - departures[0].filled)} kursi terdekat` : "Belum tersedia"]].map(([icon, label, value]) => (
                  <div key={label} className="rounded-xl border border-[#e5ebf2] bg-[#fbfcfe] p-3">
                    <span className="text-primary"><Icon name={icon as "route"} size={17} /></span>
                    <p className="mt-2 text-[10px] font-bold uppercase tracking-[0.08em] text-[#8a98aa]">{label}</p>
                    <p className="mt-1 text-xs font-extrabold text-[#40546f]">{value}</p>
                  </div>
                ))}
              </div>
            </section>

            <section id="itinerary" className="rounded-[18px] border border-[#dfe7f0] bg-white p-4 sm:p-6">
              <p className="text-[11px] font-extrabold uppercase tracking-[0.12em] text-primary">Program perjalanan</p>
              <h2 className="mt-1 font-display text-lg font-extrabold">Itinerary</h2>
              <div className="mt-4 space-y-3">
                {["Hari 1", "Hari 2", "Hari berikutnya"].map((day, index) => (
                  <div key={day} className="flex gap-3">
                    <div className="flex flex-col items-center"><span className="flex h-8 w-8 items-center justify-center rounded-full bg-[#eaf3ff] text-xs font-extrabold text-primary">{index + 1}</span>{index < 2 && <span className="mt-1 h-full w-px bg-[#dfe7f0]" />}</div>
                    <div className="min-w-0 pb-4"><p className="text-sm font-extrabold">{day}</p><p className="mt-1 text-xs leading-5 text-[#748297]">Rangkaian kegiatan akan ditampilkan di sini setelah detail itinerary diisi oleh Travel.</p></div>
                  </div>
                ))}
              </div>
            </section>

            <section id="transport-hotel" className="grid gap-3 sm:grid-cols-2">
              <div className="rounded-[18px] border border-[#dfe7f0] bg-white p-4 sm:p-5">
                <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#eaf3ff] text-primary"><Icon name="plane" size={18} /></div>
                <h2 className="mt-3 font-display text-base font-extrabold">Penerbangan</h2>
                <p className="mt-2 text-xs leading-5 text-[#748297]">Maskapai, nomor penerbangan, rute, waktu, dan bagasi akan tampil setelah Travel melengkapi data keberangkatan.</p><div className="mt-4 flex flex-wrap gap-2"><span className="rounded-full bg-[#f4f7fb] px-2.5 py-1 text-[10px] font-bold text-[#748297]">Maskapai</span><span className="rounded-full bg-[#f4f7fb] px-2.5 py-1 text-[10px] font-bold text-[#748297]">Rute</span><span className="rounded-full bg-[#f4f7fb] px-2.5 py-1 text-[10px] font-bold text-[#748297]">Bagasi</span></div>
              </div>
              <div className="rounded-[18px] border border-[#dfe7f0] bg-white p-4 sm:p-5">
                <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#eef8f3] text-[#167453]"><Icon name="bed" size={18} /></div>
                <h2 className="mt-3 font-display text-base font-extrabold">Hotel & akomodasi</h2>
                <p className="mt-2 text-xs leading-5 text-[#748297]">Nama hotel, lokasi, kelas, dan konfigurasi kamar akan ditampilkan sesuai data paket dari Travel.</p><div className="mt-4 flex flex-wrap gap-2"><span className="rounded-full bg-[#f4f7fb] px-2.5 py-1 text-[10px] font-bold text-[#748297]">Nama hotel</span><span className="rounded-full bg-[#f4f7fb] px-2.5 py-1 text-[10px] font-bold text-[#748297]">Lokasi</span><span className="rounded-full bg-[#f4f7fb] px-2.5 py-1 text-[10px] font-bold text-[#748297]">Tipe kamar</span></div>
              </div>
            </section>

            <section id="terms" className="grid gap-3 sm:grid-cols-3">
              {[["doc", "Dokumen & persyaratan", "Persyaratan paspor, visa, dan dokumen perjalanan akan ditampilkan di bagian ini."], ["wallet", "Pembayaran", "Pilihan DP, cicilan, atau pelunasan akan mengikuti ketentuan paket."], ["shield", "Kebijakan perjalanan", "Ketentuan pembatalan, refund, dan reschedule akan tampil sebelum booking."]].map(([icon, title, body]) => (
                <div key={title} className="rounded-[18px] border border-[#dfe7f0] bg-white p-4">
                  <span className="text-primary"><Icon name={icon as "doc"} size={18} /></span><h2 className="mt-3 text-sm font-extrabold">{title}</h2><p className="mt-2 text-xs leading-5 text-[#748297]">{body}</p>
                </div>
              ))}
            </section>

            <section id="facilities" className="grid gap-3 sm:grid-cols-2">
              <div className="rounded-[18px] border border-[#dfe7f0] bg-white p-4 sm:p-5">
                <div className="flex items-center justify-between gap-3"><h2 className="flex items-center gap-2 font-display text-base font-extrabold"><span className="flex h-7 w-7 items-center justify-center rounded-full bg-[#eef8f3] text-[#20a67a]">✓</span> Termasuk</h2>{inclusions.length > 0 && <span className="rounded-full bg-[#f4f7fb] px-2 py-1 text-[10px] font-extrabold text-[#748297]">{inclusions.length} item</span>}</div>
                {inclusions.length ? <ul className="mt-3 space-y-2">{inclusions.map((item, i) => <li key={i} className="flex gap-2 text-[13px] leading-5 text-[#60738d]"><span className="text-[#20a67a]">✓</span><span>{item}</span></li>)}</ul> : <p className="mt-3 text-xs text-[#748297]">Detail fasilitas yang termasuk dalam harga akan ditampilkan setelah dilengkapi Travel.</p>}
              </div>
              <div className="rounded-[18px] border border-[#dfe7f0] bg-white p-4 sm:p-5">
                <div className="flex items-center justify-between gap-3"><h2 className="flex items-center gap-2 font-display text-base font-extrabold"><span className="flex h-7 w-7 items-center justify-center rounded-full bg-[#fff7e8] text-[#b16b00]">×</span> Tidak termasuk</h2>{exclusions.length > 0 && <span className="rounded-full bg-[#f4f7fb] px-2 py-1 text-[10px] font-extrabold text-[#748297]">{exclusions.length} item</span>}</div>
                {exclusions.length ? <ul className="mt-3 space-y-2">{exclusions.map((item, i) => <li key={i} className="flex gap-2 text-[13px] leading-5 text-[#60738d]"><span className="text-[#b16b00]">×</span><span>{item}</span></li>)}</ul> : <p className="mt-3 text-xs text-[#748297]">Detail biaya atau layanan yang tidak termasuk akan ditampilkan setelah dilengkapi Travel.</p>}
              </div>
            </section>

            <section id="reviews" className="rounded-[18px] border border-[#dfe7f0] bg-white p-4 sm:p-6">
              <div className="flex items-start justify-between gap-4">
                <div><p className="text-[11px] font-extrabold uppercase tracking-[0.12em] text-primary">Pengalaman jamaah</p><h2 className="mt-1 font-display text-lg font-extrabold">Rating & ulasan Travel</h2></div>
                {rating && rating.review_count > 0 ? <div className="shrink-0 text-right"><p className="text-2xl font-extrabold text-[#f5a000]">★ {Number(rating.average_rating).toFixed(1)}</p><p className="text-[11px] font-bold text-[#748297]">{rating.review_count} ulasan</p></div> : null}
              </div>
              {rating && rating.review_count > 0 ? <p className="mt-4 rounded-xl bg-[#f7f9fc] p-4 text-xs leading-5 text-[#60738d]">Ringkasan rating berasal dari ulasan booking terverifikasi. Isi ulasan jamaah akan ditampilkan setelah fitur publikasi ulasan tersedia.</p> : <div className="mt-4 rounded-xl border border-dashed border-[#d7e1ec] bg-[#fbfcfe] p-5 text-center"><p className="text-sm font-extrabold">Belum ada ulasan</p><p className="mt-1 text-xs text-[#748297]">Ulasan akan berasal dari jamaah yang melakukan booking melalui Segaloka.</p></div>}
            </section>

            {org && <section id="travel" className="overflow-hidden rounded-[18px] border border-[#dfe7f0] bg-white">
              <div className="bg-[linear-gradient(135deg,#f7fbff,#f5fbf8)] p-4 sm:p-6">
                <div className="flex items-start gap-3">
                  <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl border border-[#dfe7f0] bg-white text-primary shadow-sm"><Icon name="building" size={20} /></span>
                  <div className="min-w-0 flex-1">
                    <p className="text-[10px] font-extrabold uppercase tracking-[0.12em] text-primary">Penyelenggara perjalanan</p>
                    <h2 className="mt-1 truncate font-display text-lg font-extrabold">{org.name}</h2>
                    <div className="mt-1.5 flex flex-wrap items-center gap-x-3 gap-y-1">
                      <span className="text-[11px] font-bold text-[#167453]">Travel di Segaloka</span>
                      <span className="text-[11px] text-[#748297]">{rating && rating.review_count > 0 ? `★ ${Number(rating.average_rating).toFixed(1)} · ${rating.review_count} ulasan` : "Belum ada ulasan"}</span>
                    </div>
                  </div>
                  <Link href={`/travel/${org.slug}`} className="hidden rounded-xl border border-[#cfe0f2] bg-white px-3 py-2 text-[11px] font-extrabold text-primary sm:inline-flex">Lihat Travel →</Link>
                </div>
              </div>
              <div className="grid gap-px bg-[#e8edf3] sm:grid-cols-2">
                <div className="bg-white p-4"><p className="text-[10px] font-bold uppercase tracking-[0.08em] text-[#8a98aa]">Perizinan</p><p className="mt-1 text-xs font-extrabold text-[#40546f]">{org.license_type ? `${org.license_type}${org.license_number ? ` · ${org.license_number}` : ""}` : "Informasi izin belum ditampilkan"}</p></div>
                <div className="bg-white p-4"><p className="text-[10px] font-bold uppercase tracking-[0.08em] text-[#8a98aa]">Kontak</p><p className="mt-1 break-words text-xs font-extrabold text-[#40546f]">{org.support_phone || org.support_email || "Kontak belum ditampilkan"}</p></div>
                <div className="bg-white p-4 sm:col-span-2"><p className="text-[10px] font-bold uppercase tracking-[0.08em] text-[#8a98aa]">Alamat</p><p className="mt-1 text-xs leading-5 text-[#60738d]">{org.address || "Alamat Travel belum ditampilkan."}</p></div>
              </div>
              <div className="p-4 sm:hidden"><Link href={`/travel/${org.slug}`} className="flex w-full items-center justify-center rounded-xl bg-[#eaf3ff] px-4 py-3 text-xs font-extrabold text-primary">Lihat Profil Travel →</Link></div>
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
                      return <Link key={d.id} href={`/booking/baru?departure=${d.id}`} className="group block rounded-xl border border-[#dfe7f0] p-3 transition hover:border-primary hover:bg-[#f8fbff]">
                        <div className="flex items-start justify-between gap-3">
                          <div className="min-w-0">
                            <p className="text-[10px] font-bold uppercase tracking-[0.08em] text-[#8a98aa]">Berangkat</p>
                            <p className="mt-0.5 text-[13px] font-extrabold">{formatDate(d.departure_date)}</p>
                            {d.return_date && <p className="mt-1 text-[11px] text-[#748297]">Kembali {formatDate(d.return_date)}</p>}
                          </div>
                          <span className="shrink-0 rounded-lg bg-[#eaf3ff] px-2.5 py-1.5 text-[11px] font-extrabold text-primary">Pilih →</span>
                        </div>
                        <div className="mt-3 flex items-center justify-between border-t border-[#edf1f6] pt-2.5">
                          <span className={`text-[11px] font-extrabold ${seats <= 10 ? "text-[#b16b00]" : "text-[#167453]"}`}>{seats} kursi tersisa</span>
                          <span className="text-[10px] font-bold text-[#8a98aa]">{d.status === "almost_full" ? "Hampir penuh" : "Tersedia"}</span>
                        </div>
                      </Link>;
                    })}
                  </div>
                )}
              </div>
              <div className="mt-4 grid grid-cols-3 gap-2 border-t border-[#edf1f6] pt-4">
                <div className="text-center"><span className="mx-auto flex h-8 w-8 items-center justify-center rounded-full bg-[#eef8f3] text-[#167453]"><Icon name="check" size={15} /></span><p className="mt-1.5 text-[10px] font-bold text-[#60738d]">Harga transparan</p></div>
                <div className="text-center"><span className="mx-auto flex h-8 w-8 items-center justify-center rounded-full bg-[#eaf3ff] text-primary"><Icon name="shield" size={15} /></span><p className="mt-1.5 text-[10px] font-bold text-[#60738d]">Travel terdaftar</p></div>
                <div className="text-center"><span className="mx-auto flex h-8 w-8 items-center justify-center rounded-full bg-[#fff7e8] text-[#b16b00]"><Icon name="doc" size={15} /></span><p className="mt-1.5 text-[10px] font-bold text-[#60738d]">Detail sebelum bayar</p></div>
              </div>
              <div className="mt-4 rounded-xl bg-[#f7f9fc] p-3">
                <p className="text-[11px] font-extrabold text-[#40546f]">Sebelum melanjutkan booking</p>
                <p className="mt-1 text-[10px] leading-4 text-[#748297]">Periksa jadwal, harga, fasilitas, ketentuan pembayaran, serta kebijakan perjalanan. Detail final ditampilkan sebelum konfirmasi booking.</p>
              </div>
            </div>
          </aside>
        </div>
      </main>
      <div className="fixed inset-x-0 bottom-0 z-40 border-t border-[#dfe7f0] bg-white/95 px-3 py-2.5 backdrop-blur lg:hidden">
        <div className="mx-auto flex max-w-[1180px] items-center justify-between gap-3">
          <div className="min-w-0">
            <p className="text-[10px] font-bold text-[#748297]">{departures?.[0] ? `Berangkat ${formatDate(departures[0].departure_date)}` : "Mulai dari"}</p>
            <div className="flex items-baseline gap-1.5"><p className="font-display text-base font-extrabold text-primary">{formatIDR(pkg.base_price)}</p><span className="text-[9px] font-bold text-[#8a98aa]">/jamaah</span></div>
          </div>
          {departures?.[0] ? <Link href={`/booking/baru?departure=${departures[0].id}`} className="shrink-0 rounded-xl bg-primary px-5 py-3 text-xs font-extrabold text-white shadow-[0_6px_16px_rgba(15,95,175,0.22)]">Pilih Jadwal</Link> : <span className="shrink-0 rounded-xl bg-[#e9eef4] px-4 py-3 text-xs font-extrabold text-[#8a98aa]">Belum ada jadwal</span>}
        </div>
      </div>
    </div>
  );
}
