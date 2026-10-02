import { createClient } from "@/lib/supabase/server";
import { requireUser } from "@/lib/auth";
import { PageHeader } from "@/components/layout/PageHeader";
import { DataTable, type Column } from "@/components/ui/DataTable";
import { Badge } from "@/components/ui/Badge";
import { cookies } from "next/headers";

export default async function AkunBookingListPage() {
  const cookieStore = cookies();
  const storedLanguage = cookieStore.get("segaloka-language")?.value;
  const storedCurrency = cookieStore.get("segaloka-currency")?.value;
  const language = storedLanguage === "en" || storedLanguage === "ar" ? storedLanguage : "id";
  const currency = storedCurrency === "USD" || storedCurrency === "MYR" || storedCurrency === "SGD" || storedCurrency === "SAR" ? storedCurrency : "IDR";
  const locale = language === "en" ? "en-US" : language === "ar" ? "ar-SA" : "id-ID";
  const copy = {
    id:{eyebrow:"Traveler",title:"Booking Saya",description:"Seluruh riwayat booking perjalanan Anda.",code:"Kode",package:"Paket",travel:"Travel",departure:"Keberangkatan",pax:"Jamaah",total:"Total",status:"Status",empty:"Belum ada booking",emptyDescription:"Booking yang Anda buat akan muncul di sini.",currencyPending:(code:string)=>`Pilihan ${code} aktif · nilai transaksi tetap ditampilkan dalam IDR sampai kurs tersedia.`,statuses:{pending:"Menunggu",pending_verification:"Menunggu verifikasi",confirmed:"Dikonfirmasi",paid:"Lunas",cancelled:"Dibatalkan",failed:"Gagal",expired:"Kedaluwarsa",active:"Aktif"}},
    en:{eyebrow:"Traveler",title:"My Bookings",description:"Your complete travel booking history.",code:"Code",package:"Package",travel:"Travel",departure:"Departure",pax:"Travelers",total:"Total",status:"Status",empty:"No bookings yet",emptyDescription:"Bookings you create will appear here.",currencyPending:(code:string)=>`${code} is selected · transaction values remain displayed in IDR until an exchange rate is available.`,statuses:{pending:"Pending",pending_verification:"Pending verification",confirmed:"Confirmed",paid:"Paid",cancelled:"Cancelled",failed:"Failed",expired:"Expired",active:"Active"}},
    ar:{eyebrow:"المسافر",title:"حجوزاتي",description:"سجل حجوزات رحلاتك بالكامل.",code:"الرمز",package:"الباقة",travel:"شركة السفر",departure:"المغادرة",pax:"المسافرون",total:"الإجمالي",status:"الحالة",empty:"لا توجد حجوزات بعد",emptyDescription:"ستظهر الحجوزات التي تنشئها هنا.",currencyPending:(code:string)=>`تم اختيار ${code} · ستظل قيم المعاملات معروضة بالروبية الإندونيسية حتى يتوفر سعر الصرف.`,statuses:{pending:"قيد الانتظار",pending_verification:"بانتظار التحقق",confirmed:"مؤكد",paid:"مدفوع",cancelled:"ملغي",failed:"فشل",expired:"منتهي الصلاحية",active:"نشط"}}
  } as const;
  const t = copy[language];
  const displayDate = (value:string | null | undefined) => value ? new Intl.DateTimeFormat(locale,{day:"2-digit",month:"short",year:"numeric"}).format(new Date(value)) : "—";
  const displayNumber = (value:number) => new Intl.NumberFormat(locale).format(value);
  const displayPrice = (value:number | null | undefined) => value == null ? "—" : new Intl.NumberFormat(locale,{style:"currency",currency:"IDR",maximumFractionDigits:0}).format(value);
  const statusLabel = (status:string) => t.statuses[status as keyof typeof t.statuses] ?? status.replaceAll("_"," ");

  const user = await requireUser();
  const supabase = await createClient();
  const { data } = await supabase
    .from("bookings")
    .select("id, code, status, total_amount, pax_count, created_at, departures(departure_date, packages(name, organizations(name)))")
    .eq("traveler_user_id", user.id)
    .order("created_at", { ascending: false });

  const rows = data ?? [];
  const columns: Column<(typeof rows)[number]>[] = [
    { key: "code", header: t.code, render: (r) => <span className="font-mono text-xs">{r.code}</span> },
    { key: "package", header: t.package, render: (r: any) => r.departures?.packages?.name },
    { key: "travel", header: t.travel, render: (r: any) => r.departures?.packages?.organizations?.name },
    { key: "departure", header: t.departure, render: (r: any) => displayDate(r.departures?.departure_date) },
    { key: "pax", header: t.pax, render: (r) => displayNumber(r.pax_count) },
    { key: "total", header: t.total, render: (r) => displayPrice(r.total_amount) },
    { key: "status", header: t.status, render: (r) => <Badge status={r.status} label={statusLabel(r.status)} /> },
  ];

  return (
    <div lang={language} dir={language === "ar" ? "rtl" : "ltr"}>
      <PageHeader eyebrow={t.eyebrow} title={t.title} description={t.description} />
      {currency !== "IDR" && <p className="mb-4 text-xs font-semibold text-warning">{t.currencyPending(currency)}</p>}
      <DataTable
        columns={columns}
        rows={rows}
        getRowId={(r) => r.id}
        searchableText={(r: any) => `${r.code} ${r.departures?.packages?.name ?? ""}`}
        rowHref={(r) => `/akun/booking/${r.id}`}
        emptyTitle={t.empty}
        emptyDescription={t.emptyDescription}
      />
    </div>
  );
}
