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
    id: { title: "Atur Peserta", pax: "jamaah", seats: "kursi tersedia", unit: "Harga / jamaah", subtotal: "Subtotal", total: "Total Harga", action: "Lanjutkan", preview: "Booking aktif setelah paket dipublikasikan" },
    en: { title: "Set Travelers", pax: "travelers", seats: "seats available", unit: "Price / traveler", subtotal: "Subtotal", total: "Total Price", action: "Continue", preview: "Booking becomes available after the package is published" },
    ar: { title: "تحديد المسافرين", pax: "مسافر", seats: "مقاعد متاحة", unit: "السعر / مسافر", subtotal: "المجموع الفرعي", total: "السعر الإجمالي", action: "متابعة", preview: "يتاح الحجز بعد نشر الباقة" },
  } as const;
  const t = copy[language];
  const safeMax = Math.max(0, Math.floor(maxPax));
  const [pax, setPax] = useState(safeMax > 0 ? 1 : 0);
  const money = (value: number) => new Intl.NumberFormat(locale, { style: "currency", currency: "IDR", maximumFractionDigits: 0 }).format(value);
  const number = (value: number) => new Intl.NumberFormat(locale).format(value);
  const disabled = isPreview || safeMax <= 0;

  return (
    <div className="mt-4 border-t border-[#edf1f6] pt-4">
      <div className="rounded-xl border border-[#e1e8f0] bg-white">
        <div className="flex items-center justify-between gap-3 border-b border-[#edf1f6] px-3 py-3">
          <div>
            <p className="text-[10px] font-extrabold text-[#40546f]">{t.title}</p>
            <p className="mt-0.5 text-[9px] font-bold text-[#8a98aa]">{number(safeMax)} {t.seats}</p>
          </div>
          <div className="flex items-center gap-1">
            <button type="button" aria-label="Kurangi jumlah jamaah" disabled={disabled || pax <= 1} onClick={() => setPax((value) => Math.max(1, value - 1))} className="flex h-7 w-7 items-center justify-center rounded-md border border-[#dfe7f0] bg-white text-sm font-bold text-[#60738d] disabled:cursor-not-allowed disabled:opacity-35">−</button>
            <div className="min-w-[34px] text-center text-xs font-extrabold text-[#10223f]">{number(pax)}</div>
            <button type="button" aria-label="Tambah jumlah jamaah" disabled={disabled || pax >= safeMax} onClick={() => setPax((value) => Math.min(safeMax, value + 1))} className="flex h-7 w-7 items-center justify-center rounded-md bg-primary text-sm font-bold text-white disabled:cursor-not-allowed disabled:opacity-35">+</button>
          </div>
        </div>

        <div className="space-y-2.5 px-3 py-3 text-[10px]">
          <div className="flex items-center justify-between gap-3"><span className="font-bold text-[#748297]">{t.unit}</span><span className="font-extrabold text-[#40546f]">{money(basePrice)}</span></div>
          <div className="flex items-center justify-between gap-3"><span className="font-bold text-[#748297]">{number(pax)} × {t.pax}</span><span className="font-extrabold text-[#40546f]">{money(basePrice * pax)}</span></div>
          <div className="flex items-center justify-between gap-3 border-t border-dashed border-[#dfe7f0] pt-2.5"><span className="font-extrabold text-[#40546f]">{t.subtotal}</span><span className="font-extrabold text-[#10223f]">{money(basePrice * pax)}</span></div>
          <div className="flex items-center justify-between gap-3 border-t border-[#edf1f6] pt-2.5"><span className="font-extrabold text-[#10223f]">{t.total}</span><span className="font-display text-sm font-extrabold text-primary">{money(basePrice * pax)}</span></div>
        </div>
      </div>

      {isPreview ? (
        <div className="mt-3 rounded-lg bg-[#f2f4f7] px-4 py-3 text-center text-[11px] font-extrabold leading-4 text-[#8a98aa]">{t.preview}</div>
      ) : safeMax > 0 ? (
        <Link href={`/booking/baru?departure=${encodeURIComponent(departureId)}&pax=${pax}`} className="mt-3 flex w-full items-center justify-center rounded-lg bg-primary px-4 py-3 text-xs font-extrabold text-white shadow-[0_5px_14px_rgba(15,95,175,0.16)] transition hover:brightness-95">{t.action}</Link>
      ) : null}
    </div>
  );
}
