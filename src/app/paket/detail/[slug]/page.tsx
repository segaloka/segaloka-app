import Link from "next/link";
import { notFound } from "next/navigation";
import { cookies } from "next/headers";
import { MarketplaceHeader } from "@/components/marketplace/MarketplaceHeader";
import { createClient } from "@/lib/supabase/server";

import { WishlistButton } from "@/components/WishlistButton";
import { Icon } from "@/components/layout/Icon";

export default async function PackageDetailPage({ params }: { params: { slug: string } }) {
  const supabase = await createClient();
  const cookieStore = cookies();
  const language = cookieStore.get("segaloka-language")?.value ?? "id";
  const currency = cookieStore.get("segaloka-currency")?.value ?? "IDR";
  const locale = language === "en" ? "en-US" : language === "ar" ? "ar-SA" : "id-ID";
  const displayDate = (value: string | null | undefined) => value ? new Intl.DateTimeFormat(locale, { day: "2-digit", month: "short", year: "numeric" }).format(new Date(value)) : "—";
  const displayPrice = (amount: number | null | undefined) => amount == null ? "—" : new Intl.NumberFormat(locale, { style: "currency", currency: "IDR", maximumFractionDigits: 0 }).format(amount);
  const copy = {
    id: { home:"Beranda", available:"Paket tersedia", days:"hari", itinerary:"Itinerary", transportHotel:"Pesawat & Hotel", facilities:"Fasilitas", terms:"Ketentuan", about:"Tentang paket", summary:"Ringkasan perjalanan", detail:"Detail paket", program:"Program perjalanan", route:"Rute perjalanan", from:"Dari", to:"Ke", nearest:"Jadwal terdekat", flight:"Penerbangan", hotel:"Hotel & akomodasi", startFrom:"Mulai dari", perTraveler:"per jamaah", chooseDeparture:"Pilih keberangkatan", choose:"Pilih", chooseSchedule:"Pilih Jadwal", noSchedule:"Belum ada jadwal", unavailable:"Belum tersedia" },
    en: { home:"Home", available:"Package available", days:"days", itinerary:"Itinerary", transportHotel:"Flight & Hotel", facilities:"Facilities", terms:"Terms", about:"About this package", summary:"Trip summary", detail:"Package details", program:"Travel program", route:"Travel route", from:"From", to:"To", nearest:"Nearest schedule", flight:"Flight", hotel:"Hotel & accommodation", startFrom:"Starts from", perTraveler:"per traveler", chooseDeparture:"Choose departure", choose:"Choose", chooseSchedule:"Choose Schedule", noSchedule:"No schedule yet", unavailable:"Not available" },
    ar: { home:"الرئيسية", available:"الباقة متاحة", days:"أيام", itinerary:"برنامج الرحلة", transportHotel:"الطيران والفندق", facilities:"الخدمات", terms:"الشروط", about:"عن الباقة", summary:"ملخص الرحلة", detail:"تفاصيل الباقة", program:"برنامج السفر", route:"مسار الرحلة", from:"من", to:"إلى", nearest:"أقرب موعد", flight:"الطيران", hotel:"الفندق والإقامة", startFrom:"يبدأ من", perTraveler:"لكل مسافر", chooseDeparture:"اختر موعد المغادرة", choose:"اختر", chooseSchedule:"اختر الموعد", noSchedule:"لا يوجد موعد", unavailable:"غير متاح" }
  } as const;
  const t = copy[language === "en" || language === "ar" ? language : "id"];
  const longCopy = {
    id: {
      routeHint:"Kota asal dan tujuan diisi Travel.", dailyHint:"Program harian mengikuti durasi paket.", returnHint:"Tanggal kembali mengikuti jadwal Travel.", dailyTitle:"Agenda perjalanan per hari", dailyBody:(days:number)=>`Travel akan mengisi Hari 1 sampai Hari ${days}: lokasi awal dan tujuan, aktivitas, waktu kegiatan, transportasi, hotel atau akomodasi, serta catatan perjalanan.`,
      flightBody:"Maskapai, nomor penerbangan, rute, waktu, dan bagasi akan tampil setelah Travel melengkapi data keberangkatan.", hotelBody:"Nama hotel, lokasi, kelas, dan konfigurasi kamar akan ditampilkan sesuai data paket dari Travel.",
      includedEmpty:"Detail fasilitas yang termasuk dalam harga akan ditampilkan setelah dilengkapi Travel.", excludedEmpty:"Detail biaya atau layanan yang tidak termasuk akan ditampilkan setelah dilengkapi Travel.",
      currencyPending:(code:string)=>`Pilihan ${code} aktif · harga sementara ditampilkan dalam IDR sampai kurs tersedia.`, noDeparture:"Belum ada jadwal terbuka. Silakan lihat kembali nanti atau hubungi Travel.", beforeBooking:"Sebelum melanjutkan booking", beforeBookingBody:"Periksa jadwal, harga, fasilitas, ketentuan pembayaran, serta kebijakan perjalanan. Detail final ditampilkan sebelum konfirmasi booking."
    },
    en: {
      routeHint:"Origin and destination cities are provided by the Travel operator.", dailyHint:"The daily program follows the package duration.", returnHint:"The return date follows the Travel schedule.", dailyTitle:"Daily travel plan", dailyBody:(days:number)=>`Travel will provide Day 1 through Day ${days}: origin and destination, activities, times, transportation, hotel or accommodation, and travel notes.`,
      flightBody:"Airline, flight number, route, time, and baggage details will appear after the Travel operator completes the departure information.", hotelBody:"Hotel name, location, class, and room configuration will be displayed according to the Travel package data.",
      includedEmpty:"Facilities included in the price will appear after the Travel operator completes the details.", excludedEmpty:"Costs or services not included will appear after the Travel operator completes the details.",
      currencyPending:(code:string)=>`${code} is selected · prices remain displayed in IDR until an exchange rate is available.`, noDeparture:"No open departure schedule yet. Please check again later or contact the Travel operator.", beforeBooking:"Before continuing to booking", beforeBookingBody:"Review the schedule, price, facilities, payment terms, and travel policies. Final details are shown before booking confirmation."
    },
    ar: {
      routeHint:"تحدد شركة السفر مدينة الانطلاق والوجهة.", dailyHint:"يتبع البرنامج اليومي مدة الباقة.", returnHint:"يتم تحديد تاريخ العودة حسب جدول شركة السفر.", dailyTitle:"البرنامج اليومي للرحلة", dailyBody:(days:number)=>`ستضيف شركة السفر تفاصيل اليوم الأول حتى اليوم ${days}: نقطة الانطلاق والوجهة والأنشطة والأوقات ووسائل النقل والفندق أو الإقامة وملاحظات الرحلة.`,
      flightBody:"ستظهر شركة الطيران ورقم الرحلة والمسار والوقت والأمتعة بعد استكمال شركة السفر بيانات المغادرة.", hotelBody:"سيتم عرض اسم الفندق والموقع والتصنيف ونوع الغرفة وفق بيانات الباقة من شركة السفر.",
      includedEmpty:"ستظهر الخدمات المشمولة في السعر بعد استكمال شركة السفر التفاصيل.", excludedEmpty:"ستظهر التكاليف أو الخدمات غير المشمولة بعد استكمال شركة السفر التفاصيل.",
      currencyPending:(code:string)=>`تم اختيار ${code} · ستظل الأسعار معروضة بالروبية الإندونيسية حتى يتوفر سعر الصرف.`, noDeparture:"لا يوجد موعد مغادرة متاح حالياً. يرجى المحاولة لاحقاً أو التواصل مع شركة السفر.", beforeBooking:"قبل متابعة الحجز", beforeBookingBody:"راجع الموعد والسعر والخدمات وشروط الدفع وسياسات السفر. ستظهر التفاصيل النهائية قبل تأكيد الحجز."
    }
  } as const;
  const lt = longCopy[language === "en" || language === "ar" ? language : "id"];
  const ui = {
    id:{reviews:"ulasan",noReviews:"Belum ada ulasan",experience:"Pengalaman jamaah",ratingTitle:"Rating & ulasan Travel",verified:"Berdasarkan booking di Segaloka",reviewBody:"Ringkasan rating dihitung dari ulasan jamaah setelah booking. Isi ulasan publik akan tampil ketika fitur publikasi ulasan tersedia.",noReviewBody:"Rating belum terbentuk. Ulasan akan berasal dari jamaah setelah melakukan booking melalui Segaloka.",operator:"Penyelenggara perjalanan",onSegaloka:"Travel di Segaloka",viewTravel:"Lihat Travel",license:"Perizinan",licenseMissing:"Informasi izin belum ditampilkan",communication:"Komunikasi",viaSegaloka:"Melalui Segaloka",communicationBody:"Kontak dengan Travel dilakukan melalui fitur Pesan setelah masuk.",address:"Alamat",addressMissing:"Alamat Travel belum ditampilkan.",viewProfile:"Lihat Profil Travel",documents:"Dokumen & persyaratan",documentsBody:"Persyaratan paspor, visa, dan dokumen perjalanan akan ditampilkan di bagian ini.",payment:"Pembayaran",paymentBody:"Pilihan DP, cicilan, atau pelunasan akan mengikuti ketentuan paket.",policy:"Kebijakan perjalanan",policyBody:"Ketentuan pembatalan, refund, dan reschedule akan tampil sebelum booking.",depart:"Berangkat",return:"Kembali",tripDays:"hari perjalanan",seats:"kursi tersisa",almostFull:"Hampir penuh",available:"Tersedia",included:"Termasuk",excluded:"Tidak termasuk",waitingTravel:"Menunggu rincian Travel",airline:"Maskapai",route:"Rute",baggage:"Bagasi",hotelName:"Nama hotel",location:"Lokasi",roomType:"Tipe kamar",transparentPrice:"Harga transparan",registeredTravel:"Travel terdaftar",detailsBeforePay:"Detail sebelum bayar",schedule:"jadwal",seatNearest:"kursi terdekat",itemsListed:"item tercantum",facilitiesListed:"fasilitas tercantum",travel:"Travel",reviewsNav:"Ulasan",activity:"Aktivitas",time:"Waktu",transport:"Transportasi",notes:"Catatan"},
    en:{reviews:"reviews",noReviews:"No reviews yet",experience:"Traveler experience",ratingTitle:"Travel rating & reviews",verified:"Based on bookings on Segaloka",reviewBody:"The rating summary is calculated from traveler reviews after booking. Public review content will appear when review publishing is available.",noReviewBody:"No rating has been established yet. Reviews will come from travelers after booking through Segaloka.",operator:"Travel operator",onSegaloka:"Travel on Segaloka",viewTravel:"View Travel",license:"License",licenseMissing:"License information is not displayed yet",communication:"Communication",viaSegaloka:"Through Segaloka",communicationBody:"Communication with the Travel operator is available through Messages after signing in.",address:"Address",addressMissing:"Travel address is not displayed yet.",viewProfile:"View Travel Profile",documents:"Documents & requirements",documentsBody:"Passport, visa, and travel document requirements will be displayed here.",payment:"Payment",paymentBody:"Deposit, installment, or full payment options follow the package terms.",policy:"Travel policy",policyBody:"Cancellation, refund, and reschedule terms will be shown before booking.",depart:"Departure",return:"Return",tripDays:"travel days",seats:"seats remaining",almostFull:"Almost full",available:"Available",included:"Included",excluded:"Not included",waitingTravel:"Waiting for Travel details",airline:"Airline",route:"Route",baggage:"Baggage",hotelName:"Hotel name",location:"Location",roomType:"Room type",transparentPrice:"Transparent pricing",registeredTravel:"Registered Travel",detailsBeforePay:"Details before payment",schedule:"schedules",seatNearest:"seats on nearest departure",itemsListed:"items listed",facilitiesListed:"facilities listed",travel:"Travel",reviewsNav:"Reviews",activity:"Activity",time:"Time",transport:"Transportation",notes:"Notes"},
    ar:{reviews:"تقييمات",noReviews:"لا توجد تقييمات بعد",experience:"تجربة المسافرين",ratingTitle:"تقييمات شركة السفر",verified:"استناداً إلى الحجوزات عبر Segaloka",reviewBody:"يتم احتساب ملخص التقييم من تقييمات المسافرين بعد الحجز. ستظهر التقييمات العامة عند تفعيل نشر التقييمات.",noReviewBody:"لم يتم تكوين تقييم بعد. ستأتي التقييمات من المسافرين بعد الحجز عبر Segaloka.",operator:"منظم الرحلة",onSegaloka:"شركة سفر على Segaloka",viewTravel:"عرض شركة السفر",license:"الترخيص",licenseMissing:"معلومات الترخيص غير معروضة بعد",communication:"التواصل",viaSegaloka:"عبر Segaloka",communicationBody:"يتم التواصل مع شركة السفر عبر ميزة الرسائل بعد تسجيل الدخول.",address:"العنوان",addressMissing:"عنوان شركة السفر غير معروض بعد.",viewProfile:"عرض ملف شركة السفر",documents:"المستندات والمتطلبات",documentsBody:"ستظهر هنا متطلبات جواز السفر والتأشيرة ومستندات السفر.",payment:"الدفع",paymentBody:"تتبع خيارات الدفعة المقدمة أو التقسيط أو السداد الكامل شروط الباقة.",policy:"سياسة السفر",policyBody:"ستظهر شروط الإلغاء والاسترداد وإعادة الجدولة قبل الحجز.",depart:"المغادرة",return:"العودة",tripDays:"أيام الرحلة",seats:"مقاعد متبقية",almostFull:"شبه ممتلئ",available:"متاح",included:"يشمل",excluded:"لا يشمل",waitingTravel:"بانتظار تفاصيل شركة السفر",airline:"شركة الطيران",route:"المسار",baggage:"الأمتعة",hotelName:"اسم الفندق",location:"الموقع",roomType:"نوع الغرفة",transparentPrice:"سعر واضح",registeredTravel:"شركة سفر مسجلة",detailsBeforePay:"التفاصيل قبل الدفع",schedule:"مواعيد",seatNearest:"مقاعد في أقرب موعد",itemsListed:"عناصر مدرجة",facilitiesListed:"خدمات مدرجة",travel:"شركة السفر",reviewsNav:"التقييمات",activity:"النشاط",time:"الوقت",transport:"النقل",notes:"ملاحظات"}
  } as const;
  const u = ui[language === "en" || language === "ar" ? language : "id"];
  const arrow = language === "ar" ? "←" : "→";
  const { data: pkg } = await supabase
    .from("packages")
    .select("*, organizations(id, name, slug, status, support_phone, support_email, address, license_type, license_number)")
    .eq("slug", params.slug)
    .eq("status", "published")
    .single();

  if (!pkg) notFound();

  const { data: departures } = await supabase
    .from("departures")
    .select("*")
    .eq("package_id", pkg.id)
    .in("status", ["open", "almost_full"])
    .gte("departure_date", new Date().toISOString().slice(0, 10))
    .order("departure_date", { ascending: true });

  const org = pkg.organizations as {
    id: string; name: string; slug: string; status: string; support_phone: string | null;
    support_email: string | null; address: string | null; license_type: string | null;
    license_number: string | null;
  } | null;

  let rating: { average_rating: number | null; review_count: number } | null = null;
  if (org?.id) {
    const { data: ratingRows } = await supabase.rpc("get_travel_rating", { p_org_id: org.id });
    rating = ratingRows?.[0] ?? null;
  }

  const inclusions = Array.isArray(pkg.inclusions) ? (pkg.inclusions as string[]) : [];
  const exclusions = Array.isArray(pkg.exclusions) ? (pkg.exclusions as string[]) : [];

  const { data: { user } } = await supabase.auth.getUser();
  let saved = false;
  if (user) {
    const { data: wishlist } = await supabase.from("wishlists").select("id").eq("user_id", user.id).eq("package_id", pkg.id).maybeSingle();
    saved = Boolean(wishlist);
  }

  return (
    <div dir={language === "ar" ? "rtl" : "ltr"} lang={language} className="min-h-screen bg-[#f7f9fc] text-[#10223f]">
      <MarketplaceHeader />
      <main className="mx-auto max-w-[1180px] px-3 pb-24 pt-4 sm:px-4 sm:pb-12 sm:pt-6">
        <nav className="mb-3 flex items-center gap-1.5 overflow-hidden text-[11px] font-bold text-[#748297] sm:text-xs">
          <Link href="/" className="shrink-0 hover:text-primary">{t.home}</Link><span>/</span>
          <Link href={`/paket/${pkg.type}`} className="shrink-0 hover:text-primary">{pkg.type === "halal_tour" ? "Halal Tour" : pkg.type.charAt(0).toUpperCase() + pkg.type.slice(1)}</Link>
          <span>/</span><span className="truncate text-[#40546f]">{pkg.name}</span>
        </nav>

        <section className="overflow-hidden rounded-[20px] border border-[#dfe7f0] bg-white sm:rounded-[26px]">
          <div className="relative min-h-[220px] bg-[linear-gradient(135deg,#e5f2ff_0%,#f5faff_52%,#e9f8f2_100%)] sm:min-h-[320px]">
            <div className="absolute -right-16 -top-20 h-64 w-64 rounded-full border-[42px] border-white/60" />
            <div className="absolute bottom-4 left-4 flex h-12 w-12 items-center justify-center rounded-2xl bg-white text-primary shadow-sm sm:bottom-6 sm:left-6 sm:h-14 sm:w-14">
              <Icon name={pkg.type === "umrah" ? "building" : pkg.type === "haji" ? "route" : pkg.type === "halal_tour" ? "globe" : "plane"} size={24} />
            </div>
          </div>

          <div className="p-4 sm:p-6">
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0">
                <div className="flex flex-wrap items-center gap-2 text-[11px] font-extrabold sm:text-xs">
                  <span className="rounded-full bg-[#eaf3ff] px-2.5 py-1 text-primary">{pkg.duration_days} hari</span>
                  <span className="rounded-full bg-[#eef8f3] px-2.5 py-1 text-[#167453]">{t.available}</span>
                </div>
                <h1 className="mt-2.5 font-display text-[22px] font-extrabold leading-[1.18] tracking-[-0.025em] sm:text-[30px]">{pkg.name}</h1>
              </div>
              <WishlistButton packageId={pkg.id} initialSaved={saved} />
            </div>

            {org && (
              <div className="mt-4 flex flex-wrap items-center gap-3 border-t border-[#edf1f6] pt-4">
                <Link href={`/travel/${org.slug}`} className="flex min-w-0 items-center gap-2.5">
                  <span className="flex h-10 w-10 shrink-0 items-center justify-center overflow-hidden rounded-xl border border-[#dfe7f0] bg-[#f8fbff] text-primary">
                    <Icon name="building" size={18} />
                  </span>
                  <span className="min-w-0"><span className="block truncate text-[13px] font-extrabold sm:text-sm">{org.name}</span><span className="block text-[11px] text-[#748297]">{u.onSegaloka}</span></span>
                </Link>
                <span className="h-8 w-px bg-[#e4eaf1]" />
                <div className="flex items-center gap-1.5">
                  <span className="text-[#f5a000]">★</span>
                  {rating && rating.review_count > 0 ? (
                    <><span className="text-sm font-extrabold">{Number(rating.average_rating).toFixed(1)}</span><span className="text-xs text-[#748297]">({rating.review_count} {u.reviews})</span></>
                  ) : <span className="text-xs font-bold text-[#748297]">{u.noReviews}</span>}
                </div>
              </div>
            )}
          </div>
        </section>

        <div className="mt-4 grid gap-4 lg:grid-cols-[minmax(0,1fr)_360px] lg:items-start">
          <div className="space-y-4">
            <div className="-mx-3 overflow-x-auto px-3 sm:mx-0 sm:px-0">
              <div className="flex min-w-max gap-2">
                <a href="#itinerary" className="rounded-full border border-[#dfe7f0] bg-white px-3 py-2 text-[11px] font-extrabold text-[#40546f]">{t.itinerary}</a>
                <a href="#transport-hotel" className="rounded-full border border-[#dfe7f0] bg-white px-3 py-2 text-[11px] font-extrabold text-[#40546f]">{t.transportHotel}</a>
                <a href="#facilities" className="rounded-full border border-[#dfe7f0] bg-white px-3 py-2 text-[11px] font-extrabold text-[#40546f]">{t.facilities}</a>
                <a href="#travel" className="rounded-full border border-[#dfe7f0] bg-white px-3 py-2 text-[11px] font-extrabold text-[#40546f]">{u.travel}</a>\n                <a href="#reviews" className="rounded-full border border-[#dfe7f0] bg-white px-3 py-2 text-[11px] font-extrabold text-[#40546f]">{u.reviewsNav}</a>\n                <a href="#terms" className="rounded-full border border-[#dfe7f0] bg-white px-3 py-2 text-[11px] font-extrabold text-[#40546f]">{t.terms}</a>
              </div>
            </div>
            {pkg.description && <section className="rounded-[18px] border border-[#dfe7f0] bg-white p-4 sm:p-6"><h2 className="font-display text-lg font-extrabold">{t.about}</h2><p className="mt-2 whitespace-pre-line text-[13px] leading-6 text-[#60738d] sm:text-sm">{pkg.description}</p></section>}

            <section className="rounded-[18px] border border-[#dfe7f0] bg-white p-4 sm:p-6">
              <div className="flex items-center justify-between gap-3">
                <div><p className="text-[11px] font-extrabold uppercase tracking-[0.12em] text-primary">{t.summary}</p><h2 className="mt-1 font-display text-lg font-extrabold">{t.detail}</h2></div>
                <span className="hidden rounded-full bg-[#f2f6fb] px-3 py-1 text-[10px] font-extrabold text-[#748297] sm:inline-flex">Detail perjalanan</span>
              </div>
              <div className="mt-4 grid grid-cols-2 gap-2 sm:grid-cols-4 sm:gap-3">
                {[["route", "Jenis", pkg.type === "halal_tour" ? "Halal Tour" : pkg.type.charAt(0).toUpperCase() + pkg.type.slice(1)], ["globe", "Durasi", `${pkg.duration_days} ${t.days}`], ["plane", "Keberangkatan", departures?.[0] ? displayDate(departures[0].departure_date) : t.unavailable], ["users", "Ketersediaan", departures?.length ? `${departures.length} ${u.schedule} · ${Math.max(0, departures[0].quota - departures[0].filled)} ${u.seatNearest}` : t.unavailable]].map(([icon, label, value]) => (
                  <div key={label} className="rounded-xl border border-[#e5ebf2] bg-[#fbfcfe] p-3">
                    <span className="text-primary"><Icon name={icon as "route"} size={17} /></span>
                    <p className="mt-2 text-[10px] font-bold uppercase tracking-[0.08em] text-[#8a98aa]">{label}</p>
                    <p className="mt-1 text-xs font-extrabold text-[#40546f]">{value}</p>
                  </div>
                ))}
              </div>
            </section>

            <section id="itinerary" className="rounded-[18px] border border-[#dfe7f0] bg-white p-4 sm:p-6">
              <p className="text-[11px] font-extrabold uppercase tracking-[0.12em] text-primary">{t.program}</p>
              <h2 className="mt-1 font-display text-lg font-extrabold">{t.itinerary}</h2>
              <div className="mt-4 grid gap-3 sm:grid-cols-3">
                <div className="rounded-xl border border-[#e5ebf2] bg-[#fbfcfe] p-3">
                  <p className="text-[10px] font-bold uppercase tracking-[0.08em] text-[#8a98aa]">{t.route}</p>
                  <div className="mt-2 flex items-center gap-2 text-xs font-extrabold text-[#40546f]"><span className="rounded-lg bg-white px-2 py-1 ring-1 ring-[#e5ebf2]">{t.from}</span><span className="text-primary">{arrow}</span><span className="rounded-lg bg-white px-2 py-1 ring-1 ring-[#e5ebf2]">{t.to}</span></div>
                  <p className="mt-2 text-[10px] leading-4 text-[#8a98aa]">{lt.routeHint}</p>
                </div>
                <div className="rounded-xl border border-[#e5ebf2] bg-[#fbfcfe] p-3">
                  <p className="text-[10px] font-bold uppercase tracking-[0.08em] text-[#8a98aa]">Durasi</p>
                  <p className="mt-2 text-sm font-extrabold text-[#40546f]">{pkg.duration_days} hari</p>
                  <p className="mt-2 text-[10px] leading-4 text-[#8a98aa]">{lt.dailyHint}</p>
                </div>
                <div className="rounded-xl border border-[#e5ebf2] bg-[#fbfcfe] p-3">
                  <p className="text-[10px] font-bold uppercase tracking-[0.08em] text-[#8a98aa]">{t.nearest}</p>
                  <p className="mt-2 text-sm font-extrabold text-[#40546f]">{departures?.[0] ? displayDate(departures[0].departure_date) : t.unavailable}</p>
                  <p className="mt-2 text-[10px] leading-4 text-[#8a98aa]">{departures?.[0]?.return_date ? `Kembali ${displayDate(departures[0].return_date)}` : "{lt.returnHint}"}</p>
                </div>
              </div>
              <div className="mt-3 rounded-xl border border-dashed border-[#d7e1ec] bg-[#fbfcfe] p-4 sm:p-5">
                <div className="flex items-start gap-3">
                  <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-[#eaf3ff] text-primary"><Icon name="route" size={17} /></span>
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-extrabold text-[#40546f]">{lt.dailyTitle}</p>
                    <p className="mt-1 text-xs leading-5 text-[#748297]">{lt.dailyBody(pkg.duration_days)}</p>
                    <div className="mt-3 flex flex-wrap gap-2">
                      {[`${t.from} ${arrow} ${t.to}`, u.activity, u.time, t.hotel, u.transport, u.notes].map((item) => <span key={item} className="rounded-full bg-white px-2.5 py-1 text-[10px] font-bold text-[#60738d] ring-1 ring-[#e5ebf2]">{item}</span>)}
                    </div>
                  </div>
                </div>
              </div>
              <div className="mt-3 grid gap-3 sm:grid-cols-2">
                <a href="#facilities" className="rounded-xl border border-[#dfe7f0] bg-[#eef8f3] p-3 transition hover:border-[#b9decf]"><p className="text-[10px] font-extrabold uppercase tracking-[0.08em] text-[#167453]">{u.included}</p><p className="mt-1 text-xs font-bold text-[#40546f]">{inclusions.length ? `${inclusions.length} ${u.facilitiesListed}` : u.waitingTravel}</p></a>
                <a href="#facilities" className="rounded-xl border border-[#dfe7f0] bg-[#fff9ef] p-3 transition hover:border-[#ead5ad]"><p className="text-[10px] font-extrabold uppercase tracking-[0.08em] text-[#b16b00]">{u.excluded}</p><p className="mt-1 text-xs font-bold text-[#40546f]">{exclusions.length ? `${exclusions.length} ${u.itemsListed}` : u.waitingTravel}</p></a>
              </div>
            </section>

            <section id="transport-hotel" className="grid gap-3 sm:grid-cols-2">
              <div className="rounded-[18px] border border-[#dfe7f0] bg-white p-4 sm:p-5">
                <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#eaf3ff] text-primary"><Icon name="plane" size={18} /></div>
                <h2 className="mt-3 font-display text-base font-extrabold">{t.flight}</h2>
                <p className="mt-2 text-xs leading-5 text-[#748297]">{lt.flightBody}</p><div className="mt-4 flex flex-wrap gap-2"><span className="rounded-full bg-[#f4f7fb] px-2.5 py-1 text-[10px] font-bold text-[#748297]">{u.airline}</span><span className="rounded-full bg-[#f4f7fb] px-2.5 py-1 text-[10px] font-bold text-[#748297]">{u.route}</span><span className="rounded-full bg-[#f4f7fb] px-2.5 py-1 text-[10px] font-bold text-[#748297]">{u.baggage}</span></div>
              </div>
              <div className="rounded-[18px] border border-[#dfe7f0] bg-white p-4 sm:p-5">
                <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#eef8f3] text-[#167453]"><Icon name="bed" size={18} /></div>
                <h2 className="mt-3 font-display text-base font-extrabold">{t.hotel}</h2>
                <p className="mt-2 text-xs leading-5 text-[#748297]">{lt.hotelBody}</p><div className="mt-4 flex flex-wrap gap-2"><span className="rounded-full bg-[#f4f7fb] px-2.5 py-1 text-[10px] font-bold text-[#748297]">{u.hotelName}</span><span className="rounded-full bg-[#f4f7fb] px-2.5 py-1 text-[10px] font-bold text-[#748297]">{u.location}</span><span className="rounded-full bg-[#f4f7fb] px-2.5 py-1 text-[10px] font-bold text-[#748297]">{u.roomType}</span></div>
              </div>
            </section>

            <section id="terms" className="grid gap-3 sm:grid-cols-3">
              {[["doc", u.documents, u.documentsBody], ["wallet", u.payment, u.paymentBody], ["shield", u.policy, u.policyBody]].map(([icon, title, body]) => (
                <div key={title} className="rounded-[18px] border border-[#dfe7f0] bg-white p-4">
                  <span className="text-primary"><Icon name={icon as "doc"} size={18} /></span><h2 className="mt-3 text-sm font-extrabold">{title}</h2><p className="mt-2 text-xs leading-5 text-[#748297]">{body}</p>
                </div>
              ))}
            </section>

            <section id="facilities" className="grid gap-3 sm:grid-cols-2">
              <div className="rounded-[18px] border border-[#dfe7f0] bg-white p-4 sm:p-5">
                <div className="flex items-center justify-between gap-3"><h2 className="flex items-center gap-2 font-display text-base font-extrabold"><span className="flex h-7 w-7 items-center justify-center rounded-full bg-[#eef8f3] text-[#20a67a]">✓</span> Termasuk</h2>{inclusions.length > 0 && <span className="rounded-full bg-[#f4f7fb] px-2 py-1 text-[10px] font-extrabold text-[#748297]">{inclusions.length} item</span>}</div>
                {inclusions.length ? <ul className="mt-3 space-y-2">{inclusions.map((item, i) => <li key={i} className="flex gap-2 text-[13px] leading-5 text-[#60738d]"><span className="text-[#20a67a]">✓</span><span>{item}</span></li>)}</ul> : <p className="mt-3 text-xs text-[#748297]">{lt.includedEmpty}</p>}
              </div>
              <div className="rounded-[18px] border border-[#dfe7f0] bg-white p-4 sm:p-5">
                <div className="flex items-center justify-between gap-3"><h2 className="flex items-center gap-2 font-display text-base font-extrabold"><span className="flex h-7 w-7 items-center justify-center rounded-full bg-[#fff7e8] text-[#b16b00]">×</span> Tidak termasuk</h2>{exclusions.length > 0 && <span className="rounded-full bg-[#f4f7fb] px-2 py-1 text-[10px] font-extrabold text-[#748297]">{exclusions.length} item</span>}</div>
                {exclusions.length ? <ul className="mt-3 space-y-2">{exclusions.map((item, i) => <li key={i} className="flex gap-2 text-[13px] leading-5 text-[#60738d]"><span className="text-[#b16b00]">×</span><span>{item}</span></li>)}</ul> : <p className="mt-3 text-xs text-[#748297]">{lt.excludedEmpty}</p>}
              </div>
            </section>

            <section id="reviews" className="rounded-[18px] border border-[#dfe7f0] bg-white p-4 sm:p-6">
              <div className="flex items-start justify-between gap-4">
                <div><p className="text-[11px] font-extrabold uppercase tracking-[0.12em] text-primary">{u.experience}</p><h2 className="mt-1 font-display text-lg font-extrabold">{u.ratingTitle}</h2></div>
                {rating && rating.review_count > 0 ? <div className="shrink-0 text-right"><p className="text-2xl font-extrabold text-[#f5a000]">★ {Number(rating.average_rating).toFixed(1)}</p><p className="text-[11px] font-bold text-[#748297]">{rating.review_count} {u.reviews}</p></div> : null}
              </div>
              {rating && rating.review_count > 0 ? <div className="mt-4 rounded-xl bg-[#f7f9fc] p-4"><div className="flex items-center gap-2 text-[11px] font-extrabold text-[#167453]"><Icon name="check" size={14} /> {u.verified}</div><p className="mt-2 text-xs leading-5 text-[#60738d]">{u.reviewBody}</p></div> : <div className="mt-4 rounded-xl border border-dashed border-[#d7e1ec] bg-[#fbfcfe] p-5 text-center"><span className="mx-auto flex h-10 w-10 items-center justify-center rounded-full bg-[#fff7e8] text-[#f5a000]">★</span><p className="mt-2 text-sm font-extrabold">{u.noReviews}</p><p className="mx-auto mt-1 max-w-md text-xs leading-5 text-[#748297]">{u.noReviewBody}</p></div>}
            </section>

            {org && <section id="travel" className="overflow-hidden rounded-[18px] border border-[#dfe7f0] bg-white">
              <div className="bg-[linear-gradient(135deg,#f7fbff,#f5fbf8)] p-4 sm:p-6">
                <div className="flex items-start gap-3">
                  <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl border border-[#dfe7f0] bg-white text-primary shadow-sm"><Icon name="building" size={20} /></span>
                  <div className="min-w-0 flex-1">
                    <p className="text-[10px] font-extrabold uppercase tracking-[0.12em] text-primary">{u.operator}</p>
                    <h2 className="mt-1 truncate font-display text-lg font-extrabold">{org.name}</h2>
                    <div className="mt-1.5 flex flex-wrap items-center gap-x-3 gap-y-1">
                      <span className="text-[11px] font-bold text-[#167453]">{u.onSegaloka}</span>
                      <span className="text-[11px] text-[#748297]">{rating && rating.review_count > 0 ? `★ ${Number(rating.average_rating).toFixed(1)} · ${rating.review_count} ulasan` : "Belum ada ulasan"}</span>
                    </div>
                  </div>
                  <Link href={`/travel/${org.slug}`} className="hidden rounded-xl border border-[#cfe0f2] bg-white px-3 py-2 text-[11px] font-extrabold text-primary sm:inline-flex">{u.viewTravel} {arrow}</Link>
                </div>
              </div>
              <div className="grid gap-px bg-[#e8edf3] sm:grid-cols-2">
                <div className="bg-white p-4"><p className="text-[10px] font-bold uppercase tracking-[0.08em] text-[#8a98aa]">{u.license}</p><p className="mt-1 text-xs font-extrabold text-[#40546f]">{org.license_type ? `${org.license_type}${org.license_number ? ` · ${org.license_number}` : ""}` : u.licenseMissing}</p></div>
                <div className="bg-white p-4"><p className="text-[10px] font-bold uppercase tracking-[0.08em] text-[#8a98aa]">{u.communication}</p><p className="mt-1 text-xs font-extrabold text-[#40546f]">{u.viaSegaloka}</p><p className="mt-1 text-[10px] leading-4 text-[#8a98aa]">{u.communicationBody}</p></div>
                <div className="bg-white p-4 sm:col-span-2"><p className="text-[10px] font-bold uppercase tracking-[0.08em] text-[#8a98aa]">{u.address}</p><p className="mt-1 text-xs leading-5 text-[#60738d]">{org.address || u.addressMissing}</p></div>
              </div>
              <div className="p-4 sm:hidden"><Link href={`/travel/${org.slug}`} className="flex w-full items-center justify-center rounded-xl bg-[#eaf3ff] px-4 py-3 text-xs font-extrabold text-primary">{u.viewProfile} {arrow}</Link></div>
            </section>}
          </div>

          <aside className="lg:sticky lg:top-[82px]">
            <div className="rounded-[18px] border border-[#d7e3ef] bg-white p-4 shadow-[0_10px_30px_rgba(15,45,90,0.07)] sm:p-5">
              <p className="text-[11px] font-extrabold uppercase tracking-[0.12em] text-[#748297]">{t.startFrom}</p>
              <p className="mt-1 font-display text-[26px] font-extrabold text-primary">{displayPrice(pkg.base_price)}</p>
              <p className="text-xs text-[#748297]">{t.perTraveler}</p>{currency !== "IDR" && <p className="mt-1 text-[10px] font-bold text-[#b16b00]">{lt.currencyPending(currency)}</p>}
              <div className="mt-4 grid grid-cols-2 gap-2 rounded-xl bg-[#f7f9fc] p-3"><div><p className="text-[9px] font-bold uppercase tracking-[0.08em] text-[#8a98aa]">Durasi</p><p className="mt-1 text-xs font-extrabold text-[#40546f]">{pkg.duration_days} hari</p></div><div><p className="text-[9px] font-bold uppercase tracking-[0.08em] text-[#8a98aa]">Jadwal</p><p className="mt-1 text-xs font-extrabold text-[#40546f]">{departures?.length ? `${departures.length} pilihan` : t.unavailable}</p></div></div>
              <div className="mt-4 border-t border-[#edf1f6] pt-4">
                <h2 className="text-xs font-extrabold uppercase tracking-[0.1em]">{t.chooseDeparture}</h2>
                {!departures?.length ? <div className="mt-3 rounded-xl bg-[#f7f9fc] p-3 text-xs leading-5 text-[#60738d]">{lt.noDeparture}</div> : (
                  <div className="mt-3 space-y-2">
                    {departures.map((d) => {
                      const seats = Math.max(0, d.quota - d.filled);
                      return <Link key={d.id} href={`/booking/baru?departure=${d.id}`} className="group block rounded-xl border border-[#dfe7f0] p-3 transition hover:border-primary hover:bg-[#f8fbff]">
                        <div className="flex items-start justify-between gap-3">
                          <div className="min-w-0">
                            <p className="text-[10px] font-bold uppercase tracking-[0.08em] text-[#8a98aa]">{u.depart}</p>
                            <p className="mt-0.5 text-[13px] font-extrabold">{displayDate(d.departure_date)}</p>
                            {d.return_date && <p className="mt-1 text-[11px] text-[#748297]">{u.return} {displayDate(d.return_date)}</p>}<p className="mt-1 text-[10px] font-bold text-[#8a98aa]">{pkg.duration_days} {u.tripDays}</p>
                          </div>
                          <span className="shrink-0 rounded-lg bg-[#eaf3ff] px-2.5 py-1.5 text-[11px] font-extrabold text-primary">{t.choose} {arrow}</span>
                        </div>
                        <div className="mt-3 flex items-center justify-between border-t border-[#edf1f6] pt-2.5">
                          <span className={`text-[11px] font-extrabold ${seats <= 10 ? "text-[#b16b00]" : "text-[#167453]"}`}>{seats} {u.seats}</span>
                          <span className="text-[10px] font-bold text-[#8a98aa]">{d.status === "almost_full" ? u.almostFull : u.available}</span>
                        </div>
                      </Link>;
                    })}
                  </div>
                )}
              </div>
              <div className="mt-4 grid grid-cols-3 gap-2 border-t border-[#edf1f6] pt-4">
                <div className="text-center"><span className="mx-auto flex h-8 w-8 items-center justify-center rounded-full bg-[#eef8f3] text-[#167453]"><Icon name="check" size={15} /></span><p className="mt-1.5 text-[10px] font-bold text-[#60738d]">{u.transparentPrice}</p></div>
                <div className="text-center"><span className="mx-auto flex h-8 w-8 items-center justify-center rounded-full bg-[#eaf3ff] text-primary"><Icon name="shield" size={15} /></span><p className="mt-1.5 text-[10px] font-bold text-[#60738d]">{u.registeredTravel}</p></div>
                <div className="text-center"><span className="mx-auto flex h-8 w-8 items-center justify-center rounded-full bg-[#fff7e8] text-[#b16b00]"><Icon name="doc" size={15} /></span><p className="mt-1.5 text-[10px] font-bold text-[#60738d]">{u.detailsBeforePay}</p></div>
              </div>
              <div className="mt-4 rounded-xl bg-[#f7f9fc] p-3">
                <p className="text-[11px] font-extrabold text-[#40546f]">{lt.beforeBooking}</p>
                <p className="mt-1 text-[10px] leading-4 text-[#748297]">{lt.beforeBookingBody}</p>
              </div>
            </div>
          </aside>
        </div>
      </main>
      <div className="fixed inset-x-0 bottom-0 z-40 border-t border-[#dfe7f0] bg-white/95 px-3 py-2.5 backdrop-blur lg:hidden">
        <div className="mx-auto flex max-w-[1180px] items-center justify-between gap-3">
          <div className="min-w-0">
            <p className="text-[10px] font-bold text-[#748297]">{departures?.[0] ? `Berangkat ${displayDate(departures[0].departure_date)}` : "Mulai dari"}</p>
            <div><div className="flex items-baseline gap-1.5"><p className="font-display text-base font-extrabold text-primary">{displayPrice(pkg.base_price)}</p><span className="text-[9px] font-bold text-[#8a98aa]">/{t.perTraveler}</span></div>{currency !== "IDR" && <p className="mt-0.5 max-w-[210px] text-[8px] font-bold leading-3 text-[#b16b00]">{lt.currencyPending(currency)}</p>}</div>
          </div>
          {departures?.[0] ? <Link href={`/booking/baru?departure=${departures[0].id}`} className="shrink-0 rounded-xl bg-primary px-5 py-3 text-xs font-extrabold text-white shadow-[0_6px_16px_rgba(15,95,175,0.22)]">{t.chooseSchedule}</Link> : <span className="shrink-0 rounded-xl bg-[#e9eef4] px-4 py-3 text-xs font-extrabold text-[#8a98aa]">{t.noSchedule}</span>}
        </div>
      </div>
    </div>
  );
}
