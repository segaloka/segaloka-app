import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { requireUser, getMyMemberships, getProfile } from "@/lib/auth";
import { PageHeader } from "@/components/layout/PageHeader";
import { Card, CardBody } from "@/components/ui/Card";
import { EmptyState } from "@/components/ui/EmptyState";
import { Badge } from "@/components/ui/Badge";
import { LinkButton } from "@/components/ui/Button";
import { cookies } from "next/headers";

export default async function AkunHomePage() {
  const cookieStore = cookies();
  const storedLanguage = cookieStore.get("segaloka-language")?.value;
  const language = storedLanguage === "en" || storedLanguage === "ar" ? storedLanguage : "id";
  const locale = language === "en" ? "en-US" : language === "ar" ? "ar-SA" : "id-ID";
  const copy = {
    id:{eyebrow:"Traveler",hello:"Halo",traveler:"Traveler",description:"Ringkasan booking, permintaan SegaDeals, dan aktivitas akun Anda.",staff:"Anda juga tergabung sebagai staff Travel",staffDescription:"Beralih ke dashboard operasional Travel Anda.",recent:"Booking Terbaru",all:"Lihat semua",noBooking:"Belum ada booking",noBookingDescription:"Jelajahi paket Umrah, Haji, atau Halal Tour dan buat booking pertama Anda.",explore:"Jelajahi Paket",requests:"Permintaan SegaDeals",noRequest:"Belum ada permintaan",noRequestDescription:"Sampaikan kebutuhan perjalanan Anda dan terima penawaran dari banyak Travel.",requestDeal:"Ajukan SegaDeals",flexible:"Tujuan fleksibel",business:"Punya bisnis Travel?",businessDescription:"Daftarkan Travel Anda dan kelola paket, booking, hingga keuangan dalam satu dashboard.",registerTravel:"Daftarkan Travel",statuses:{pending:"Menunggu",pending_verification:"Menunggu verifikasi",confirmed:"Dikonfirmasi",paid:"Lunas",cancelled:"Dibatalkan",failed:"Gagal",expired:"Kedaluwarsa",active:"Aktif",open:"Terbuka",offered:"Ada penawaran",accepted:"Diterima",closed:"Ditutup"}},
    en:{eyebrow:"Traveler",hello:"Hello",traveler:"Traveler",description:"A summary of your bookings, SegaDeals requests, and account activity.",staff:"You are also a Travel staff member",staffDescription:"Switch to your Travel operations dashboard.",recent:"Recent Bookings",all:"View all",noBooking:"No bookings yet",noBookingDescription:"Explore Umrah, Hajj, or Halal Tour packages and create your first booking.",explore:"Explore Packages",requests:"SegaDeals Requests",noRequest:"No requests yet",noRequestDescription:"Tell us what trip you need and receive offers from multiple Travel operators.",requestDeal:"Request SegaDeals",flexible:"Flexible destination",business:"Run a Travel business?",businessDescription:"Register your Travel business and manage packages, bookings, and finances from one dashboard.",registerTravel:"Register Travel",statuses:{pending:"Pending",pending_verification:"Pending verification",confirmed:"Confirmed",paid:"Paid",cancelled:"Cancelled",failed:"Failed",expired:"Expired",active:"Active",open:"Open",offered:"Offers received",accepted:"Accepted",closed:"Closed"}},
    ar:{eyebrow:"المسافر",hello:"مرحباً",traveler:"المسافر",description:"ملخص حجوزاتك وطلبات SegaDeals ونشاط حسابك.",staff:"أنت أيضاً ضمن فريق شركة سفر",staffDescription:"انتقل إلى لوحة عمليات شركة السفر الخاصة بك.",recent:"أحدث الحجوزات",all:"عرض الكل",noBooking:"لا توجد حجوزات بعد",noBookingDescription:"استكشف باقات العمرة أو الحج أو الجولات الحلال وأنشئ حجزك الأول.",explore:"استكشف الباقات",requests:"طلبات SegaDeals",noRequest:"لا توجد طلبات بعد",noRequestDescription:"أرسل احتياجات رحلتك واحصل على عروض من عدة شركات سفر.",requestDeal:"طلب SegaDeals",flexible:"وجهة مرنة",business:"لديك شركة سفر؟",businessDescription:"سجل شركة السفر وأدر الباقات والحجوزات والشؤون المالية من لوحة واحدة.",registerTravel:"تسجيل شركة سفر",statuses:{pending:"قيد الانتظار",pending_verification:"بانتظار التحقق",confirmed:"مؤكد",paid:"مدفوع",cancelled:"ملغي",failed:"فشل",expired:"منتهي الصلاحية",active:"نشط",open:"مفتوح",offered:"تم استلام عروض",accepted:"مقبول",closed:"مغلق"}}
  } as const;
  const t = copy[language];
  const displayDate = (value:string | null | undefined) => value ? new Intl.DateTimeFormat(locale,{day:"2-digit",month:"short",year:"numeric"}).format(new Date(value)) : "—";
  const statusLabel = (status:string) => t.statuses[status as keyof typeof t.statuses] ?? status.replaceAll("_"," ");

  const user = await requireUser();
  const profile = await getProfile();
  const supabase = await createClient();
  const memberships = await getMyMemberships();

  const { data: bookings } = await supabase
    .from("bookings")
    .select("id, code, status, total_amount, departures(departure_date, packages(name))")
    .eq("traveler_user_id", user.id)
    .order("created_at", { ascending: false })
    .limit(5);

  const { data: requests } = await supabase
    .from("segadeals_requests")
    .select("id, status, type, destination")
    .eq("traveler_user_id", user.id)
    .order("created_at", { ascending: false })
    .limit(5);

  return (
    <div lang={language} dir={language === "ar" ? "rtl" : "ltr"}>
      <PageHeader
        eyebrow={t.eyebrow}
        title={`${t.hello}, ${profile?.full_name?.split(" ")[0] || t.traveler}`}
        description={t.description}
      />

      {memberships.length > 0 && (
        <Card className="mb-6">
          <CardBody className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <p className="text-sm font-semibold text-text-primary">{t.staff}</p>
              <p className="text-xs text-text-secondary">{t.staffDescription}</p>
            </div>
            <div className="flex flex-wrap gap-2">
              {memberships.filter((m:any)=>m.organizations).map((m:any)=>(
                <LinkButton key={m.id} href={`/dashboard/${m.organizations.slug}`} variant="outline" size="sm">{m.organizations.name}</LinkButton>
              ))}
            </div>
          </CardBody>
        </Card>
      )}

      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <div className="flex items-center justify-between gap-3 border-b border-border px-5 py-4">
            <p className="font-display font-bold text-text-primary">{t.recent}</p>
            <Link href="/akun/booking" className="shrink-0 text-xs font-semibold text-primary hover:underline">{t.all}</Link>
          </div>
          <CardBody>
            {!bookings || bookings.length === 0 ? (
              <EmptyState title={t.noBooking} description={t.noBookingDescription} action={<LinkButton href="/paket/umrah" size="sm">{t.explore}</LinkButton>} />
            ) : (
              <div className="space-y-3">
                {bookings.map((b:any)=>(
                  <Link key={b.id} href={`/akun/booking/${b.id}`} className="flex flex-wrap items-center justify-between gap-3 rounded-md border border-border px-3 py-2.5 hover:border-primary/40">
                    <div className="min-w-0">
                      <p className="truncate text-sm font-semibold text-text-primary">{b.departures?.packages?.name}</p>
                      <p className="text-xs text-text-secondary">{b.code} · {displayDate(b.departures?.departure_date)}</p>
                    </div>
                    <Badge status={b.status} label={statusLabel(b.status)} />
                  </Link>
                ))}
              </div>
            )}
          </CardBody>
        </Card>

        <Card>
          <div className="flex items-center justify-between gap-3 border-b border-border px-5 py-4">
            <p className="font-display font-bold text-text-primary">{t.requests}</p>
            <Link href="/akun/segadeals" className="shrink-0 text-xs font-semibold text-primary hover:underline">{t.all}</Link>
          </div>
          <CardBody>
            {!requests || requests.length === 0 ? (
              <EmptyState title={t.noRequest} description={t.noRequestDescription} action={<LinkButton href="/akun/segadeals/baru" size="sm">{t.requestDeal}</LinkButton>} />
            ) : (
              <div className="space-y-3">
                {requests.map((r)=>(
                  <Link key={r.id} href={`/akun/segadeals/${r.id}`} className="flex flex-wrap items-center justify-between gap-3 rounded-md border border-border px-3 py-2.5 hover:border-primary/40">
                    <div className="min-w-0">
                      <p className="text-sm font-semibold capitalize text-text-primary">{r.type.replaceAll("_"," ")}</p>
                      <p className="truncate text-xs text-text-secondary">{r.destination || t.flexible}</p>
                    </div>
                    <Badge status={r.status} label={statusLabel(r.status)} />
                  </Link>
                ))}
              </div>
            )}
          </CardBody>
        </Card>
      </div>

      <Card className="mt-6">
        <CardBody className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <p className="text-sm font-semibold text-text-primary">{t.business}</p>
            <p className="text-xs text-text-secondary">{t.businessDescription}</p>
          </div>
          <LinkButton href="/onboarding" variant="secondary" size="sm">{t.registerTravel}</LinkButton>
        </CardBody>
      </Card>
    </div>
  );
}
