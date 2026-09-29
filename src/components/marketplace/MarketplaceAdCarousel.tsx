"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { Icon } from "@/components/layout/Icon";
import { createClient } from "@/lib/supabase/client";
import type { Database } from "@/lib/database.types";

type Ad = Database["public"]["Tables"]["marketplace_ads"]["Row"];

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
  },
];

function AdCard({ ad }: { ad: Ad }) {
  const isBlue = ad.tone === "blue";

  return (
    <Link
      href={ad.href}
      className={`group relative flex min-h-[112px] min-w-0 overflow-hidden rounded-2xl border transition hover:-translate-y-0.5 ${
        isBlue
          ? "border-[#b8d8ff] bg-[linear-gradient(105deg,#f7fbff_0%,#eaf4ff_52%,#d8ebff_100%)] shadow-[0_8px_24px_rgba(24,105,205,0.10)] hover:shadow-[0_12px_30px_rgba(24,105,205,0.16)]"
          : "border-[#f1d78a] bg-[linear-gradient(105deg,#fffdf5_0%,#fff7d9_52%,#ffedaa_100%)] shadow-[0_8px_24px_rgba(180,132,20,0.10)] hover:shadow-[0_12px_30px_rgba(180,132,20,0.16)]"
      }`}
    >
      {ad.image_url && (
        <div
          className="absolute inset-y-0 right-0 w-1/3 bg-cover bg-center opacity-15"
          style={{ backgroundImage: `url(${ad.image_url})` }}
          aria-hidden="true"
        />
      )}

      <div className="relative z-10 flex min-w-0 flex-1 items-center gap-3 px-4 py-3">
        <span className="hidden h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-primary text-white sm:flex">
          <Icon
            name={ad.icon as "building" | "route" | "globe"}
            size={18}
          />
        </span>

        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-2">
            <span className="rounded-full bg-[#ffd94a] px-2 py-1 text-[10px] font-extrabold uppercase tracking-[0.08em] text-[#604800]">
              Iklan
            </span>

            <span className="truncate text-xs font-bold text-[#60758f]">
              {ad.travel_name}
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
            {ad.price_text}
          </p>

          <span className="text-xs font-extrabold text-primary">
            Lihat penawaran →
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
      .channel("marketplace-ads-home")
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
  }, [supabase]);

  const displayAds = ads.length > 0 ? ads : PREVIEW_ADS;

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
        className="h-[144px] w-full py-4"
        aria-hidden="true"
      />
    );
  }

  const first = displayAds[index % displayAds.length];
  const second =
    displayAds.length > 1
      ? displayAds[(index + 1) % displayAds.length]
      : null;

  return (
    <div
      className="w-full py-4"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
      onFocusCapture={() => setPaused(true)}
      onBlurCapture={() => setPaused(false)}
    >
      <div className="hidden grid-cols-2 gap-3 md:grid">
        <AdCard ad={first} />
        {second ? <AdCard ad={second} /> : <div />}
      </div>

      <div className="md:hidden">
        <AdCard ad={first} />
      </div>
    </div>
  );
}