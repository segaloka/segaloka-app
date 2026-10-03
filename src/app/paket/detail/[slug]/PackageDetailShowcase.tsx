"use client";

import { useState } from "react";

type Language = "id" | "en" | "ar";
type Tab = "description" | "itinerary" | "facilities" | "hotel" | "policy" | "reviews";

const order: Tab[] = ["description","itinerary","facilities","hotel","policy","reviews"];

export function PackageDetailShowcase({ language }: { language: Language; description: string | null; durationDays: number; inclusions: string[]; exclusions: string[]; rating: number | null; reviewCount: number }) {
  const [tab,setTab]=useState<Tab>("description");
  const [itineraryDay,setItineraryDay]=useState(0);
  const [hotelSlide,setHotelSlide]=useState(0);
  const t={
    id:{tabs:["Deskripsi","Itinerary","Fasilitas","Tiket & Hotel","Kebijakan","Ulasan"],info:"Informasi",day:"Hari 1",included:"Termasuk",excluded:"Tidak Termasuk",hotel:"Hotel",flight:"Tiket",policy:"Ketentuan",review:"4.7/5",reviewMeta:"Dari 10 ulasan"},
    en:{tabs:["Description","Itinerary","Facilities","Ticket & Hotel","Policy","Reviews"],info:"Information",day:"Day 1",included:"Included",excluded:"Not Included",hotel:"Hotel",flight:"Ticket",policy:"Terms",review:"4.7/5",reviewMeta:"From 10 reviews"},
    ar:{tabs:["الوصف","البرنامج","المرافق","التذاكر والفندق","السياسة","التقييمات"],info:"المعلومات",day:"اليوم 1",included:"مشمول",excluded:"غير مشمول",hotel:"الفندق",flight:"التذكرة",policy:"الشروط",review:"4.7/5",reviewMeta:"من 10 تقييمات"}
  }[language];
  const body:Record<Tab,JSX.Element>={
    description:<><b>{t.info}</b><p>Informasi lengkap mengenai paket perjalanan, layanan, jadwal, fasilitas, serta ketentuan perjalanan akan ditampilkan pada bagian ini. Konten dibuat ringkas agar mudah dibaca sebelum melakukan pemesanan.</p></>,
    itinerary:<><b>{language === "ar" ? `اليوم ${itineraryDay + 1}` : language === "en" ? `Day ${itineraryDay + 1}` : `Hari ${itineraryDay + 1}`}</b><p>{["Keberangkatan dan proses perjalanan awal. Informasi waktu berkumpul, transportasi, serta agenda hari pertama ditampilkan pada bagian ini.","Agenda perjalanan hari kedua mencakup kegiatan utama, waktu kunjungan, konsumsi, transportasi, dan waktu istirahat.","Rangkaian kegiatan lanjutan, perpindahan lokasi, aktivitas jamaah, dan informasi akomodasi ditampilkan secara ringkas.","Agenda akhir perjalanan, persiapan kepulangan, waktu check-out, transportasi menuju bandara, dan informasi penerbangan pulang."][itineraryDay]}</p></>,
    facilities:<><b>{t.included}</b><div className="grid grid-cols-2 gap-x-8 gap-y-1"><span>◎ Akomodasi</span><span>◎ Transportasi</span><span>◎ Konsumsi</span><span>◎ Pendamping perjalanan</span><span>◎ Bagasi sesuai ketentuan</span><span>◎ Perlengkapan paket</span></div></>,
    hotel:<><b>{hotelSlide === 0 ? t.hotel : t.flight}</b><div>{hotelSlide === 0 ? <><p>Hotel: Hilton Makkah Convention Hotel</p><p className="mt-2">Lokasi, tipe kamar, fasilitas hotel, waktu check-in/check-out, dan informasi akomodasi ditampilkan di sini.</p><p className="mt-2">Informasi hotel berikutnya dapat dilihat menggunakan tombol slide.</p></> : <><p>Maskapai: Saudia Airlines</p><p className="mt-2">Rute, nomor penerbangan, jadwal, kelas penerbangan, dan ketentuan bagasi ditampilkan di sini.</p><p className="mt-2">Informasi tiket berikutnya dapat dilihat menggunakan tombol slide.</p></>}</div></>,
    policy:<><b>{t.policy}</b><div><p>1. Pemesanan mengikuti ketersediaan jadwal dan kuota.</p><p>2. Perubahan jadwal mengikuti ketentuan Travel dan penyedia layanan.</p><p>3. Pembatalan dan refund mengikuti kebijakan paket yang berlaku.</p></div></>,
    reviews:<><div><b>{t.review}</b><p className="mt-1">{t.reviewMeta}</p></div><div><p>Pelayanan Travel ramah dan responsif. Informasi perjalanan mudah dipahami dan proses pemesanan dapat dipantau dengan jelas.</p><p className="mt-4 text-[12px] font-semibold">Ahmad Fauzi · Jamaah Umrah Januari 2025</p></div></>
  };
  return <div className="overflow-hidden rounded-[16px] bg-[#f4f4f4] p-2.5 font-sans">
    <div className="grid h-[275px] grid-cols-[1.25fr_.9fr] gap-2.5 sm:h-[315px]">
      <div className="rounded-[9px] border border-[#e9e9e9] bg-white" />
      <div className="grid grid-rows-[1.35fr_.75fr] gap-2"><div className="rounded-[9px] border border-[#e9e9e9] bg-white" /><div className="grid grid-cols-2 gap-2"><div className="rounded-[9px] border border-[#e9e9e9] bg-white" /><div className="rounded-[9px] border border-[#e9e9e9] bg-white" /></div></div>
    </div>
    <div className="mt-2.5 rounded-[12px] bg-white px-4 pb-4 pt-0 sm:px-5">
      <div className="overflow-x-auto border-b border-[#d9d9d9]"><div className="flex min-w-max justify-between gap-4">{order.map((key,i)=><button key={key} type="button" onClick={()=>setTab(key)} className={`border-b-2 px-0 py-3 text-xs font-medium leading-none transition sm:text-sm ${tab===key?"border-primary font-bold text-primary":"border-transparent text-[#454545] hover:text-primary"}`}>{t.tabs[i]}</button>)}</div></div>
      <div className={`h-[145px] pe-3 pt-4 text-xs leading-5 text-[#454545] sm:text-sm sm:leading-6 ${tab === "description" || tab === "policy" || tab === "hotel" ? "overflow-y-auto" : "overflow-hidden"}`}>
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-[78px_1fr] sm:gap-4">{body[tab]}</div>
      </div>
      {tab === "itinerary" && <div className="mt-2 flex items-center gap-3">
        <button type="button" onClick={()=>setItineraryDay((v)=>(v+3)%4)} aria-label="Hari itinerary sebelumnya" className="flex h-5 w-5 items-center justify-center rounded-full border border-[#9b9b9b] text-[13px] leading-none text-[#777] transition hover:border-primary hover:text-primary">←</button>
        <button type="button" onClick={()=>setItineraryDay((v)=>(v+1)%4)} aria-label="Hari itinerary berikutnya" className="flex h-5 w-5 items-center justify-center rounded-full border border-primary text-[13px] leading-none text-primary transition hover:bg-primary hover:text-white">→</button>
        <span className="text-xs font-semibold text-[#8a8a8a]">{itineraryDay + 1} / 4</span>
      </div>}
      {tab === "hotel" && <div className="mt-2 flex items-center gap-3">
        <button type="button" onClick={()=>setHotelSlide((v)=>(v+1)%2)} aria-label="Tiket dan hotel sebelumnya" className="flex h-5 w-5 items-center justify-center rounded-full border border-[#9b9b9b] text-[13px] leading-none text-[#777] transition hover:border-primary hover:text-primary">←</button>
        <button type="button" onClick={()=>setHotelSlide((v)=>(v+1)%2)} aria-label="Tiket dan hotel berikutnya" className="flex h-5 w-5 items-center justify-center rounded-full border border-primary text-[13px] leading-none text-primary transition hover:bg-primary hover:text-white">→</button>
        <span className="text-xs font-semibold text-[#8a8a8a]">{hotelSlide + 1} / 2</span>
      </div>}
    </div>
  </div>;
}
