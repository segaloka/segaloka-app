"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { Icon } from "@/components/layout/Icon";

type Ad = {
  id: string;
  travel: string;
  category: string;
  title: string;
  detail: string;
  price: string;
  href: string;
  icon: "building" | "route" | "globe";
};

const ADS: Ad[] = [
  {
    id: "umrah-amanah",
    travel: "Travel Amanah",
    category: "Umrah",
    title: "Umrah nyaman dengan jadwal yang sudah terencana.",
    detail: "9 hari · Jakarta · 18 Okt 2026",
    price: "Rp 28.900.000",
    href: "/paket/umrah",
    icon: "building",
  },
  {
    id: "turki",
    travel: "Jelajah Muslim",
    category: "Halal Tour",
    title: "Jelajahi Turki dalam perjalanan ramah muslim.",
    detail: "8 hari · Istanbul & Bursa · 12 Des 2026",
    price: "Rp 23.900.000",
    href: "/paket/halal_tour",
    icon: "globe",
  },
  {
    id: "umrah-plus",
    travel: "Nusantara Haramain",
    category: "Umrah Plus",
    title: "Umrah Plus Thaif untuk perjalanan yang lebih lengkap.",
    detail: "12 hari · Jakarta · 3 Nov 2026",
    price: "Rp 34.500.000",
    href: "/paket/umrah",
    icon: "building",
  },
  {
    id: "jepang",
    travel: "Langkah Dunia",
    category: "Tour Internasional",
    title: "Jelajahi Jepang untuk liburan awal tahun.",
    detail: "7 hari · Tokyo & Osaka · 16 Jan 2027",
    price: "Rp 21.900.000",
    href: "/paket/tour",
    icon: "route",
  },
];

function AdCard({ ad }: { ad: Ad }) {
  return (
    <Link
      href={ad.href}
      className="group relative flex min-h-[104px] min-w-0 overflow-hidden rounded-2xl border border-[#cfe1f5] bg-[linear-gradient(105deg,#f8fbff_0%,#eef7ff_55%,#deefff_100%)] shadow-[0_8px_24px_rgba(34,87,140,0.07)] transition hover:-translate-y-0.5 hover:shadow-[0_12px_30px_rgba(34,87,140,0.12)]"
    >
      <div className="relative z-10 flex min-w-0 flex-1 items-center gap-3 px-4 py-3">
        <span className="hidden h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-primary text-white sm:flex">
          <Icon name={ad.icon} size={18} />
        </span>

        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-2">
            <span className="rounded-full bg-[#ffd94a] px-2 py-1 text-[10px] font-extrabold uppercase tracking-[0.08em] text-[#604800]">
              Iklan
            </span>

            <span className="truncate text-xs font-bold text-[#60758f]">
              {ad.travel}
            </span>

            <span className="hidden text-[10px] font-bold uppercase tracking-[0.08em] text-primary sm:inline">
              {ad.category}
            </span>
          </div>

          <p className="mt-1 line-clamp-2 text-sm font-extrabold leading-5 text-[#10223f]">
            {ad.title}
          </p>

          <p className="mt-0.5 hidden truncate text-xs font-medium text-[#6f829a] xl:block">
            {ad.detail}
          </p>
        </div>
      </div>

      <div className="relative z-10 flex shrink-0 items-center px-3">
        <div className="hidden text-right lg:block">
          <p className="text-[10px] font-bold uppercase tracking-[0.08em] text-[#73869d]">
            Mulai dari
          </p>

          <p className="text-sm font-extrabold text-primary">
            {ad.price}
          </p>

          <span className="text-xs font-extrabold text-primary">
            Lihat promo →
          </span>
        </div>

        <span className="flex h-9 w-9 items-center justify-center rounded-full bg-white text-primary shadow-sm ring-1 ring-[#d5e4f4] lg:hidden">
          →
        </span>
      </div>

      <div className="pointer-events-none absolute -right-8 -top-14 h-40 w-40 rounded-full border-[24px] border-white/40" />
    </Link>
  );
}

export function MarketplaceAdCarousel() {
  const [index, setIndex] = useState(0);
  const [paused, setPaused] = useState(false);

  useEffect(() => {
    if (paused) return;

    const timer = window.setInterval(() => {
      setIndex((current) => (current + 2) % ADS.length);
    }, 5000);

    return () => window.clearInterval(timer);
  }, [paused]);

  const first = ADS[index];
  const second = ADS[(index + 1) % ADS.length];

  return (
    <div
      className="w-full pb-3 pt-3"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
      onFocusCapture={() => setPaused(true)}
      onBlurCapture={() => setPaused(false)}
    >
      <div className="hidden grid-cols-2 gap-3 md:grid">
        <AdCard ad={first} />
        <AdCard ad={second} />
      </div>

      <div className="md:hidden">
        <AdCard ad={first} />
      </div>
    </div>
  );
}
