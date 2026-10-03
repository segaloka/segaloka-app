"use client";

import { useState } from "react";

type Language = "id" | "en" | "ar";
type Tab = "description" | "itinerary" | "facilities" | "hotel" | "policy" | "reviews";

const order: Tab[] = ["description","itinerary","facilities","hotel","policy","reviews"];

export function PackageDetailShowcase({ language }: { language: Language; description: string | null; durationDays: number; inclusions: string[]; exclusions: string[]; rating: number | null; reviewCount: number }) {
  const [tab,setTab]=useState<Tab>("description");
  const [itineraryDay,setItineraryDay]=useState(0);
  const t={
    id:{tabs:["Deskripsi","Itinerary","Fasilitas","Tiket & Hotel","Kebijakan","Ulasan"],info:"Informasi",day:"Hari 1",included:"Termasuk",excluded:"Tidak Termasuk",hotel:"Hotel",flight:"Tiket",policy:"Ketentuan",review:"4.7/5",reviewMeta:"Dari 10 ulasan"},
    en:{tabs:["Description","Itinerary","Facilities","Ticket & Hotel","Policy","Reviews"],info:"Information",day:"Day 1",included:"Included",excluded:"Not Included",hotel:"Hotel",flight:"Ticket",policy:"Terms",review:"4.7/5",reviewMeta:"From 10 reviews"},
    ar:{tabs:["الوصف","البرنامج","المرافق","التذاكر والفندق","السياسة","التقييمات"],info:"المعلومات",day:"اليوم 1",included:"مشمول",excluded:"غير مشمول",hotel:"الفندق",flight:"التذكرة",policy:"الشروط",review:"4.7/5",reviewMeta:"من 10 تقييمات"}
  }[language];
  const body:Record<Tab,JSX.Element>={
    description:<><b>{t.info}</b><p>Informasi lengkap mengenai paket perjalanan, layanan, jadwal, fasilitas, serta ketentuan perjalanan akan ditampilkan pada bagian ini. Konten dibuat ringkas agar mudah dibaca sebelum melakukan pemesanan.</p></>,
    itinerary:<><b>{language === "ar" ? `اليوم ${itineraryDay + 1}` : language === "en" ? `Day ${itineraryDay + 1}` : `Hari ${itineraryDay + 1}`}</b><p>{["Keberangkatan dan proses perjalanan awal. Informasi waktu berkumpul, transportasi, serta agenda hari pertama ditampilkan pada bagian ini.","Agenda perjalanan hari kedua mencakup kegiatan utama, waktu kunjungan, konsumsi, transportasi, dan waktu istirahat.","Rangkaian kegiatan lanjutan, perpindahan lokasi, aktivitas jamaah, dan informasi akomodasi ditampilkan secara ringkas.","Agenda akhir perjalanan, persiapan kepulangan, waktu check-out, transportasi menuju bandara, dan informasi penerbangan pulang."][itineraryDay]}</p></>,
    facilities:<><b>{t.included}</b><div className="grid grid-cols-2 gap-x-8 gap-y-1"><span>◎ Akomodasi</span><span>◎ Transportasi</span><span>◎ Konsumsi</span><span>◎ Pendamping perjalanan</span><span>◎ Bagasi sesuai ketentuan</span><span>◎ Perlengkapan paket</span></div></>,
    hotel:<><b>{t.hotel}</b><div><p>Hotel: Hilton Makkah Convention Hotel</p><p className="mt-2">Maskapai: Saudia Airlines · Bagasi sesuai ketentuan tiket.</p></div></>,
    policy:<><b>{t.policy}</b><div><p>1. Pemesanan mengikuti ketersediaan jadwal dan kuota.</p><p>2. Perubahan jadwal mengikuti ketentuan Travel dan penyedia layanan.</p><p>3. Pembatalan dan refund mengikuti kebijakan paket yang berlaku.</p></div></>,
    reviews:<><div><b>{t.review}</b><p className="mt-1">{t.reviewMeta}</p></div><div><p>Pelayanan Travel ramah dan responsif. Informasi perjalanan mudah dipahami dan proses pemesanan dapat dipantau dengan jelas.</p><p className="mt-4 text-[12px] font-semibold">Ahmad Fauzi · Jamaah Umrah Januari 2025</p></div></>
  };
  return <div className="overflow-hidden rounded-[20px] bg-[#f4f4f4] p-3 font-sans">
    <div className="grid h-[310px] grid-cols-[1.25fr_.9fr] gap-3 sm:h-[360px]">
      <div className="rounded-[14px] border border-[#e9e9e9] bg-white" />
      <div className="grid grid-rows-[1.35fr_.75fr] gap-3"><div className="rounded-[14px] border border-[#e9e9e9] bg-white" /><div className="grid grid-cols-2 gap-3"><div className="rounded-[14px] border border-[#e9e9e9] bg-white" /><div className="rounded-[14px] border border-[#e9e9e9] bg-white" /></div></div>
    </div>
    <div className="mt-3 rounded-[16px] bg-white px-5 pb-5 pt-1 sm:px-7">
      <div className="overflow-x-auto border-b border-[#d9d9d9]"><div className="flex min-w-max justify-between gap-7">{order.map((key,i)=><button key={key} type="button" onClick={()=>setTab(key)} className={`border-b-2 px-0 py-4 text-[14px] font-medium leading-none transition sm:text-[15px] ${tab===key?"border-primary font-bold text-primary":"border-transparent text-[#454545] hover:text-primary"}`}>{t.tabs[i]}</button>)}</div></div>
      <div className={`h-[174px] pe-3 pt-5 text-[14px] leading-[1.65] text-[#454545] sm:text-[15px] ${tab === "description" ? "overflow-y-auto" : "overflow-hidden"}`}>
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-[105px_1fr] sm:gap-5">{body[tab]}</div>
      </div>
      {tab === "itinerary" && <div className="mt-2 flex items-center gap-3">
        <button type="button" onClick={()=>setItineraryDay((v)=>(v+3)%4)} aria-label="Hari itinerary sebelumnya" className="flex h-7 w-7 items-center justify-center rounded-full border border-[#9b9b9b] text-[18px] leading-none text-[#777] transition hover:border-primary hover:text-primary">←</button>
        <button type="button" onClick={()=>setItineraryDay((v)=>(v+1)%4)} aria-label="Hari itinerary berikutnya" className="flex h-7 w-7 items-center justify-center rounded-full border border-primary text-[18px] leading-none text-primary transition hover:bg-primary hover:text-white">→</button>
        <span className="text-[11px] font-semibold text-[#8a8a8a]">{itineraryDay + 1} / 4</span>
      </div>}
    </div>
  </div>;
}
