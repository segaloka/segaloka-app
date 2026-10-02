import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { requireUser } from "@/lib/auth";
import { PageHeader } from "@/components/layout/PageHeader";
import { Card, CardBody, CardHeader } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { cookies } from "next/headers";
import { PaymentProof } from "./PaymentProof";

export default async function BookingDetailPage({ params }: { params: { id: string } }) {
  const cookieStore = cookies();
  const storedLanguage = cookieStore.get("segaloka-language")?.value;
  const storedCurrency = cookieStore.get("segaloka-currency")?.value;
  const language = storedLanguage === "en" || storedLanguage === "ar" ? storedLanguage : "id";
  const currency = storedCurrency === "USD" || storedCurrency === "MYR" || storedCurrency === "SGD" || storedCurrency === "SAR" ? storedCurrency : "IDR";
  const locale = language === "en" ? "en-US" : language === "ar" ? "ar-SA" : "id-ID";
  const copy = {
    id:{booking:"Booking",trip:"Detail Perjalanan",travel:"Travel",departure:"Tanggal Berangkat",travelers:"Jumlah Jamaah",people:"orang",total:"Total Tagihan",travelerData:"Data Jamaah",payment:"Pembayaran",invoice:"No. Invoice",status:"Status",due:"Jatuh Tempo",manual:"Transfer Manual",account:"a.n.",missingBank:"Travel belum melengkapi rekening pembayaran. Hubungi Travel melalui Segaloka.",baseCurrency:"Harga transaksi · IDR",currencyPending:(code:string)=>`Pilihan ${code} aktif · transaksi tetap ditampilkan dalam IDR sampai kurs tersedia.`},
    en:{booking:"Booking",trip:"Trip Details",travel:"Travel",departure:"Departure Date",travelers:"Number of Travelers",people:"travelers",total:"Total Amount",travelerData:"Traveler Details",payment:"Payment",invoice:"Invoice No.",status:"Status",due:"Due Date",manual:"Manual Transfer",account:"Account name",missingBank:"The Travel operator has not added a payment account yet. Contact the Travel operator through Segaloka.",baseCurrency:"Transaction currency · IDR",currencyPending:(code:string)=>`${code} is selected · the transaction remains displayed in IDR until an exchange rate is available.`},
    ar:{booking:"الحجز",trip:"تفاصيل الرحلة",travel:"شركة السفر",departure:"تاريخ المغادرة",travelers:"عدد المسافرين",people:"مسافر",total:"إجمالي المبلغ",travelerData:"بيانات المسافرين",payment:"الدفع",invoice:"رقم الفاتورة",status:"الحالة",due:"تاريخ الاستحقاق",manual:"تحويل بنكي يدوي",account:"اسم الحساب",missingBank:"لم تضف شركة السفر حساب الدفع بعد. تواصل مع شركة السفر عبر Segaloka.",baseCurrency:"عملة المعاملة · IDR",currencyPending:(code:string)=>`تم اختيار ${code} · ستظل المعاملة معروضة بالروبية الإندونيسية حتى يتوفر سعر الصرف.`}
  } as const;
  const t = copy[language];
  const displayDate = (value:string | null | undefined) => value ? new Intl.DateTimeFormat(locale,{day:"2-digit",month:"short",year:"numeric"}).format(new Date(value)) : "—";
  const displayNumber = (value:number) => new Intl.NumberFormat(locale).format(value);
  const displayPrice = (value:number | null | undefined) => value == null ? "—" : new Intl.NumberFormat(locale,{style:"currency",currency:"IDR",maximumFractionDigits:0}).format(value);
  const user = await requireUser();
  const supabase = await createClient();

  const { data: booking } = await supabase
    .from("bookings")
    .select("*, departures(departure_date, packages(name, organizations(name, bank_info))), booking_passengers(*), invoices(*)")
    .eq("id", params.id)
    .eq("traveler_user_id", user.id)
    .single();

  if (!booking) notFound();

  const { data: docs } = await supabase
    .from("documents")
    .select("id, file_url, file_name, status, created_at")
    .eq("owner_type", "booking")
    .eq("owner_id", booking.id)
    .eq("category", "bukti_transfer")
    .order("created_at", { ascending: false });

  const pkg = (booking.departures as any)?.packages;
  const org = pkg?.organizations;
  const invoices = [...(((booking.invoices as any[]) ?? []))].sort(
    (a, b) =>
      new Date(b.created_at ?? 0).getTime() -
      new Date(a.created_at ?? 0).getTime(),
  );
  const invoice = invoices[0];
  const bank = org?.bank_info ?? {};

  return (
    <div lang={language} dir={language === "ar" ? "rtl" : "ltr"}>
      <PageHeader eyebrow={`${t.booking} ${booking.code}`} title={pkg?.name ?? t.booking} actions={<Badge status={booking.status} />} />

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="space-y-6 lg:col-span-2">
          <Card>
            <CardHeader><p className="font-display font-bold text-text-primary">{t.trip}</p></CardHeader>
            <CardBody className="grid gap-3 sm:grid-cols-2 text-sm">
              <div><p className="text-xs text-muted">{t.travel}</p><p className="font-semibold text-text-primary">{org?.name}</p></div>
              <div><p className="text-xs text-muted">{t.departure}</p><p className="font-semibold text-text-primary">{displayDate((booking.departures as any)?.departure_date)}</p></div>
              <div><p className="text-xs text-muted">{t.travelers}</p><p className="font-semibold text-text-primary">{displayNumber(booking.pax_count)} {t.people}</p></div>
              <div><p className="text-xs text-muted">{t.total}</p><p className="font-semibold text-text-primary">{displayPrice(booking.total_amount)}</p></div>
            </CardBody>
          </Card>

          <Card>
            <CardHeader><p className="font-display font-bold text-text-primary">{t.travelerData}</p></CardHeader>
            <CardBody className="space-y-2">
              {(booking.booking_passengers as any[]).map((p, i) => (
                <div key={p.id} className="flex items-center justify-between rounded-md border border-border px-3 py-2 text-sm">
                  <span className="text-text-primary">{displayNumber(i + 1)}. {p.full_name}</span>
                  {p.passport_number && <span className="text-xs text-muted">{p.passport_number}</span>}
                </div>
              ))}
            </CardBody>
          </Card>
        </div>

        <div className="space-y-6">
          <Card>
            <CardHeader><p className="font-display font-bold text-text-primary">{t.payment}</p></CardHeader>
            <CardBody className="space-y-4">
              {invoice && (
                <div className="rounded-md bg-bg px-3 py-2.5 text-sm">
                  <div className="flex justify-between"><span className="text-text-secondary">{t.invoice}</span><span className="font-mono text-xs">{invoice.number}</span></div>
                  <div className="mt-1 flex justify-between"><span className="text-text-secondary">{t.status}</span><Badge status={invoice.status} /></div>
                  <div className="mt-1 flex justify-between"><span className="text-text-secondary">{t.due}</span><span>{displayDate(invoice.due_date)}</span></div>
                </div>
              )}

              {invoice?.status !== "paid" && (
                <>
                  <div className="rounded-md border border-border px-3 py-2.5 text-xs text-text-secondary">
                    <p className="font-semibold text-text-primary">{t.manual}</p>
                    {bank?.bank_name ? (
                      <>
                        <p className="mt-1">{bank.bank_name} — {bank.account_number}</p>
                        <p>{t.account}: {bank.account_name}</p>
                      </>
                    ) : (
                      <p className="mt-1">{t.missingBank}</p>
                    )}
                  </div>
                  <PaymentProof bookingId={booking.id} userId={user.id} existing={docs ?? []} language={language} />
                </>
              )}
            {currency !== "IDR" && <p className="mt-3 text-xs font-semibold text-warning">{t.currencyPending(currency)}</p>}<p className="mt-1 text-[10px] font-semibold text-muted">{t.baseCurrency}</p></CardBody>
          </Card>
        </div>
      </div>
    </div>
  );
}
