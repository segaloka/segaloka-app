import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { requireUser } from "@/lib/auth";
import { PageHeader } from "@/components/layout/PageHeader";
import { Card, CardBody, CardHeader } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { formatDate, formatIDR } from "@/lib/utils";
import { PaymentProof } from "./PaymentProof";

export default async function BookingDetailPage({ params }: { params: { id: string } }) {
  const user = await requireUser();
  const supabase = await createClient();

  const { data: booking } = await supabase
    .from("bookings")
    .select("*, departures(departure_date, packages(name, organizations(name, bank_info))), booking_passengers(*), invoices(*)")
    .eq("id", params.id)
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
  const invoice = (booking.invoices as any[])?.[0];
  const bank = org?.bank_info ?? {};

  return (
    <div>
      <PageHeader eyebrow={`Booking ${booking.code}`} title={pkg?.name ?? "Booking"} actions={<Badge status={booking.status} />} />

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="space-y-6 lg:col-span-2">
          <Card>
            <CardHeader><p className="font-display font-bold text-text-primary">Detail Perjalanan</p></CardHeader>
            <CardBody className="grid gap-3 sm:grid-cols-2 text-sm">
              <div><p className="text-xs text-muted">Travel</p><p className="font-semibold text-text-primary">{org?.name}</p></div>
              <div><p className="text-xs text-muted">Tanggal Berangkat</p><p className="font-semibold text-text-primary">{formatDate((booking.departures as any)?.departure_date)}</p></div>
              <div><p className="text-xs text-muted">Jumlah Jamaah</p><p className="font-semibold text-text-primary">{booking.pax_count} orang</p></div>
              <div><p className="text-xs text-muted">Total Tagihan</p><p className="font-semibold text-text-primary">{formatIDR(booking.total_amount)}</p></div>
            </CardBody>
          </Card>

          <Card>
            <CardHeader><p className="font-display font-bold text-text-primary">Data Jamaah</p></CardHeader>
            <CardBody className="space-y-2">
              {(booking.booking_passengers as any[]).map((p, i) => (
                <div key={p.id} className="flex items-center justify-between rounded-md border border-border px-3 py-2 text-sm">
                  <span className="text-text-primary">{i + 1}. {p.full_name}</span>
                  {p.passport_number && <span className="text-xs text-muted">{p.passport_number}</span>}
                </div>
              ))}
            </CardBody>
          </Card>
        </div>

        <div className="space-y-6">
          <Card>
            <CardHeader><p className="font-display font-bold text-text-primary">Pembayaran</p></CardHeader>
            <CardBody className="space-y-4">
              {invoice && (
                <div className="rounded-md bg-bg px-3 py-2.5 text-sm">
                  <div className="flex justify-between"><span className="text-text-secondary">No. Invoice</span><span className="font-mono text-xs">{invoice.number}</span></div>
                  <div className="mt-1 flex justify-between"><span className="text-text-secondary">Status</span><Badge status={invoice.status} /></div>
                  <div className="mt-1 flex justify-between"><span className="text-text-secondary">Jatuh Tempo</span><span>{formatDate(invoice.due_date)}</span></div>
                </div>
              )}

              {invoice?.status !== "paid" && (
                <>
                  <div className="rounded-md border border-border px-3 py-2.5 text-xs text-text-secondary">
                    <p className="font-semibold text-text-primary">Transfer Manual</p>
                    {bank?.bank_name ? (
                      <>
                        <p className="mt-1">{bank.bank_name} — {bank.account_number}</p>
                        <p>a.n. {bank.account_name}</p>
                      </>
                    ) : (
                      <p className="mt-1">Travel belum melengkapi rekening pembayaran. Hubungi Travel secara langsung.</p>
                    )}
                  </div>
                  <PaymentProof bookingId={booking.id} userId={user.id} existing={docs ?? []} />
                </>
              )}
            </CardBody>
          </Card>
        </div>
      </div>
    </div>
  );
}
