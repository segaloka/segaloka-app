"use client";

import Link from "next/link";
import { useState } from "react";

type Language = "id" | "en" | "ar";

export function PackagePaxSelector({
  departureId,
  maxPax,
  basePrice,
  language,
  isPreview,
}: {
  departureId: string;
  maxPax: number;
  basePrice: number;
  language: Language;
  isPreview: boolean;
}) {
  const locale = language === "en" ? "en-US" : language === "ar" ? "ar-SA" : "id-ID";
  const copy = {
    id: { title: "Jumlah Jamaah", pax: "jamaah", seats: "kursi tersedia", total: "Estimasi total", action: "Pesan Sekarang", preview: "Booking aktif setelah paket dipublikasikan" },
    en: { title: "Number of Travelers", pax: "travelers", seats: "seats available", total: "Estimated total", action: "Book Now", preview: "Booking becomes available after the package is published" },
    ar: { title: "عدد المسافرين", pax: "مسافر", seats: "مقاعد متاحة", total: "الإجمالي التقديري", action: "احجز الآن", preview: "يتاح الحجز بعد نشر الباقة" },
  } as const;
  const t = copy[language];
  const safeMax = Math.max(0, Math.floor(maxPax));
  const [pax, setPax] = useState(safeMax > 0 ? 1 : 0);
  const money = (value: number) => new Intl.NumberFormat(locale, { style: "currency", currency: "IDR", maximumFractionDigits: 0 }).format(value);
  const number = (value: number) => new Intl.NumberFormat(locale).format(value);
  const disabled = isPreview || safeMax <= 0;

  return (
    <div className="mt-4 border-t border-[#edf1f6] pt-4">
      <div className="flex items-end justify-between gap-3">
        <div>
          <p className="text-[10px] font-extrabold uppercase tracking-[0.1em] text-[#748297]">{t.title}</p>
          <p className="mt-1 text-[10px] font-bold text-[#8a98aa]">{number(safeMax)} {t.seats}</p>
        </div>
        <div className="flex items-center rounded-xl border border-[#dfe7f0] bg-[#fbfcfe] p-1">
          <button type="button" aria-label="Kurangi jumlah jamaah" disabled={disabled || pax <= 1} onClick={() => setPax((value) => Math.max(1, value - 1))} className="flex h-9 w-9 items-center justify-center rounded-lg text-lg font-bold text-[#40546f] hover:bg-white disabled:cursor-not-allowed disabled:opacity-35">−</button>
          <div className="min-w-[70px] px-2 text-center">
            <p className="text-sm font-extrabold text-[#10223f]">{number(pax)}</p>
            <p className="text-[9px] font-bold text-[#8a98aa]">{t.pax}</p>
          </div>
          <button type="button" aria-label="Tambah jumlah jamaah" disabled={disabled || pax >= safeMax} onClick={() => setPax((value) => Math.min(safeMax, value + 1))} className="flex h-9 w-9 items-center justify-center rounded-lg text-lg font-bold text-primary hover:bg-white disabled:cursor-not-allowed disabled:opacity-35">+</button>
        </div>
      </div>

      <div className="mt-3 flex items-center justify-between rounded-xl bg-[#f7f9fc] px-3 py-3">
        <span className="text-[10px] font-bold text-[#748297]">{t.total}</span>
        <span className="font-display text-base font-extrabold text-primary">{money(basePrice * pax)}</span>
      </div>

      {isPreview ? (
        <div className="mt-3 rounded-xl bg-[#f2f4f7] px-4 py-3 text-center text-[11px] font-extrabold leading-4 text-[#8a98aa]">{t.preview}</div>
      ) : safeMax > 0 ? (
        <Link href={`/booking/baru?departure=${encodeURIComponent(departureId)}&pax=${pax}`} className="mt-3 flex w-full items-center justify-center rounded-xl bg-primary px-4 py-3 text-xs font-extrabold text-white shadow-[0_6px_16px_rgba(15,95,175,0.16)]">{t.action}</Link>
      ) : null}
    </div>
  );
}
