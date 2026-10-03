"use client";

import { useState } from "react";

type Language = "id" | "en" | "ar";
type Tab = "description" | "itinerary" | "facilities" | "hotel" | "policy" | "reviews";

export function PackageDetailShowcase({ language, description, durationDays, inclusions, exclusions, rating, reviewCount }: {
  language: Language; description: string | null; durationDays: number; inclusions: string[]; exclusions: string[]; rating: number | null; reviewCount: number;
}) {
  const [tab, setTab] = useState<Tab>("description");
  const copy = {
    id:{description:"Deskripsi",itinerary:"Itinerary",facilities:"Fasilitas",hotel:"Tiket & Hotel",policy:"Kebijakan",reviews:"Ulasan",day:"Hari",hotelName:"Hotel",flight:"Penerbangan",waiting:"Detail akan dilengkapi oleh Travel.",included:"Termasuk",excluded:"Tidak termasuk",policyTitle:"Ketentuan perjalanan",policyBody:"Ketentuan perubahan jadwal, pembatalan, refund, dan dokumen mengikuti rincian yang ditetapkan Travel sebelum pembayaran.",noReview:"Belum ada ulasan"},
    en:{description:"Description",itinerary:"Itinerary",facilities:"Facilities",hotel:"Ticket & Hotel",policy:"Policy",reviews:"Reviews",day:"Day",hotelName:"Hotel",flight:"Flight",waiting:"Details will be completed by the Travel.",included:"Included",excluded:"Not included",policyTitle:"Travel policy",policyBody:"Reschedule, cancellation, refund, and document terms follow the details set by the Travel before payment.",noReview:"No reviews yet"},
    ar:{description:"الوصف",itinerary:"البرنامج",facilities:"المرافق",hotel:"التذاكر والفندق",policy:"السياسة",reviews:"التقييمات",day:"اليوم",hotelName:"الفندق",flight:"الطيران",waiting:"سيتم استكمال التفاصيل من شركة السفر.",included:"مشمول",excluded:"غير مشمول",policyTitle:"سياسة الرحلة",policyBody:"تخضع شروط تغيير الموعد والإلغاء والاسترداد والمستندات للتفاصيل التي تحددها شركة السفر قبل الدفع.",noReview:"لا توجد تقييمات بعد"}
  } as const;
  const t=copy[language];
  const tabs:[Tab,string][]=[["description",t.description],["itinerary",t.itinerary],["facilities",t.facilities],["hotel",t.hotel],["policy",t.policy],["reviews",t.reviews]];
  return <div className="overflow-hidden rounded-2xl bg-[#f4f4f4] p-2">
    <div className="grid h-[310px] grid-cols-[1.25fr_.9fr] gap-2 sm:h-[360px]">
      <div className="rounded-xl border border-[#e7e7e7] bg-white" />
      <div className="grid grid-rows-[1.35fr_.75fr] gap-2">
        <div className="rounded-xl border border-[#e7e7e7] bg-white" />
        <div className="grid grid-cols-2 gap-2"><div className="rounded-xl border border-[#e7e7e7] bg-white" /><div className="rounded-xl border border-[#e7e7e7] bg-white" /></div>
      </div>
    </div>
    <div className="mt-2 rounded-xl bg-white px-3 pb-3">
      <div className="overflow-x-auto border-b border-[#e7e7e7]"><div className="flex min-w-max">{tabs.map(([key,label])=><button key={key} type="button" onClick={()=>setTab(key)} className={`border-b-2 px-4 py-3 text-[10px] font-bold transition ${tab===key?"border-primary text-primary":"border-transparent text-[#555] hover:text-primary"}`}>{label}</button>)}</div></div>
      <div className="min-h-[116px] px-1 py-3 text-[11px] leading-5 text-[#4d4d4d]">
        {tab==="description" && <p className="whitespace-pre-line">{description || t.waiting}</p>}
        {tab==="itinerary" && <div className="grid grid-cols-[70px_1fr] gap-3"><b>{t.day} 1</b><p>{t.waiting} {durationDays > 1 ? `${durationDays} ${t.day.toLowerCase()}.` : ""}</p></div>}
        {tab==="facilities" && <div className="grid gap-4 sm:grid-cols-2"><div><b>{t.included}</b><ul className="mt-1 space-y-0.5">{(inclusions.length?inclusions:[t.waiting]).slice(0,5).map((x,i)=><li key={i}>⊙ {x}</li>)}</ul></div><div><b>{t.excluded}</b><ul className="mt-1 space-y-0.5">{(exclusions.length?exclusions:[t.waiting]).slice(0,5).map((x,i)=><li key={i}>⊙ {x}</li>)}</ul></div></div>}
        {tab==="hotel" && <div className="grid gap-4 sm:grid-cols-2"><div><b>{t.hotelName}</b><p className="mt-1">{t.waiting}</p></div><div><b>{t.flight}</b><p className="mt-1">{t.waiting}</p></div></div>}
        {tab==="policy" && <div><b>{t.policyTitle}</b><p className="mt-1 max-w-2xl">{t.policyBody}</p></div>}
        {tab==="reviews" && <div className="grid gap-3 sm:grid-cols-[90px_1fr]"><div><b>{rating!==null?`${rating.toFixed(1)}/5`:"—"}</b><p>{reviewCount ? `${reviewCount} ${t.reviews}` : t.noReview}</p></div><p>{reviewCount?t.waiting:t.noReview}</p></div>}
      </div>
    </div>
  </div>;
}
