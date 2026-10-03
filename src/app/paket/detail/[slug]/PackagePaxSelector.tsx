"use client";

import { useState } from "react";

type Language = "id" | "en" | "ar";

export function PackagePaxSelector({ maxPax, basePrice, language }: { departureId: string; maxPax: number; basePrice: number; language: Language; isPreview: boolean }) {
  const locale = language === "en" ? "en-US" : language === "ar" ? "ar-SA" : "id-ID";
  const t = {
    id:{title:"Atur Peserta",total:"Total Harga",action:"Lanjutkan",demoTitle:"Ringkasan Pemesanan",demoBody:"Tampilan pemesanan aktif dalam mode UI/UX DEV. Data belum dikirim ke database.",close:"Tutup"},
    en:{title:"Set Travelers",total:"Total Price",action:"Continue",demoTitle:"Booking Summary",demoBody:"Booking UI is active in DEV UI/UX mode. Data is not sent to the database.",close:"Close"},
    ar:{title:"تحديد المسافرين",total:"السعر الإجمالي",action:"متابعة",demoTitle:"ملخص الحجز",demoBody:"واجهة الحجز مفعلة في وضع تطوير UI/UX. لا يتم إرسال البيانات إلى قاعدة البيانات.",close:"إغلاق"}
  }[language];
  const safeMax=Math.max(1,Math.floor(maxPax)||12);
  const [pax,setPax]=useState(4),[children,setChildren]=useState(2),[infants,setInfants]=useState(1),[priceOpen,setPriceOpen]=useState(false),[summaryOpen,setSummaryOpen]=useState(false);
  const money=(v:number)=>new Intl.NumberFormat(locale,{style:"currency",currency:"IDR",maximumFractionDigits:0}).format(v);
  const childPrice=3000000, infantPrice=0, discount=2520000;
  const totalPrice=Math.max(0,basePrice*pax+childPrice*children+infantPrice*infants-discount);
  return <div className="mt-3">
    <button type="button" onClick={()=>setPriceOpen(v=>!v)} aria-expanded={priceOpen} className="mb-3 w-full rounded-[9px] border border-[#dfe7f0] bg-white p-2.5 text-start transition hover:border-primary/40">
      <div className="flex items-start justify-between gap-2.5"><div className="grid flex-1 grid-cols-[1fr_auto_1fr] gap-2 text-xs text-[#748297]"><div><b>Pergi</b><p>30 Des 2025</p></div><div className="pt-2 text-primary">··· ✈ ···</div><div className="text-end"><b>Pulang</b><p>09 Jan 2026</p></div></div><span className="mt-8 text-xs font-bold text-[#60738d]">{priceOpen?"⌃":"⌄"}</span></div>
      <div className="mt-2 border-t border-[#edf1f6] pt-2"><p className="text-xs text-[#9aa6b5] line-through">{money(basePrice+1700000)}</p><p className="mt-0.5 font-display text-lg font-extrabold text-primary">{money(basePrice)}<span className="text-xs font-medium text-[#40546f]">/pax</span></p></div>
      {priceOpen&&<div className="mt-2 space-y-2 border-t border-[#edf1f6] pt-2"><div><p className="text-xs text-[#8a98aa]">Sekamar Bertiga</p><p className="text-sm font-extrabold text-[#40546f]">{money(basePrice+1000000)}/pax</p></div><div><p className="text-xs text-[#8a98aa]">Sekamar Berdua</p><p className="text-sm font-extrabold text-[#40546f]">{money(basePrice+2000000)}/pax</p></div></div>}
    </button>
    <div className="rounded-[9px] border border-[#e1e8f0] bg-white">
      <div className="border-b border-[#edf1f6] px-2.5 py-2.5"><p className="mb-2 text-xs font-extrabold text-[#40546f]">{t.title}</p>
        {[["Dewasa","Umur 12 tahun +",pax,setPax,1,safeMax],["Anak","Umur 2 - 11 tahun",children,setChildren,0,20],["Bayi","Umur 0-23 bulan",infants,setInfants,0,20]].map(([label,age,value,setter,min,max]:any)=><div key={label} className="mb-2 grid grid-cols-[1fr_auto] items-center gap-2 text-xs"><div><b>{label}</b><span className="ms-2 text-[#9aa6b5]">{age}</span></div><div className="flex items-center gap-1"><button type="button" onClick={()=>setter((v:number)=>Math.max(min,v-1))} className="h-5 w-5 rounded border border-[#dfe7f0]">−</button><span className="w-5 text-center font-bold">{value}</span><button type="button" onClick={()=>setter((v:number)=>Math.min(max,v+1))} className="h-5 w-5 rounded bg-primary text-white">+</button></div></div>)}
      </div>
      <div className="space-y-2 px-2.5 py-2.5 text-xs"><p className="font-extrabold text-[#40546f]">Detail Harga</p><div className="flex justify-between"><span>{pax}x Dewasa</span><span>{money(basePrice*pax)}</span></div><div className="flex justify-between"><span>{children}x Anak</span><span>{money(childPrice*children)}</span></div><div className="flex justify-between"><span>{infants}x Bayi</span><span>{money(0)}</span></div><div className="flex justify-between text-[#e89a00]"><span>Diskon 2%</span><span>- {money(discount)}</span></div><div className="flex justify-between text-[#00a6a6]"><span>Kode Voucher ✨</span><span className="rounded bg-[#f3f5f7] px-2 py-0.5 font-mono text-[10px] text-[#40546f]">XYZMNO</span></div><div className="flex justify-between border-t border-[#edf1f6] pt-2 font-extrabold"><span>{t.total}</span><span>{money(totalPrice)}</span></div></div>
    </div>
    <button type="button" onClick={()=>setSummaryOpen(true)} className="mt-2 flex w-full items-center justify-center rounded-md bg-primary px-3 py-3 text-sm font-extrabold text-white shadow-[0_5px_14px_rgba(15,95,175,0.16)] transition hover:brightness-95">{t.action}</button>
    {summaryOpen&&<div className="fixed inset-0 z-[80] flex items-center justify-center bg-[#10223f]/35 p-4" onClick={()=>setSummaryOpen(false)}><div className="w-full max-w-sm rounded-2xl bg-white p-5 shadow-2xl" onClick={e=>e.stopPropagation()}><h3 className="text-lg font-extrabold text-[#10223f]">{t.demoTitle}</h3><p className="mt-2 text-sm leading-6 text-[#60738d]">{t.demoBody}</p><div className="mt-4 rounded-xl bg-[#f7f9fc] p-3 text-sm"><div className="flex justify-between"><span>Peserta</span><b>{pax+children+infants}</b></div><div className="mt-2 flex justify-between"><span>{t.total}</span><b className="text-primary">{money(totalPrice)}</b></div></div><button type="button" onClick={()=>setSummaryOpen(false)} className="mt-4 w-full rounded-lg bg-primary py-3 text-sm font-extrabold text-white">{t.close}</button></div></div>}
  </div>;
}
