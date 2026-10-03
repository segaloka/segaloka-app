import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { requireUser } from "@/lib/auth";
import { cookies } from "next/headers";
import { BookingForm } from "./BookingForm";
import { PublicNav } from "@/components/layout/PublicNav";

export default async function NewBookingPage({ searchParams }: { searchParams: { departure?: string } }) {
  const cookieStore = cookies();
  const storedLanguage = cookieStore.get("segaloka-language")?.value;
  const storedCurrency = cookieStore.get("segaloka-currency")?.value;
  const language = storedLanguage === "en" || storedLanguage === "ar" ? storedLanguage : "id";
  const currency = storedCurrency === "USD" || storedCurrency === "MYR" || storedCurrency === "SGD" || storedCurrency === "SAR" ? storedCurrency : "IDR";
  const locale = language === "en" ? "en-US" : language === "ar" ? "ar-SA" : "id-ID";
  const copy = {
    id: { booking:"Booking", depart:"Berangkat", days:"hari", perPax:"/jamaah", full:"Mohon maaf, jadwal ini sudah penuh.", currencyPending:(code:string)=>`Pilihan ${code} aktif · harga sementara tetap ditampilkan dalam IDR sampai kurs tersedia.` },
    en: { booking:"Booking", depart:"Departure", days:"days", perPax:"/traveler", full:"Sorry, this departure is fully booked.", currencyPending:(code:string)=>`${code} is selected · prices remain displayed in IDR until an exchange rate is available.` },
    ar: { booking:"الحجز", depart:"المغادرة", days:"أيام", perPax:"/مسافر", full:"عذراً، هذا الموعد مكتمل.", currencyPending:(code:string)=>`تم اختيار ${code} · ستظل الأسعار معروضة بالروبية الإندونيسية حتى يتوفر سعر الصرف.` }
  } as const;
  const t = copy[language];
  const displayDate = (value:string) => new Intl.DateTimeFormat(locale, { day:"2-digit", month:"short", year:"numeric" }).format(new Date(value));
  const displayNumber = (value:number) => new Intl.NumberFormat(locale).format(value);
  const displayPrice = (value:number) => new Intl.NumberFormat(locale, { style:"currency", currency:"IDR", maximumFractionDigits:0 }).format(value);

  if (!searchParams.departure) notFound();
  await requireUser(`/booking/baru?departure=${encodeURIComponent(searchParams.departure)}`);

  const supabase = await createClient();
  const { data: departure } = await supabase
    .from("departures")
    .select("*, packages(name, base_price, duration_days, status, organizations(name))")
    .eq("id", searchParams.departure)
    .gte("departure_date", new Date().toISOString().slice(0, 10))
    .single();

  if (!departure) notFound();

  const pkg = departure.packages as any;

  if (!pkg || pkg.status !== "published") {
    notFound();
  }

  const remaining = Math.max(0, departure.quota - departure.filled);

  return (
    <div className="min-h-screen bg-bg" lang={language} dir={language === "ar" ? "rtl" : "ltr"}>
      <PublicNav />
      <div className="mx-auto max-w-2xl px-4 py-10">
        <p className="text-xs font-bold uppercase tracking-wider text-primary">{t.booking}</p>
        <h1 className="mt-1 font-display text-2xl font-bold text-text-primary">{pkg.name}</h1>
        <p className="mt-1 text-sm text-text-secondary">
          {pkg.organizations?.name} · {t.depart} {displayDate(departure.departure_date)} · {displayNumber(pkg.duration_days)} {t.days} · {displayPrice(pkg.base_price)}{t.perPax}
        </p>
        {currency !== "IDR" && <p className="mt-1 text-xs font-semibold text-warning">{t.currencyPending(currency)}</p>}

        <div className="mt-6 rounded-xl border border-border bg-surface p-6 shadow-card">
          {remaining <= 0 ? (
            <p className="text-sm text-danger">{t.full}</p>
          ) : (
            <BookingForm departureId={departure.id} basePrice={pkg.base_price} maxPax={remaining} language={language} currency={currency} />
          )}
        </div>
      </div>
    </div>
  );
}
