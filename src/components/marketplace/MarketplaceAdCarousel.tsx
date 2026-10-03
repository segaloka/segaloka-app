"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { Icon } from "@/components/layout/Icon";
import { createClient } from "@/lib/supabase/client";
import type { Database } from "@/lib/database.types";

type Ad = Database["public"]["Tables"]["marketplace_ads"]["Row"];

export type MarketplaceAdPlacement =
  | "hero"
  | "after_packages"
  | "after_domestic"
  | "after_world"
  | "lower_home";

type MarketplaceAdCarouselProps = {
  placement?: MarketplaceAdPlacement;
};

const PREVIEW_ADS: Ad[] = [
  {
    id: "preview-marketplace-ad-umrah",
    travel_name: "Travel Amanah",
    category: "Umrah",
    title: "Umrah nyaman dengan jadwal yang sudah terencana.",
    detail: "9 hari · Jakarta · Keberangkatan Oktober 2026",
    price_text: "Rp28,9 Juta",
    href: "/paket/umrah",
    icon: "building",
    tone: "blue",
    image_url: null,
    active: true,
    sort_order: 1,
    starts_at: null,
    ends_at: null,
    created_by: null,
    created_at: "2026-09-29T00:00:00.000Z",
    updated_at: "2026-09-29T00:00:00.000Z",
    placement: "hero",
  },
  {
    id: "preview-marketplace-ad-halal-tour",
    travel_name: "Jelajah Muslim",
    category: "Halal Tour",
    title: "Jelajahi Turki dalam perjalanan ramah muslim.",
    detail: "8 hari · Istanbul & Bursa · Keberangkatan Desember 2026",
    price_text: "Rp23,9 Juta",
    href: "/paket/halal_tour",
    icon: "globe",
    tone: "yellow",
    image_url: null,
    active: true,
    sort_order: 2,
    starts_at: null,
    ends_at: null,
    created_by: null,
    created_at: "2026-09-29T00:00:00.000Z",
    updated_at: "2026-09-29T00:00:00.000Z",
    placement: "hero",
  },
];

const PREVIEW_SLOT_COPY: Record<
  Exclude<MarketplaceAdPlacement, "hero">,
  Array<
    Pick<
      Ad,
      "category" | "title" | "detail" | "price_text" | "href" | "icon" | "tone"
    >
  >
> = {
  after_packages: [
    {
      category: "Pilihan Segaloka",
      title: "Temukan perjalanan yang pas untuk rencana berikutnya",
      detail: "Bandingkan paket dari Travel aktif dalam satu marketplace.",
      price_text: "Jelajahi paket",
      href: "/paket/umrah",
      icon: "route",
      tone: "blue",
    },
  ],
  after_domestic: [
    {
      category: "Wisata Indonesia",
      title: "Dari destinasi populer sampai perjalanan keluarga",
      detail: "Jelajahi pilihan perjalanan domestik dari Travel di Segaloka.",
      price_text: "Lihat destinasi",
      href: "/paket/tour",
      icon: "building",
      tone: "yellow",
    },
  ],
  after_world: [
    {
      category: "Halal Tour",
      title: "Jelajahi dunia dengan pilihan perjalanan lebih luas",
      detail: "Temukan paket internasional dan Halal Tour sesuai kebutuhan.",
      price_text: "Jelajahi dunia",
      href: "/paket/halal_tour",
      icon: "globe",
      tone: "blue",
    },
  ],
  lower_home: [
    {
      category: "SegaDeals",
      title: "Punya rencana perjalanan? Travel dapat memberikan penawaran",
      detail: "Buat kebutuhan perjalanan dan temukan penawaran yang sesuai.",
      price_text: "Coba SegaDeals",
      href: "/segadeals",
      icon: "route",
      tone: "yellow",
    },
  ],
};

function previewAdsForPlacement(
  placement: MarketplaceAdPlacement,
): Ad[] {
  if (placement === "hero") {
    return PREVIEW_ADS;
  }

  return PREVIEW_SLOT_COPY[placement].map((ad, index) => ({
    id: `preview-${placement}-${index + 1}`,
    travel_name: "Segaloka",
    category: ad.category,
    title: ad.title,
    detail: ad.detail,
    price_text: ad.price_text,
    href: ad.href,
    icon: ad.icon,
    tone: ad.tone,
    image_url: null,
    active: true,
    sort_order: index + 1,
    starts_at: null,
    ends_at: null,
    created_by: null,
    created_at: "2026-10-01T00:00:00.000Z",
    updated_at: "2026-10-01T00:00:00.000Z",
    placement,
  }));
}
function AdCard({ ad, compact = false }: { ad: Ad; compact?: boolean }) {
  const isBlue = ad.tone === "blue";
  const isPrice = /^Rp\s?/i.test(ad.price_text ?? "");

  return (
    <Link
      href={ad.href}
      className={`group relative grid min-w-0 overflow-hidden rounded-[16px] border transition duration-300 hover:-translate-y-0.5 hover:shadow-[0_14px_32px_rgba(15,45,90,0.10)] sm:rounded-[20px] ${compact ? "min-h-[92px] sm:min-h-[104px]" : "min-h-[108px] sm:min-h-[136px]"} ${
        isBlue
          ? "border-[#c6def8] bg-[linear-gradient(115deg,#f8fbff_0%,#edf6ff_55%,#e1f0ff_100%)] shadow-[0_8px_24px_rgba(24,105,205,0.09)] hover:shadow-[0_14px_34px_rgba(24,105,205,0.15)]"
          : "border-[#f0d98f] bg-[linear-gradient(115deg,#fffef9_0%,#fff9e5_55%,#fff0b9_100%)] shadow-[0_8px_24px_rgba(180,132,20,0.09)] hover:shadow-[0_14px_34px_rgba(180,132,20,0.15)]"
      } ${compact ? "sm:grid-cols-[minmax(0,1fr)_170px]" : "sm:grid-cols-[minmax(0,1fr)_184px]"} `}
    >
      <div className="relative z-10 flex min-w-0 items-center gap-3 px-3 py-2.5 sm:gap-3.5 sm:px-4 sm:py-3.5">
        <span
          className={`hidden h-11 w-11 shrink-0 items-center justify-center rounded-xl shadow-sm sm:flex ${
            isBlue
              ? "bg-primary text-white"
              : "border border-[#f0d274] bg-white/90 text-[#9b7200]"
          }`}
        >
          <Icon
            name={ad.icon as "building" | "route" | "globe"}
            size={18}
          />
        </span>

        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-1.5">
            <span className="rounded-full bg-[#ffd94a] px-2 py-1 text-[9px] font-black uppercase tracking-[0.1em] text-[#604800]">
              Iklan
            </span>

            <span className="max-w-[150px] truncate text-[11px] font-extrabold text-[#526b88]">
              {ad.travel_name}
            </span>

            <span
              className={`hidden rounded-full px-2 py-1 text-[9px] font-black uppercase tracking-[0.08em] sm:inline ${
                isBlue
                  ? "bg-white/75 text-primary"
                  : "bg-white/75 text-[#8a6800]"
              }`}
            >
              {ad.category}
            </span>
          </div>

          <p className="mt-1.5 line-clamp-2 max-w-[430px] text-[12px] sm:text-sm font-black leading-[1.35] text-[#10223f]">
            {ad.title}
          </p>

          <p className="mt-1 hidden truncate text-[11px] font-medium text-[#6f829a] lg:block">
            {ad.detail}
          </p>
        </div>
      </div>

      <div
        className={`relative flex min-h-[62px] items-center justify-between overflow-hidden border-t px-3 py-2.5 sm:min-h-full sm:px-4 sm:py-3 sm:justify-end sm:border-l sm:border-t-0 ${
          isBlue
            ? "border-[#c7ddf5] bg-[#dceeff]"
            : "border-[#eed58a] bg-[#ffefb5]"
        }`}
      >
        {ad.image_url ? (
          <>
            <div
              className="absolute inset-0 bg-cover bg-center transition duration-500 group-hover:scale-105"
              style={{ backgroundImage: `url(${ad.image_url})` }}
              aria-hidden="true"
            />
            <div
              className={`absolute inset-0 ${
                isBlue
                  ? "bg-[linear-gradient(90deg,rgba(220,238,255,0.92)_0%,rgba(220,238,255,0.60)_48%,rgba(9,40,78,0.18)_100%)]"
                  : "bg-[linear-gradient(90deg,rgba(255,239,181,0.94)_0%,rgba(255,239,181,0.62)_48%,rgba(91,65,0,0.16)_100%)]"
              }`}
              aria-hidden="true"
            />
          </>
        ) : (
          <>
            <div
              className={`absolute -right-8 -top-10 h-32 w-32 rounded-full border-[22px] ${
                isBlue ? "border-white/35" : "border-white/40"
              }`}
              aria-hidden="true"
            />
            <div
              className={`absolute right-10 top-5 h-14 w-14 rounded-full ${
                isBlue ? "bg-white/25" : "bg-white/30"
              }`}
              aria-hidden="true"
            />
          </>
        )}

        <div className="relative z-10 text-left sm:text-right">
          <p className="text-[9px] font-black uppercase tracking-[0.1em] text-[#61758d]">
            {isPrice ? "Mulai dari" : "Aksi"}
          </p>

          <p className="mt-0.5 text-base font-black tracking-[-0.02em] text-primary">
            {ad.price_text}
          </p>

          <span className="mt-1 inline-flex items-center gap-1 text-[11px] font-black text-primary">
            {isPrice ? "Lihat penawaran" : "Buka"}
            <span
              className="transition-transform duration-200 group-hover:translate-x-0.5"
              aria-hidden="true"
            >
              →
            </span>
          </span>
        </div>
      </div>
    </Link>
  );
}
export function MarketplaceAdCarousel({
  placement = "hero",
}: MarketplaceAdCarouselProps) {
  const supabase = useMemo(() => createClient(), []);

  const [ads, setAds] = useState<Ad[]>([]);
  const [loaded, setLoaded] = useState(false);
  const [index, setIndex] = useState(0);
  const [paused, setPaused] = useState(false);

  useEffect(() => {
    let mounted = true;

    const load = async () => {
      const { data, error } = await supabase
        .from("marketplace_ads")
        .select("*")
        .eq("active", true)
        .eq("placement", placement)
        .order("sort_order", { ascending: true })
        .order("created_at", { ascending: false });

      if (!mounted) {
        return;
      }

      if (error) {
        console.error("Failed to load marketplace ads:", error);
        setAds([]);
        setLoaded(true);
        setIndex(0);
        return;
      }

      setAds(data ?? []);
      setLoaded(true);
      setIndex(0);
    };

    void load();

    const channel = supabase
      .channel(`marketplace-ads-home-${placement}`)
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "marketplace_ads",
        },
        () => {
          void load();
        },
      )
      .subscribe();

    return () => {
      mounted = false;
      void supabase.removeChannel(channel);
    };
  }, [placement, supabase]);

  const displayAds = ads.length > 0 ? ads : previewAdsForPlacement(placement);

  useEffect(() => {
    if (!loaded || paused || displayAds.length <= 2) {
      return;
    }

    const timer = window.setInterval(() => {
      setIndex((current) => (current + 2) % displayAds.length);
    }, 5000);

    return () => {
      window.clearInterval(timer);
    };
  }, [displayAds.length, loaded, paused]);

  if (!loaded) {
    return (
      <div
        className="h-[118px] w-full py-3 sm:h-[144px] sm:py-4"
        aria-hidden="true"
      />
    );
  }

  const first = displayAds[index % displayAds.length];
  const second =
    displayAds.length > 1
      ? displayAds[(index + 1) % displayAds.length]
      : null;

  const isHeroPlacement = placement === "hero";

  return (
    <div
      className={`w-full ${isHeroPlacement ? "pb-3 pt-2 sm:pb-6 sm:pt-4" : "pb-1 pt-1 sm:pb-2 sm:pt-2"}`}
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
      onFocusCapture={() => setPaused(true)}
      onBlurCapture={() => setPaused(false)}
    >
      {isHeroPlacement ? (
        <>
          <div className="hidden grid-cols-2 gap-3 md:grid">
            <AdCard ad={first} />
            {second ? <AdCard ad={second} /> : <div />}
          </div>

          <div className="md:hidden">
            <AdCard ad={first} />
          </div>
        </>
      ) : (
        <div className="grid grid-cols-1">
          <AdCard ad={first} compact />
        </div>
      )}
    </div>
  );
}
