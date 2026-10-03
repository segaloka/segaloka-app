import Link from "next/link";
import { Icon } from "@/components/layout/Icon";

export function MarketplaceFooter() {
  return (
    <footer className="border-t border-[#d9e3ef] bg-[#082d63] pb-24 text-white lg:pb-0">
      <div className="mx-auto max-w-[1180px] px-3 py-8 sm:px-4 sm:py-12">
        <div className="grid grid-cols-2 gap-x-5 gap-y-7 sm:grid-cols-2 sm:gap-8 lg:grid-cols-[1.25fr_0.8fr_0.8fr_0.9fr]">
          <div className="col-span-2 sm:col-span-1">
            <img src="/brand/segaloka-logo.png" alt="Segaloka" className="h-9 w-auto object-contain brightness-0 invert sm:h-11" />
            <p className="mt-3 max-w-[330px] text-[11px] leading-[18px] text-[#c5d7ed] sm:mt-4 sm:text-xs sm:leading-5">
              Ekosistem perjalanan yang menghubungkan Traveler, Travel, Vendor, Agen, Mitra dan Affiliate dalam satu platform.
            </p>
            <div className="mt-4 flex items-center gap-2 sm:mt-5">
              {[["instagram","Instagram"],["facebook","Facebook"],["tiktok","TikTok"]].map(([icon,label]) => (
                <Link key={label} href="/kontak" aria-label={label} className="flex h-9 w-9 items-center justify-center rounded-full border border-white/20 text-[#dce9f8] transition hover:border-white/45 hover:bg-white/10 hover:text-white">
                  <Icon name={icon as any} size={17} />
                </Link>
              ))}
            </div>
          </div>
          <div>
            <h3 className="text-xs font-extrabold">Produk</h3>
            <div className="mt-3.5 grid gap-2 text-[11px] text-[#c5d7ed] sm:mt-4 sm:gap-2.5 sm:text-xs">
              <Link href="/paket/umrah">Umrah</Link><Link href="/paket/haji">Haji</Link><Link href="/paket/halal_tour">Halal Tour</Link><Link href="/paket/tour">Tour Domestik</Link><Link href="/paket/tour">Tour Internasional</Link><Link href="/segadeals">SegaDeals</Link>
            </div>
          </div>
          <div>
            <h3 className="text-xs font-extrabold">Ekosistem</h3>
            <div className="mt-4 grid gap-2.5 text-xs text-[#c5d7ed]">
              <Link href="/register?role=traveler">Traveler</Link><Link href="/register?role=travel">Travel</Link><Link href="/register?role=vendor">Vendor</Link><Link href="/register?role=agent">Agen</Link><Link href="/register?role=mitra">Mitra</Link><Link href="/register?role=affiliate">Affiliate</Link>
            </div>
          </div>
          <div className="col-span-2 sm:col-span-1">
            <h3 className="text-xs font-extrabold">Bantuan & Perusahaan</h3>
            <div className="mt-3.5 grid grid-cols-2 gap-x-5 gap-y-2 text-[11px] text-[#c5d7ed] sm:mt-4 sm:grid-cols-1 sm:gap-y-2.5 sm:text-xs">
              <Link href="/bantuan">Pusat Bantuan</Link><Link href="/tentang">Tentang Segaloka</Link><Link href="/syarat">Syarat & Ketentuan</Link><Link href="/privasi">Kebijakan Privasi</Link><Link href="/bantuan">Keamanan Transaksi</Link><Link href="/kontak">Hubungi Kami</Link>
            </div>
            <div className="mt-4 sm:mt-5">
              <p className="text-[11px] font-extrabold uppercase tracking-[0.12em] text-[#8fb2da] sm:text-xs">Aplikasi Segaloka</p>
              <div className="mt-2 flex flex-wrap gap-2">
                <Link href="/kontak" className="rounded-lg border border-white/20 px-3 py-2 text-xs font-bold">Android</Link>
                <Link href="/kontak" className="rounded-lg border border-white/20 px-3 py-2 text-xs font-bold">iOS</Link>
              </div>
            </div>
          </div>
        </div>
        <div className="mt-6 grid grid-cols-3 gap-2 border-t border-white/15 pt-5 sm:mt-9 sm:gap-5 sm:pt-6">
          {[["wallet","Pembayaran","Gateway terintegrasi"],["handshake","Partner","Travel & Vendor"],["shield","Keamanan","Transaksi & audit"]].map(([icon,title,detail]) => (
            <div key={title} className="rounded-xl border border-white/10 bg-white/[0.04] p-2.5 sm:rounded-none sm:border-0 sm:bg-transparent sm:p-0">
              <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-white/10 text-[#cfe3fa]"><Icon name={icon as any} size={15} /></div>
              <p className="mt-2 text-[9px] font-extrabold uppercase tracking-[0.08em] text-[#8fb2da] sm:text-xs">{title}</p>
              <p className="mt-1 text-[10px] leading-4 text-[#c5d7ed] sm:text-xs">{detail}</p>
            </div>
          ))}
        </div>
        <div className="mt-6 flex flex-col gap-1.5 border-t border-white/15 pt-4 text-[10px] text-[#9eb9d8] sm:mt-7 sm:flex-row sm:items-center sm:justify-between sm:text-xs">
          <span>© 2026 Segaloka. All rights reserved.</span>
          <span>Satu ekosistem untuk perjalanan dan bisnis travel.</span>
        </div>
      </div>
    </footer>
  );
}
