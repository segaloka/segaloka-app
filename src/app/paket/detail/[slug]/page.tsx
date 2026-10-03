import Link from "next/link";
import { notFound } from "next/navigation";
import { cookies } from "next/headers";
import { MarketplaceHeader } from "@/components/marketplace/MarketplaceHeader";
import { createClient } from "@/lib/supabase/server";

import { WishlistButton } from "@/components/WishlistButton";
import { Icon } from "@/components/layout/Icon";
import { PackagePaxSelector } from "./PackagePaxSelector";
import { PackageDetailShowcase } from "./PackageDetailShowcase";

export default async function PackageDetailPage({ params }: { params: { slug: string } }) {
  const supabase = await createClient();
  const cookieStore = cookies();
  const storedLanguage = cookieStore.get("segaloka-language")?.value;
  const storedCurrency = cookieStore.get("segaloka-currency")?.value;
  const language = storedLanguage === "en" || storedLanguage === "ar" ? storedLanguage : "id";
  const currency = storedCurrency === "USD" || storedCurrency === "MYR" || storedCurrency === "SGD" || storedCurrency === "SAR" ? storedCurrency : "IDR";
  const locale = language === "en" ? "en-US" : language === "ar" ? "ar-SA" : "id-ID";
  const displayDate = (value: string | null | undefined) => value ? new Intl.DateTimeFormat(locale, { day: "2-digit", month: "short", year: "numeric" }).format(new Date(value)) : "—";
  const displayPrice = (amount: number | null | undefined) => amount == null ? "—" : new Intl.NumberFormat(locale, { style: "currency", currency: "IDR", maximumFractionDigits: 0 }).format(amount);
  const displayNumber = (value: number) => new Intl.NumberFormat(locale).format(value);
  const displayRating = (value: number | null) => value == null ? "—" : new Intl.NumberFormat(locale, { minimumFractionDigits: 1, maximumFractionDigits: 1 }).format(value);
  const copy = {
    id: { home:"Beranda", available:"Paket tersedia", days:"hari", overview:"Ringkasan", departures:"Jadwal & Harga", itinerary:"Itinerary", transportHotel:"Pesawat & Hotel", facilities:"Fasilitas", terms:"Ketentuan", about:"Tentang paket", summary:"Ringkasan perjalanan", detail:"Detail paket", program:"Program perjalanan", route:"Rute perjalanan", from:"Dari", to:"Ke", nearest:"Jadwal terdekat", flight:"Penerbangan", hotel:"Hotel & akomodasi", startFrom:"Mulai dari", perTraveler:"per jamaah", chooseDeparture:"Pilih keberangkatan", choose:"Pilih", chooseSchedule:"Pilih Jadwal", noSchedule:"Belum ada jadwal", unavailable:"Belum tersedia", baseCurrency:"Harga dasar · IDR" },
    en: { home:"Home", available:"Package available", days:"days", overview:"Overview", departures:"Schedule & Price", itinerary:"Itinerary", transportHotel:"Flight & Hotel", facilities:"Facilities", terms:"Terms", about:"About this package", summary:"Trip summary", detail:"Package details", program:"Travel program", route:"Travel route", from:"From", to:"To", nearest:"Nearest schedule", flight:"Flight", hotel:"Hotel & accommodation", startFrom:"Starts from", perTraveler:"per traveler", chooseDeparture:"Choose departure", choose:"Choose", chooseSchedule:"Choose Schedule", noSchedule:"No schedule yet", unavailable:"Not available", baseCurrency:"Base price · IDR" },
    ar: { home:"الرئيسية", available:"الباقة متاحة", days:"أيام", overview:"الملخص", departures:"المواعيد والأسعار", itinerary:"برنامج الرحلة", transportHotel:"الطيران والفندق", facilities:"الخدمات", terms:"الشروط", about:"عن الباقة", summary:"ملخص الرحلة", detail:"تفاصيل الباقة", program:"برنامج السفر", route:"مسار الرحلة", from:"من", to:"إلى", nearest:"أقرب موعد", flight:"الطيران", hotel:"الفندق والإقامة", startFrom:"يبدأ من", perTraveler:"لكل مسافر", chooseDeparture:"اختر موعد المغادرة", choose:"اختر", chooseSchedule:"اختر الموعد", noSchedule:"لا يوجد موعد", unavailable:"غير متاح", baseCurrency:"السعر الأساسي · IDR" }
  } as const;
  const t = copy[language === "en" || language === "ar" ? language : "id"];
  const longCopy = {
    id: {
      routeHint:"Kota asal dan tujuan diisi Travel.", dailyHint:"Program harian mengikuti durasi paket.", returnHint:"Tanggal kembali mengikuti jadwal Travel.", dailyTitle:"Agenda perjalanan per hari", dailyBody:(days:string)=>`Travel akan mengisi Hari ${displayNumber(1)} sampai Hari ${days}: lokasi awal dan tujuan, aktivitas, waktu kegiatan, transportasi, hotel atau akomodasi, serta catatan perjalanan.`,
      flightBody:"Maskapai, nomor penerbangan, rute, waktu, dan bagasi akan tampil setelah Travel melengkapi data keberangkatan.", hotelBody:"Nama hotel, lokasi, kelas, dan konfigurasi kamar akan ditampilkan sesuai data paket dari Travel.",
      includedEmpty:"Detail fasilitas yang termasuk dalam harga akan ditampilkan setelah dilengkapi Travel.", excludedEmpty:"Detail biaya atau layanan yang tidak termasuk akan ditampilkan setelah dilengkapi Travel.",
      currencyPending:(code:string)=>`Pilihan ${code} aktif · harga sementara ditampilkan dalam IDR sampai kurs tersedia.`, noDeparture:"Belum ada jadwal terbuka. Silakan lihat kembali nanti atau hubungi Travel.", beforeBooking:"Sebelum melanjutkan booking", beforeBookingBody:"Periksa jadwal, harga, fasilitas, ketentuan pembayaran, serta kebijakan perjalanan. Detail final ditampilkan sebelum konfirmasi booking."
    },
    en: {
      routeHint:"Origin and destination cities are provided by the Travel operator.", dailyHint:"The daily program follows the package duration.", returnHint:"The return date follows the Travel schedule.", dailyTitle:"Daily travel plan", dailyBody:(days:string)=>`Travel will provide Day ${displayNumber(1)} through Day ${days}: origin and destination, activities, times, transportation, hotel or accommodation, and travel notes.`,
      flightBody:"Airline, flight number, route, time, and baggage details will appear after the Travel operator completes the departure information.", hotelBody:"Hotel name, location, class, and room configuration will be displayed according to the Travel package data.",
      includedEmpty:"Facilities included in the price will appear after the Travel operator completes the details.", excludedEmpty:"Costs or services not included will appear after the Travel operator completes the details.",
      currencyPending:(code:string)=>`${code} is selected · prices remain displayed in IDR until an exchange rate is available.`, noDeparture:"No open departure schedule yet. Please check again later or contact the Travel operator.", beforeBooking:"Before continuing to booking", beforeBookingBody:"Review the schedule, price, facilities, payment terms, and travel policies. Final details are shown before booking confirmation."
    },
    ar: {
      routeHint:"تحدد شركة السفر مدينة الانطلاق والوجهة.", dailyHint:"يتبع البرنامج اليومي مدة الباقة.", returnHint:"يتم تحديد تاريخ العودة حسب جدول شركة السفر.", dailyTitle:"البرنامج اليومي للرحلة", dailyBody:(days:string)=>`ستضيف شركة السفر تفاصيل اليوم ${displayNumber(1)} حتى اليوم ${days}: نقطة الانطلاق والوجهة والأنشطة والأوقات ووسائل النقل والفندق أو الإقامة وملاحظات الرحلة.`,
      flightBody:"ستظهر شركة الطيران ورقم الرحلة والمسار والوقت والأمتعة بعد استكمال شركة السفر بيانات المغادرة.", hotelBody:"سيتم عرض اسم الفندق والموقع والتصنيف ونوع الغرفة وفق بيانات الباقة من شركة السفر.",
      includedEmpty:"ستظهر الخدمات المشمولة في السعر بعد استكمال شركة السفر التفاصيل.", excludedEmpty:"ستظهر التكاليف أو الخدمات غير المشمولة بعد استكمال شركة السفر التفاصيل.",
      currencyPending:(code:string)=>`تم اختيار ${code} · ستظل الأسعار معروضة بالروبية الإندونيسية حتى يتوفر سعر الصرف.`, noDeparture:"لا يوجد موعد مغادرة متاح حالياً. يرجى المحاولة لاحقاً أو التواصل مع شركة السفر.", beforeBooking:"قبل متابعة الحجز", beforeBookingBody:"راجع الموعد والسعر والخدمات وشروط الدفع وسياسات السفر. ستظهر التفاصيل النهائية قبل تأكيد الحجز."
    }
  } as const;
  const lt = longCopy[language === "en" || language === "ar" ? language : "id"];
  const ui = {
    id:{previewTravel:"Travel contoh",noActiveSchedule:"Belum ada jadwal",soldOut:"Penuh",sectionNav:"Navigasi detail paket",previewLabel:"Preview tampilan",previewNotice:"Paket contoh untuk pengembangan UI. Booking belum diaktifkan sampai paket dipublikasikan oleh Travel.",previewAction:"Belum dapat dipesan",nearestSchedule:"Jadwal terdekat",viewAllSchedules:"Lihat semua jadwal",remainingSeats:"Sisa kursi",ratingSummary:"Ringkasan rating",reviewSource:"Sumber ulasan",bookingSource:"Booking melalui Segaloka",selectScheduleFirst:"Pilih jadwal",travelInfo:"Informasi Travel",ratingLabel:"Rating jamaah",licenseLabel:"Izin usaha",contactLabel:"Kanal komunikasi",addressLabel:"Lokasi Travel",facilityTitle:"Fasilitas paket",facilityHint:"Periksa dengan jelas layanan yang termasuk dan tidak termasuk dalam harga paket.",termsTitle:"Ketentuan sebelum booking",termsHint:"Informasi penting yang perlu diperiksa sebelum memilih jadwal dan melakukan pembayaran.",detailsPending:"Detail menyusul",departureData:"Data keberangkatan",accommodationData:"Data akomodasi",day:"Hari",timelinePreview:"Preview itinerary",timelineHint:"Rincian per hari akan mengikuti itinerary yang diisi Travel.",heroPrice:"Harga mulai",nearestDeparture:"Keberangkatan terdekat",openSchedules:"jadwal tersedia",reviews:"ulasan",noReviews:"Belum ada ulasan",experience:"Pengalaman jamaah",ratingTitle:"Rating & ulasan Travel",verified:"Berdasarkan booking di Segaloka",reviewBody:"Ringkasan rating dihitung dari ulasan jamaah setelah booking. Isi ulasan publik akan tampil ketika fitur publikasi ulasan tersedia.",noReviewBody:"Rating belum terbentuk. Ulasan akan berasal dari jamaah setelah melakukan booking melalui Segaloka.",operator:"Penyelenggara perjalanan",onSegaloka:"Travel di Segaloka",viewTravel:"Lihat Travel",license:"Perizinan",licenseMissing:"Informasi izin belum ditampilkan",communication:"Komunikasi",viaSegaloka:"Melalui Segaloka",communicationBody:"Kontak dengan Travel dilakukan melalui fitur Pesan setelah masuk.",address:"Alamat",addressMissing:"Alamat Travel belum ditampilkan.",viewProfile:"Lihat Profil Travel",documents:"Dokumen & persyaratan",documentsBody:"Persyaratan paspor, visa, dan dokumen perjalanan akan ditampilkan di bagian ini.",payment:"Pembayaran",paymentBody:"Pilihan DP, cicilan, atau pelunasan akan mengikuti ketentuan paket.",policy:"Kebijakan perjalanan",policyBody:"Ketentuan pembatalan, refund, dan reschedule akan tampil sebelum booking.",depart:"Berangkat",return:"Kembali",tripDays:"hari perjalanan",seats:"kursi tersisa",almostFull:"Hampir penuh",available:"Tersedia",included:"Termasuk",excluded:"Tidak termasuk",waitingTravel:"Menunggu rincian Travel",airline:"Maskapai",route:"Rute",baggage:"Bagasi",hotelName:"Nama hotel",location:"Lokasi",roomType:"Tipe kamar",transparentPrice:"Harga transparan",registeredTravel:"Travel terdaftar",detailsBeforePay:"Detail sebelum bayar",schedule:"jadwal",seatNearest:"kursi terdekat",itemsListed:"item tercantum",facilitiesListed:"fasilitas tercantum",travel:"Travel",reviewsNav:"Ulasan",activity:"Aktivitas",time:"Waktu",transport:"Transportasi",notes:"Catatan",typeLabel:"Jenis",duration:"Durasi",departureLabel:"Keberangkatan",availabilityLabel:"Ketersediaan",scheduleLabel:"Jadwal",choices:"pilihan",item:"item",journeyDetail:"Detail perjalanan"},
    en:{previewTravel:"Sample Travel",noActiveSchedule:"No active schedule",soldOut:"Sold out",sectionNav:"Package detail navigation",previewLabel:"UI preview",previewNotice:"Sample package for UI development. Booking remains disabled until the package is published by a Travel operator.",previewAction:"Not bookable yet",nearestSchedule:"Nearest schedule",viewAllSchedules:"View all schedules",remainingSeats:"Seats left",ratingSummary:"Rating summary",reviewSource:"Review source",bookingSource:"Bookings through Segaloka",selectScheduleFirst:"Choose schedule",travelInfo:"Travel information",ratingLabel:"Traveler rating",licenseLabel:"Business license",contactLabel:"Communication channel",addressLabel:"Travel location",facilityTitle:"Package facilities",facilityHint:"Review which services are included and excluded from the package price.",termsTitle:"Terms before booking",termsHint:"Important information to review before choosing a schedule and making payment.",detailsPending:"Details to follow",departureData:"Departure details",accommodationData:"Accommodation details",day:"Day",timelinePreview:"Itinerary preview",timelineHint:"Daily details will follow the itinerary provided by the Travel operator.",heroPrice:"Starts from",nearestDeparture:"Nearest departure",openSchedules:"open schedules",reviews:"reviews",noReviews:"No reviews yet",experience:"Traveler experience",ratingTitle:"Travel rating & reviews",verified:"Based on bookings on Segaloka",reviewBody:"The rating summary is calculated from traveler reviews after booking. Public review content will appear when review publishing is available.",noReviewBody:"No rating has been established yet. Reviews will come from travelers after booking through Segaloka.",operator:"Travel operator",onSegaloka:"Travel on Segaloka",viewTravel:"View Travel",license:"License",licenseMissing:"License information is not displayed yet",communication:"Communication",viaSegaloka:"Through Segaloka",communicationBody:"Communication with the Travel operator is available through Messages after signing in.",address:"Address",addressMissing:"Travel address is not displayed yet.",viewProfile:"View Travel Profile",documents:"Documents & requirements",documentsBody:"Passport, visa, and travel document requirements will be displayed here.",payment:"Payment",paymentBody:"Deposit, installment, or full payment options follow the package terms.",policy:"Travel policy",policyBody:"Cancellation, refund, and reschedule terms will be shown before booking.",depart:"Departure",return:"Return",tripDays:"travel days",seats:"seats remaining",almostFull:"Almost full",available:"Available",included:"Included",excluded:"Not included",waitingTravel:"Waiting for Travel details",airline:"Airline",route:"Route",baggage:"Baggage",hotelName:"Hotel name",location:"Location",roomType:"Room type",transparentPrice:"Transparent pricing",registeredTravel:"Registered Travel",detailsBeforePay:"Details before payment",schedule:"schedules",seatNearest:"seats on nearest departure",itemsListed:"items listed",facilitiesListed:"facilities listed",travel:"Travel",reviewsNav:"Reviews",activity:"Activity",time:"Time",transport:"Transportation",notes:"Notes",typeLabel:"Type",duration:"Duration",departureLabel:"Departure",availabilityLabel:"Availability",scheduleLabel:"Schedule",choices:"options",item:"item",journeyDetail:"Journey details"},
    ar:{previewTravel:"شركة سفر تجريبية",noActiveSchedule:"لا يوجد موعد متاح",soldOut:"مكتمل",sectionNav:"التنقل في تفاصيل الباقة",previewLabel:"معاينة الواجهة",previewNotice:"باقة تجريبية لتطوير الواجهة. الحجز غير متاح حتى تنشر شركة السفر الباقة.",previewAction:"الحجز غير متاح بعد",nearestSchedule:"أقرب موعد",viewAllSchedules:"عرض جميع المواعيد",remainingSeats:"المقاعد المتبقية",ratingSummary:"ملخص التقييم",reviewSource:"مصدر التقييمات",bookingSource:"الحجوزات عبر Segaloka",selectScheduleFirst:"اختر الموعد",travelInfo:"معلومات شركة السفر",ratingLabel:"تقييم المسافرين",licenseLabel:"ترخيص النشاط",contactLabel:"قناة التواصل",addressLabel:"موقع شركة السفر",facilityTitle:"خدمات الباقة",facilityHint:"راجع الخدمات المشمولة وغير المشمولة في سعر الباقة بوضوح.",termsTitle:"الشروط قبل الحجز",termsHint:"معلومات مهمة يجب مراجعتها قبل اختيار الموعد وإجراء الدفع.",detailsPending:"التفاصيل لاحقاً",departureData:"بيانات المغادرة",accommodationData:"بيانات الإقامة",day:"اليوم",timelinePreview:"معاينة برنامج الرحلة",timelineHint:"ستتبع التفاصيل اليومية برنامج الرحلة الذي تضيفه شركة السفر.",heroPrice:"يبدأ السعر من",nearestDeparture:"أقرب موعد مغادرة",openSchedules:"مواعيد متاحة",reviews:"تقييمات",noReviews:"لا توجد تقييمات بعد",experience:"تجربة المسافرين",ratingTitle:"تقييمات شركة السفر",verified:"استناداً إلى الحجوزات عبر Segaloka",reviewBody:"يتم احتساب ملخص التقييم من تقييمات المسافرين بعد الحجز. ستظهر التقييمات العامة عند تفعيل نشر التقييمات.",noReviewBody:"لم يتم تكوين تقييم بعد. ستأتي التقييمات من المسافرين بعد الحجز عبر Segaloka.",operator:"منظم الرحلة",onSegaloka:"شركة سفر على Segaloka",viewTravel:"عرض شركة السفر",license:"الترخيص",licenseMissing:"معلومات الترخيص غير معروضة بعد",communication:"التواصل",viaSegaloka:"عبر Segaloka",communicationBody:"يتم التواصل مع شركة السفر عبر ميزة الرسائل بعد تسجيل الدخول.",address:"العنوان",addressMissing:"عنوان شركة السفر غير معروض بعد.",viewProfile:"عرض ملف شركة السفر",documents:"المستندات والمتطلبات",documentsBody:"ستظهر هنا متطلبات جواز السفر والتأشيرة ومستندات السفر.",payment:"الدفع",paymentBody:"تتبع خيارات الدفعة المقدمة أو التقسيط أو السداد الكامل شروط الباقة.",policy:"سياسة السفر",policyBody:"ستظهر شروط الإلغاء والاسترداد وإعادة الجدولة قبل الحجز.",depart:"المغادرة",return:"العودة",tripDays:"أيام الرحلة",seats:"مقاعد متبقية",almostFull:"شبه ممتلئ",available:"متاح",included:"يشمل",excluded:"لا يشمل",waitingTravel:"بانتظار تفاصيل شركة السفر",airline:"شركة الطيران",route:"المسار",baggage:"الأمتعة",hotelName:"اسم الفندق",location:"الموقع",roomType:"نوع الغرفة",transparentPrice:"سعر واضح",registeredTravel:"شركة سفر مسجلة",detailsBeforePay:"التفاصيل قبل الدفع",schedule:"مواعيد",seatNearest:"مقاعد في أقرب موعد",itemsListed:"عناصر مدرجة",facilitiesListed:"خدمات مدرجة",travel:"شركة السفر",reviewsNav:"التقييمات",activity:"النشاط",time:"الوقت",transport:"النقل",notes:"ملاحظات",typeLabel:"النوع",duration:"المدة",departureLabel:"المغادرة",availabilityLabel:"التوفر",scheduleLabel:"المواعيد",choices:"خيارات",item:"عنصر",journeyDetail:"تفاصيل الرحلة"}
  } as const;
  const u = ui[language === "en" || language === "ar" ? language : "id"];
  const arrow = language === "ar" ? "←" : "→";
  const packageTypeLabels: Record<"id" | "en" | "ar", Record<string, string>> = {
    id: { umrah: "Umrah", haji: "Haji", halal_tour: "Halal Tour", tour: "Tour" },
    en: { umrah: "Umrah", haji: "Hajj", halal_tour: "Halal Tour", tour: "Tour" },
    ar: { umrah: "عمرة", haji: "حج", halal_tour: "جولة حلال", tour: "جولة سياحية" },
  };
  const packageTypeLabel = (pkgType: string) => packageTypeLabels[language][pkgType] ?? pkgType.replaceAll("_", " ");
  const previewPackages = [
    ["preview-umrah-reguler-9-hari","preview-umrah-01","Umrah Reguler 9 Hari","umrah",9,28900000,"Travel Amanah","travel-amanah","2026-10-18","2026-10-26",45,33,"open"],
    ["preview-umrah-plus-thaif-12-hari","preview-umrah-02","Umrah Plus Thaif 12 Hari","umrah",12,34500000,"Nusantara Haramain","nusantara-haramain","2026-11-03","2026-11-14",45,17,"open"],
    ["preview-program-haji-pilihan","preview-haji-01","Program Haji Pilihan","haji",25,185000000,"Safar Indonesia","safar-indonesia","2027-05-08","2027-06-01",40,31,"almost_full"],
    ["preview-halal-tour-turki-8-hari","preview-halal-01","Halal Tour Turki 8 Hari","halal_tour",8,23900000,"Jelajah Muslim","jelajah-muslim","2026-12-12","2026-12-19",30,12,"open"],
    ["preview-explore-jepang-7-hari","preview-tour-01","Explore Jepang 7 Hari","tour",7,21900000,"Langkah Dunia","langkah-dunia","2027-01-16","2027-01-22",30,8,"open"],
    ["preview-umrah-awal-tahun-9-hari","preview-umrah-03","Umrah Awal Tahun 9 Hari","umrah",9,30500000,"Berkah Journey","berkah-journey","2027-01-09","2027-01-17",45,22,"open"],
    ["preview-halal-tour-korea-7-hari","preview-halal-02","Halal Tour Korea 7 Hari","halal_tour",7,24900000,"Jelajah Muslim","jelajah-muslim","2027-02-06","2027-02-12",30,19,"open"],
    ["preview-singapore-malaysia","preview-tour-02","Explore Singapore & Malaysia","tour",5,8900000,"Langkah Dunia","langkah-dunia","2026-11-21","2026-11-25",35,29,"almost_full"],
  ] as const;
  const preview = previewPackages.find(([slug]) => slug === params.slug);
  const isPreview = Boolean(preview);

  let pkg: any = null;
  let departures: any[] | null = null;

  if (preview) {
    const [slug,id,name,type,duration,price,orgName,orgSlug,depart,ret,quota,filled,status] = preview;
    pkg = { id, slug, name, type, duration_days:duration, base_price:price, description:null, inclusions:[], exclusions:[], organizations:{ id:"", name:orgName, slug:orgSlug, status:"active", support_phone:null, support_email:null, address:null, license_type:null, license_number:null } };
    departures = [{ id:`preview-departure-${id.split("-").at(-1)}`, package_id:id, departure_date:depart, return_date:ret, quota, filled, status }];
  } else {
    const { data } = await supabase
      .from("packages")
      .select("*, organizations(id, name, slug, status, support_phone, support_email, address, license_type, license_number)")
      .eq("slug", params.slug)
      .eq("status", "published")
      .single();
    pkg = data;
    if (pkg) {
      const departureResult = await supabase
        .from("departures")
        .select("*")
        .eq("package_id", pkg.id)
        .in("status", ["open", "almost_full"])
        .gte("departure_date", new Date().toISOString().slice(0, 10))
        .order("departure_date", { ascending: true });
      departures = (departureResult.data ?? []).filter((departure) => departure.quota - departure.filled > 0);
    }
  }

  if (!pkg) notFound();

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
      <MarketplaceHeader initialLanguage={language} initialCurrency={currency} />
      <main className="mx-auto max-w-[1180px] px-3 pb-24 pt-4 sm:px-4 sm:pb-12 sm:pt-6">
        <nav className="mb-3 flex items-center gap-1.5 overflow-hidden text-[11px] font-bold text-[#748297] sm:text-xs">
          <Link href="/" className="shrink-0 hover:text-primary">{t.home}</Link><span>/</span>
          <Link href={`/paket/${pkg.type}`} className="shrink-0 hover:text-primary">{packageTypeLabel(pkg.type)}</Link>
          <span>/</span><span className="truncate text-[#40546f]">{pkg.name}</span>
        </nav>
        {isPreview && <div className="mb-3 flex items-start gap-2.5 rounded-2xl border border-[#d8e6f5] bg-[#eef6ff] px-3.5 py-3 text-[#40546f] sm:px-4"><span className="mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-white text-primary ring-1 ring-[#d8e6f5]"><Icon name="info" size={13} /></span><div><p className="text-[10px] font-extrabold uppercase tracking-[0.1em] text-primary">{u.previewLabel}</p><p className="mt-0.5 text-[11px] leading-5 sm:text-xs">{u.previewNotice}</p></div></div>}


        <section className="mb-4">
          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0">
              <h1 className="break-words font-display text-[24px] font-extrabold leading-[1.12] tracking-[-0.03em] sm:text-[32px]">{pkg.name}</h1>
              <div className="mt-2 flex flex-wrap items-center gap-x-3 gap-y-1.5 text-[11px] font-bold text-[#748297]">
                {org && <span className="inline-flex items-center gap-1.5"><span className="h-2 w-2 rounded-full bg-primary" />{org.name}</span>}
                <span className="inline-flex items-center gap-1.5"><Icon name="route" size={12} />{packageTypeLabel(pkg.type)} · {displayNumber(pkg.duration_days)} {t.days}</span>
                <span className="inline-flex items-center gap-1.5"><span className="text-[#f5a000]">★</span>{rating && rating.review_count > 0 ? `${displayRating(rating.average_rating)} (${displayNumber(rating.review_count)} ${u.reviews})` : u.noReviews}</span>
              </div>
            </div>
            {!isPreview && <WishlistButton packageId={pkg.id} initialSaved={saved} />}
          </div>

        </section>

        <div className="mt-4 grid gap-4 lg:grid-cols-[minmax(0,1fr)_330px] lg:items-start">
          <div className="space-y-4">
            <PackageDetailShowcase language={language} description={pkg.description} durationDays={pkg.duration_days} inclusions={inclusions} exclusions={exclusions} rating={rating && rating.review_count > 0 ? rating.average_rating : null} reviewCount={rating?.review_count ?? 0} />
          <aside className="lg:sticky lg:top-[82px]">
            <div className="rounded-[18px] border border-[#d7e3ef] bg-white p-4 shadow-[0_10px_30px_rgba(15,45,90,0.07)] sm:p-5">
              <p className="text-[11px] font-extrabold uppercase tracking-[0.12em] text-[#748297]">{t.startFrom}</p>
              <p className="mt-1 font-display text-[26px] font-extrabold text-primary">{displayPrice(pkg.base_price)}</p>
              <div className="flex flex-wrap items-center gap-x-2 gap-y-1"><p className="text-xs text-[#748297]">{t.perTraveler}</p><span className="rounded-full bg-[#f4f7fb] px-2 py-0.5 text-[9px] font-extrabold text-[#748297]">{t.baseCurrency}</span></div>{currency !== "IDR" && <p className="mt-1 text-[10px] font-bold text-[#b16b00]">{lt.currencyPending(currency)}</p>}
              <div className="mt-4 grid grid-cols-2 gap-2 rounded-xl bg-[#f7f9fc] p-3"><div><p className="text-[9px] font-bold uppercase tracking-[0.08em] text-[#8a98aa]">{u.duration}</p><p className="mt-1 text-xs font-extrabold text-[#40546f]">{displayNumber(pkg.duration_days)} {t.days}</p></div><div><p className="text-[9px] font-bold uppercase tracking-[0.08em] text-[#8a98aa]">{u.scheduleLabel}</p><p className="mt-1 text-xs font-extrabold text-[#40546f]">{departures?.length ? `${displayNumber(departures.length)} ${u.choices}` : t.unavailable}</p></div></div>
              <div className="mt-4 border-t border-[#edf1f6] pt-4">
                <div className="flex items-center justify-between gap-3"><h2 className="text-xs font-extrabold uppercase tracking-[0.1em]">{u.nearestSchedule}</h2>{departures?.length ? <span className="rounded-full bg-[#f2f6fb] px-2 py-1 text-[9px] font-extrabold text-[#748297]">{displayNumber(departures.length)} {u.choices}</span> : null}</div>
                {!departures?.length ? <div className="mt-3 rounded-xl bg-[#f7f9fc] p-3 text-xs leading-5 text-[#60738d]">{lt.noDeparture}</div> : <>
                  <div className="mt-3 rounded-xl border border-[#dfe7f0] bg-[#fbfcfe] p-3">
                    <div className="flex items-start justify-between gap-3"><div className="min-w-0"><p className="text-[10px] font-bold uppercase tracking-[0.08em] text-[#8a98aa]">{u.depart}</p><p className="mt-1 text-sm font-extrabold text-[#10223f]">{displayDate(departures[0].departure_date)}</p><p className="mt-1 text-[10px] text-[#748297]">{u.return} · {departures[0].return_date ? displayDate(departures[0].return_date) : t.unavailable}</p></div><span className={`shrink-0 rounded-full px-2 py-1 text-[9px] font-extrabold ${Math.max(0, departures[0].quota - departures[0].filled) <= 0 ? "bg-[#f2f4f7] text-[#7a8798]" : Math.max(0, departures[0].quota - departures[0].filled) <= 10 ? "bg-[#fff7e8] text-[#b16b00]" : "bg-[#eef8f3] text-[#167453]"}`}>{Math.max(0, departures[0].quota - departures[0].filled) <= 0 ? u.soldOut : Math.max(0, departures[0].quota - departures[0].filled) <= 10 ? u.almostFull : u.available}</span></div>
                    <div className="mt-3 flex items-center justify-between border-t border-[#edf1f6] pt-2.5"><span className="text-[10px] font-bold text-[#8a98aa]">{u.remainingSeats}</span><span className="text-xs font-extrabold text-[#40546f]">{displayNumber(Math.max(0, departures[0].quota - departures[0].filled))} {u.seats}</span></div>
                  </div>
                  <PackagePaxSelector departureId={departures[0].id} maxPax={Math.max(0, departures[0].quota - departures[0].filled)} basePrice={pkg.base_price} language={language} isPreview={isPreview} />
                </>}
              </div>
              <div className="mt-4 grid grid-cols-3 gap-2 border-t border-[#edf1f6] pt-4">
                <div className="text-center"><span className="mx-auto flex h-8 w-8 items-center justify-center rounded-full bg-[#eef8f3] text-[#167453]"><Icon name="check" size={15} /></span><p className="mt-1.5 text-[10px] font-bold text-[#60738d]">{u.transparentPrice}</p></div>
                <div className="text-center"><span className="mx-auto flex h-8 w-8 items-center justify-center rounded-full bg-[#eaf3ff] text-primary"><Icon name="shield" size={15} /></span><p className="mt-1.5 text-[10px] font-bold text-[#60738d]">{isPreview ? u.previewTravel : u.registeredTravel}</p></div>
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
      <div className="fixed inset-x-0 bottom-0 z-40 border-t border-[#dfe7f0] bg-white/95 px-3 pb-[max(0.625rem,env(safe-area-inset-bottom))] pt-2.5 shadow-[0_-8px_24px_rgba(15,45,90,0.08)] backdrop-blur lg:hidden">
        <div className="mx-auto flex max-w-[1180px] items-center justify-between gap-3">
          <div className="min-w-0">
            <p className="text-[10px] font-bold text-[#748297]">{departures?.[0] ? `${u.depart} ${displayDate(departures[0].departure_date)}` : t.startFrom}</p>
            <div><div className="flex items-baseline gap-1.5"><p className="font-display text-base font-extrabold text-primary">{displayPrice(pkg.base_price)}</p><span className="text-[9px] font-bold text-[#8a98aa]">{t.perTraveler}</span></div>{currency !== "IDR" && <p className="mt-0.5 max-w-[210px] text-[8px] font-bold leading-3 text-[#b16b00]">{lt.currencyPending(currency)}</p>}</div>
          </div>
          {departures?.[0] ? (isPreview ? <span className="max-w-[48%] shrink-0 rounded-xl bg-[#e9eef4] px-4 py-3 text-center text-xs font-extrabold leading-4 text-[#8a98aa]">{u.previewAction}</span> : <a href="#departures" className="max-w-[48%] shrink-0 rounded-xl bg-primary px-4 py-3 text-center text-xs font-extrabold leading-4 text-white shadow-[0_6px_16px_rgba(15,95,175,0.22)]">{u.selectScheduleFirst}</a>) : <span className="max-w-[48%] shrink-0 rounded-xl bg-[#e9eef4] px-4 py-3 text-center text-xs font-extrabold leading-4 text-[#8a98aa]">{t.noSchedule}</span>}
        </div>
      </div>
    </div>
  );
}
