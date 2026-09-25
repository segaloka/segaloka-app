import { notFound } from "next/navigation";
import { getOrgBySlug, hasPermission } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import { PageHeader } from "@/components/layout/PageHeader";
import { Card, CardBody, CardHeader } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { ForbiddenState } from "@/components/ui/EmptyState";
import { DocumentLink } from "@/components/ui/DocumentLink";
import { formatDate, formatIDR, formatDateTime } from "@/lib/utils";
import { BookingStatusForm } from "./BookingStatusForm";
import { verifyPaymentDocumentAction } from "./actions";

export default async function TravelBookingDetailPage({ params }: { params: { org: string; id: string } }) {
  const org = await getOrgBySlug(params.org);
  if (!org) return null;
  const canManage = await hasPermission(org.id, "booking.manage");
  const canView = canManage || (await hasPermission(org.id, "booking.create"));
  if (!canView) return <ForbiddenState reason="Anda tidak memiliki izin untuk melihat booking ini." />;
  const canPayment = await hasPermission(org.id, "payment.manage");

  const supabase = await createClient();
  const { data: booking } = await supabase
    .from("bookings")
    .select("*, departures(departure_date, packages(name)), booking_passengers(*), invoices(*)")
    .eq("id", params.id)
    .eq("org_id", org.id)
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
  const invoice = (booking.invoices as any[])?.[0];

  return (
    <div>
      <PageHeader
        eyebrow={`Booking ${booking.code}`}
        title={pkg?.name ?? booking.custom_package_name ?? "Booking SegaDeals"}
        actions={
          canManage ? (
            <BookingStatusForm orgSlug={params.org} bookingId={booking.id} status={booking.status} />
          ) : (
            <Badge status={booking.status} />
          )
        }
      />

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="space-y-6 lg:col-span-2">
          <Card>
            <CardHeader><p className="font-display font-bold text-text-primary">Detail Perjalanan</p></CardHeader>
            <CardBody className="grid gap-3 sm:grid-cols-2 text-sm">
              <div><p className="text-xs text-muted">Tanggal Berangkat</p><p className="font-semibold text-text-primary">{formatDate((booking.departures as any)?.departure_date ?? booking.custom_departure_date)}</p></div>
              <div><p className="text-xs text-muted">Jumlah Jamaah</p><p className="font-semibold text-text-primary">{booking.pax_count} orang</p></div>
              <div><p className="text-xs text-muted">Total Tagihan</p><p className="font-semibold text-text-primary">{formatIDR(booking.total_amount)}</p></div>
              <div><p className="text-xs text-muted">Dibuat</p><p className="font-semibold text-text-primary">{formatDateTime(booking.created_at)}</p></div>
              {booking.notes && <div className="sm:col-span-2"><p className="text-xs text-muted">Catatan</p><p className="text-text-secondary">{booking.notes}</p></div>}
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

              <div>
                <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-text-secondary">Bukti Transfer</p>
                {!docs || docs.length === 0 ? (
                  <p className="text-xs text-muted">Belum ada bukti transfer diunggah traveler.</p>
                ) : (
                  <div className="space-y-2">
                    {docs.map((d) => (
                      <div key={d.id} className="rounded-md border border-border px-3 py-2.5 text-sm">
                        <div className="flex items-center justify-between">
                          <DocumentLink path={d.file_url} name={d.file_name ?? "Bukti transfer"} />
                          <Badge status={d.status} />
                        </div>
                        <p className="mt-1 text-xs text-muted">{formatDateTime(d.created_at)}</p>
                        {canPayment && d.status === "uploaded" && (
                          <div className="mt-2 flex gap-2">
                            <form action={verifyPaymentDocumentAction}>
                              <input type="hidden" name="org_slug" value={params.org} />
                              <input type="hidden" name="booking_id" value={booking.id} />
                              <input type="hidden" name="doc_id" value={d.id} />
                              <input type="hidden" name="next_status" value="verified" />
                              <button className="h-8 rounded-md bg-success px-3 text-xs font-semibold text-white hover:opacity-90">Verifikasi</button>
                            </form>
                            <form action={verifyPaymentDocumentAction}>
                              <input type="hidden" name="org_slug" value={params.org} />
                              <input type="hidden" name="booking_id" value={booking.id} />
                              <input type="hidden" name="doc_id" value={d.id} />
                              <input type="hidden" name="next_status" value="rejected" />
                              <button className="h-8 rounded-md border border-danger/40 px-3 text-xs font-semibold text-danger hover:bg-danger-tint">Tolak</button>
                            </form>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </CardBody>
          </Card>
        </div>
      </div>
    </div>
  );
}
