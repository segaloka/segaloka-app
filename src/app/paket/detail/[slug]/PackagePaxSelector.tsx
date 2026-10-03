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
  const [pax, setPax] = useState(safeMax > 0 ? 4 : 0);
  const [children, setChildren] = useState(2);
  const [infants, setInfants] = useState(1);
  const [priceOpen, setPriceOpen] = useState(false);
  const money = (value: number) => new Intl.NumberFormat(locale, { style: "currency", currency: "IDR", maximumFractionDigits: 0 }).format(value);
  const number = (value: number) => new Intl.NumberFormat(locale).format(value);
  const disabled = isPreview || safeMax <= 0;
  const childPrice = 3000000;
  const infantPrice = 0;
  const discount = 2520000;
  const totalPrice = Math.max(0, basePrice * pax + childPrice * children + infantPrice * infants - discount);

  return (
    <div className="mt-3">
      <button type="button" onClick={() => setPriceOpen((value) => !value)} aria-expanded={priceOpen} className="mb-3 w-full rounded-xl border border-[#dfe7f0] bg-white p-3 text-start transition hover:border-primary/40">
        <div className="flex items-start justify-between gap-3">
          <div className="grid flex-1 grid-cols-[1fr_auto_1fr] items-start gap-2 text-[9px] text-[#748297]">
            <div><p className="font-bold">Pergi</p><p>30 Des 2025</p></div><div className="pt-2 text-primary">··· ✈ ···</div><div className="text-end"><p className="font-bold">Pulang</p><p>09 Jan 2026</p></div>
          </div>
          <span className="mt-8 text-xs font-bold text-[#60738d]">{priceOpen ? "⌃" : "⌄"}</span>
        </div>
        <div className="mt-2 border-t border-[#edf1f6] pt-2">
          <p className="text-[9px] text-[#9aa6b5] line-through">{money(basePrice + 1700000)}</p>
          <p className="mt-0.5 font-display text-[16px] font-extrabold text-primary">{money(basePrice)}<span className="text-[10px] font-medium text-[#40546f]">/pax</span></p>
        </div>
        {priceOpen && <div className="mt-2 space-y-2 border-t border-[#edf1f6] pt-2">
          <div><p className="text-[9px] text-[#8a98aa]">Sekamar Bertiga</p><p className="font-display text-[14px] font-extrabold text-[#40546f]">{money(basePrice + 1000000)}<span className="text-[9px] font-medium">/pax</span></p></div>
          <div><p className="text-[9px] text-[#8a98aa]">Sekamar Berdua</p><p className="font-display text-[14px] font-extrabold text-[#40546f]">{money(basePrice + 2000000)}<span className="text-[9px] font-medium">/pax</span></p></div>
        </div>}
      </button>
      <div className="rounded-xl border border-[#e1e8f0] bg-white">
        <div className="border-b border-[#edf1f6] px-3 py-3">
          <p className="mb-2 text-[10px] font-extrabold text-[#40546f]">{t.title}</p>
          <div className="space-y-2 text-[9px]">
            <div className="grid grid-cols-[1fr_auto] items-center gap-2"><div><b>Dewasa</b><span className="ms-2 text-[#9aa6b5]">Umur 12 tahun +</span></div><div className="flex items-center gap-1"><button type="button" onClick={()=>setPax(v=>Math.max(1,v-1))} className="h-5 w-5 rounded border border-[#dfe7f0]">−</button><span className="w-5 text-center font-bold">{pax}</span><button type="button" onClick={()=>setPax(v=>Math.min(safeMax,v+1))} className="h-5 w-5 rounded bg-primary text-white">+</button></div></div>
            <div className="grid grid-cols-[1fr_auto] items-center gap-2"><div><b>Anak</b><span className="ms-2 text-[#9aa6b5]">Umur 2 - 11 tahun</span></div><div className="flex items-center gap-1"><button type="button" onClick={()=>setChildren(v=>Math.max(0,v-1))} className="h-5 w-5 rounded border border-[#dfe7f0]">−</button><span className="w-5 text-center font-bold">{children}</span><button type="button" onClick={()=>setChildren(v=>v+1)} className="h-5 w-5 rounded border border-[#dfe7f0]">+</button></div></div>
            <div className="grid grid-cols-[1fr_auto] items-center gap-2"><div><b>Bayi</b><span className="ms-2 text-[#9aa6b5]">Umur 0-23 bulan</span></div><div className="flex items-center gap-1"><button type="button" onClick={()=>setInfants(v=>Math.max(0,v-1))} className="h-5 w-5 rounded border border-[#dfe7f0]">−</button><span className="w-5 text-center font-bold">{infants}</span><button type="button" onClick={()=>setInfants(v=>v+1)} className="h-5 w-5 rounded border border-[#dfe7f0]">+</button></div></div>
          </div>
        </div>

        <div className="space-y-2 px-3 py-3 text-[9px]">
          <p className="mb-2 text-[10px] font-extrabold text-[#40546f]">Detail Harga</p>
          <div className="flex justify-between"><span>{pax}x Dewasa</span><span>{money(basePrice * pax)}</span></div>
          <div className="flex justify-between"><span>{children}x Anak</span><span>{money(childPrice * children)}</span></div>
          <div className="flex justify-between"><span>{infants}x Bayi</span><span>{money(infantPrice * infants)}</span></div>
          <div className="flex justify-between pt-1 text-[#e89a00]"><span>Diskon 2%</span><span>- {money(discount)}</span></div>
          <div className="flex justify-between text-[#00a6a6]"><span>Kode Voucher ✨</span><span className="rounded bg-[#f3f5f7] px-2 py-0.5 font-mono text-[8px] text-[#40546f]">XYZMNO</span></div>
          <div className="mt-2 flex justify-between border-t border-[#edf1f6] pt-2 font-extrabold"><span>{t.total}</span><span>{money(totalPrice)}</span></div>
        </div>        </div>
      </div>

      {isPreview ? (
        <div className="mt-3 rounded-lg bg-[#f2f4f7] px-4 py-3 text-center text-[11px] font-extrabold leading-4 text-[#8a98aa]">{t.preview}</div>
      ) : safeMax > 0 ? (
        <Link href={`/booking/baru?departure=${encodeURIComponent(departureId)}&pax=${pax + children + infants}`} className="mt-3 flex w-full items-center justify-center rounded-lg bg-primary px-4 py-3 text-xs font-extrabold text-white shadow-[0_5px_14px_rgba(15,95,175,0.16)] transition hover:brightness-95">{t.action}</Link>
      ) : null}
    </div>
  );
}
