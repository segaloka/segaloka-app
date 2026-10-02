"use client";

import { useState } from "react";
import { useFormState, useFormStatus } from "react-dom";
import { createBookingAction } from "./actions";
import { Input, Textarea } from "@/components/ui/Field";

function SubmitButton({ processing, submit }: { processing: string; submit: string }) {
  const { pending } = useFormStatus();
  return (
    <button type="submit" disabled={pending} className="h-11 w-full rounded-md bg-primary font-semibold text-primary-fg hover:bg-primary-hover disabled:opacity-60">
      {pending ? processing : submit}
    </button>
  );
}

export function BookingForm({ departureId, basePrice, maxPax, language, currency }: { departureId: string; basePrice: number; maxPax: number; language: "id" | "en" | "ar"; currency: string }) {
  const locale = language === "en" ? "en-US" : language === "ar" ? "ar-SA" : "id-ID";
  const copy = {
    id:{ pax:"Jumlah Jamaah", max:(n:string)=>`Maksimal ${n} kursi tersedia pada jadwal ini.`, travelers:"Data Jamaah", name:(n:string)=>`Nama lengkap jamaah ${n} (sesuai paspor)`, notes:"Catatan (opsional)", notesPlaceholder:"Permintaan khusus, kondisi kesehatan, dsb.", total:"Total Tagihan", processing:"Memproses…", submit:"Buat Booking", baseCurrency:"Harga dasar · IDR", currencyPending:(code:string)=>`Pilihan ${code} belum dikonversi.`, errors:{INVALID_DEPARTURE:"Jadwal keberangkatan tidak valid.",AUTH_REQUIRED:"Silakan masuk kembali sebelum membuat booking.",INVALID_PAX_COUNT:"Jumlah jamaah tidak valid.",PASSENGER_NAME_REQUIRED:"Data seluruh jamaah wajib diisi dengan lengkap.",DEPARTURE_NOT_AVAILABLE:"Jadwal keberangkatan sudah tidak tersedia.",PACKAGE_NOT_AVAILABLE:"Paket ini belum tersedia untuk dipesan.",INSUFFICIENT_QUOTA:"Kuota tidak mencukupi untuk jumlah jamaah ini.",BOOKING_FAILED:"Booking belum berhasil dibuat. Silakan coba kembali."} },
    en:{ pax:"Number of Travelers", max:(n:string)=>`Up to ${n} seats are available for this departure.`, travelers:"Traveler Details", name:(n:string)=>`Full name of traveler ${n} (as in passport)`, notes:"Notes (optional)", notesPlaceholder:"Special requests, health conditions, etc.", total:"Total Amount", processing:"Processing…", submit:"Create Booking", baseCurrency:"Base price · IDR", currencyPending:(code:string)=>`${code} conversion is not available yet.`, errors:{INVALID_DEPARTURE:"The departure schedule is invalid.",AUTH_REQUIRED:"Please sign in again before creating a booking.",INVALID_PAX_COUNT:"The number of travelers is invalid.",PASSENGER_NAME_REQUIRED:"Complete details are required for every traveler.",DEPARTURE_NOT_AVAILABLE:"This departure is no longer available.",PACKAGE_NOT_AVAILABLE:"This package is not available for booking.",INSUFFICIENT_QUOTA:"There are not enough seats for this number of travelers.",BOOKING_FAILED:"The booking could not be created. Please try again."} },
    ar:{ pax:"عدد المسافرين", max:(n:string)=>`يتوفر حتى ${n} مقعداً لهذا الموعد.`, travelers:"بيانات المسافرين", name:(n:string)=>`الاسم الكامل للمسافر ${n} (كما في جواز السفر)`, notes:"ملاحظات (اختياري)", notesPlaceholder:"طلبات خاصة أو حالات صحية أو غير ذلك.", total:"إجمالي المبلغ", processing:"جارٍ المعالجة…", submit:"إنشاء الحجز", baseCurrency:"السعر الأساسي · IDR", currencyPending:(code:string)=>`تحويل ${code} غير متاح بعد.`, errors:{INVALID_DEPARTURE:"موعد المغادرة غير صالح.",AUTH_REQUIRED:"يرجى تسجيل الدخول مرة أخرى قبل إنشاء الحجز.",INVALID_PAX_COUNT:"عدد المسافرين غير صالح.",PASSENGER_NAME_REQUIRED:"يجب استكمال بيانات جميع المسافرين.",DEPARTURE_NOT_AVAILABLE:"موعد المغادرة لم يعد متاحاً.",PACKAGE_NOT_AVAILABLE:"هذه الباقة غير متاحة للحجز.",INSUFFICIENT_QUOTA:"لا توجد مقاعد كافية لهذا العدد من المسافرين.",BOOKING_FAILED:"تعذر إنشاء الحجز. يرجى المحاولة مرة أخرى."} }
  } as const;
  const t = copy[language];
  const displayNumber = (value:number) => new Intl.NumberFormat(locale).format(value);
  const displayPrice = (value:number) => new Intl.NumberFormat(locale, { style:"currency", currency:"IDR", maximumFractionDigits:0 }).format(value);
  const errorMessage = (code: string) => t.errors[code as keyof typeof t.errors] ?? t.errors.BOOKING_FAILED;
  const [state, formAction] = useFormState(createBookingAction, null);
  const [paxCount, setPaxCount] = useState(1);

  return (
    <form action={formAction} className="space-y-5">
      <input type="hidden" name="departure_id" value={departureId} />

      <div>
        <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-text-secondary">{t.pax}</label>
        <Input
          type="number"
          name="pax_count"
          min={1}
          max={maxPax}
          value={paxCount}
          onChange={(e) => setPaxCount(Math.max(1, Math.min(maxPax, Number(e.target.value) || 1)))}
        />
        <p className="mt-1 text-xs text-muted">{t.max(displayNumber(maxPax))}</p>
      </div>

      <div className="space-y-3">
        <p className="text-xs font-semibold uppercase tracking-wide text-text-secondary">{t.travelers}</p>
        {Array.from({ length: paxCount }).map((_, idx) => (
          <Input key={idx} name="passenger_name" required placeholder={t.name(displayNumber(idx + 1))} />
        ))}
      </div>

      <div>
        <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-text-secondary">{t.notes}</label>
        <Textarea name="notes" placeholder={t.notesPlaceholder} />
      </div>

      <div className="rounded-md bg-bg px-4 py-3">
        <div className="flex items-center justify-between text-sm">
          <span className="text-text-secondary">{t.total}</span>
          <span className="font-display text-lg font-bold text-text-primary">{displayPrice(basePrice * paxCount)}</span>
        </div><div className="mt-1 flex flex-wrap items-center justify-between gap-2 text-[10px] font-semibold text-muted"><span>{t.baseCurrency}</span>{currency !== "IDR" && <span>{t.currencyPending(currency)}</span>}</div>
      </div>

      {state?.errorCode && <p role="alert" className="rounded-md bg-danger-tint px-3 py-2 text-sm text-danger">{errorMessage(state.errorCode)}</p>}
      <SubmitButton processing={t.processing} submit={t.submit} />
    </form>
  );
}
