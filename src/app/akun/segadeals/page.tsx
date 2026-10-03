import { createClient } from "@/lib/supabase/server";
import { requireUser } from "@/lib/auth";
import { PageHeader } from "@/components/layout/PageHeader";
import { DataTable, type Column } from "@/components/ui/DataTable";
import { Badge } from "@/components/ui/Badge";
import { LinkButton } from "@/components/ui/Button";
import { cookies } from "next/headers";

export default async function SegaDealsListPage() {
  const cookieStore = cookies();
  const storedLanguage = cookieStore.get("segaloka-language")?.value;
  const language = storedLanguage === "en" || storedLanguage === "ar" ? storedLanguage : "id";
  const locale = language === "en" ? "en-US" : language === "ar" ? "ar-SA" : "id-ID";
  const copy = {
    id:{eyebrow:"Traveler",title:"SegaDeals Saya",description:"Permintaan perjalanan yang Anda ajukan ke jaringan Travel Segaloka.",newRequest:"Ajukan Baru",type:"Jenis",destination:"Tujuan",date:"Tanggal",pax:"Jamaah",status:"Status",flexible:"Fleksibel",empty:"Belum ada permintaan SegaDeals",emptyDescription:"Sampaikan kebutuhan perjalanan Anda sekali, terima penawaran dari banyak Travel.",types:{umrah:"Umrah",haji:"Haji",halal_tour:"Halal Tour",tour:"Tour"},statuses:{pending:"Menunggu",open:"Terbuka",offered:"Ada penawaran",accepted:"Diterima",closed:"Ditutup",cancelled:"Dibatalkan",expired:"Kedaluwarsa"}},
    en:{eyebrow:"Traveler",title:"My SegaDeals",description:"Travel requests you submitted to the Segaloka Travel network.",newRequest:"New Request",type:"Type",destination:"Destination",date:"Date",pax:"Travelers",status:"Status",flexible:"Flexible",empty:"No SegaDeals requests yet",emptyDescription:"Submit your travel needs once and receive offers from multiple Travel operators.",types:{umrah:"Umrah",haji:"Hajj",halal_tour:"Halal Tour",tour:"Tour"},statuses:{pending:"Pending",open:"Open",offered:"Offers received",accepted:"Accepted",closed:"Closed",cancelled:"Cancelled",expired:"Expired"}},
    ar:{eyebrow:"المسافر",title:"طلبات SegaDeals",description:"طلبات السفر التي أرسلتها إلى شبكة شركات السفر في Segaloka.",newRequest:"طلب جديد",type:"النوع",destination:"الوجهة",date:"التاريخ",pax:"المسافرون",status:"الحالة",flexible:"مرن",empty:"لا توجد طلبات SegaDeals بعد",emptyDescription:"أرسل احتياجات رحلتك مرة واحدة واحصل على عروض من عدة شركات سفر.",types:{umrah:"عمرة",haji:"حج",halal_tour:"جولة حلال",tour:"جولة سياحية"},statuses:{pending:"قيد الانتظار",open:"مفتوح",offered:"تم استلام عروض",accepted:"مقبول",closed:"مغلق",cancelled:"ملغي",expired:"منتهي الصلاحية"}}
  } as const;
  const t = copy[language];
  const displayDate = (value:string | null | undefined) => value ? new Intl.DateTimeFormat(locale,{day:"2-digit",month:"short",year:"numeric"}).format(new Date(value)) : "—";
  const displayNumber = (value:number) => new Intl.NumberFormat(locale).format(value);
  const typeLabel = (value:string) => t.types[value as keyof typeof t.types] ?? value.replaceAll("_"," ");
  const statusLabel = (value:string) => t.statuses[value as keyof typeof t.statuses] ?? value.replaceAll("_"," ");

  const user = await requireUser();
  const supabase = await createClient();
  const { data } = await supabase
    .from("segadeals_requests")
    .select("id, type, destination, date_from, pax, status, created_at")
    .eq("traveler_user_id", user.id)
    .order("created_at", { ascending: false });

  const rows = data ?? [];
  const columns: Column<(typeof rows)[number]>[] = [
    { key: "type", header: t.type, render: (r) => <span>{typeLabel(r.type)}</span> },
    { key: "destination", header: t.destination, render: (r) => r.destination || t.flexible },
    { key: "date", header: t.date, render: (r) => displayDate(r.date_from) },
    { key: "pax", header: t.pax, render: (r) => displayNumber(r.pax) },
    { key: "status", header: t.status, render: (r) => <Badge status={r.status} label={statusLabel(r.status)} /> },
  ];

  return (
    <div lang={language} dir={language === "ar" ? "rtl" : "ltr"}>
      <PageHeader eyebrow={t.eyebrow} title={t.title} description={t.description} actions={<LinkButton href="/akun/segadeals/baru">{t.newRequest}</LinkButton>} />
      <DataTable
        columns={columns}
        rows={rows}
        getRowId={(r) => r.id}
        rowHref={(r) => `/akun/segadeals/${r.id}`}
        emptyTitle={t.empty}
        emptyDescription={t.emptyDescription}
      />
    </div>
  );
}
