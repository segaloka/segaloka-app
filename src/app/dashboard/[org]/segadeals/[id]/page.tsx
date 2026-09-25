import { notFound } from "next/navigation";
import { getOrgBySlug, hasPermission } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import { PageHeader } from "@/components/layout/PageHeader";
import { Card, CardBody, CardHeader } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { ForbiddenState } from "@/components/ui/EmptyState";
import { formatDate, formatIDR } from "@/lib/utils";
import { OfferForm } from "./OfferForm";

const TYPE_LABEL: Record<string, string> = { umrah: "Umrah", haji: "Haji", halal_tour: "Halal Tour", tour: "Tour" };

export default async function SegaDealsRequestDetailPage({ params }: { params: { org: string; id: string } }) {
  const org = await getOrgBySlug(params.org);
  if (!org) return null;
  const allowed = await hasPermission(org.id, "segadeals.respond");
  if (!allowed) return <ForbiddenState reason="Anda tidak memiliki izin segadeals.respond." />;

  const supabase = await createClient();
  const { data: request } = await supabase.from("segadeals_requests").select("*").eq("id", params.id).single();
  if (!request) notFound();

  const { data: myOffer } = await supabase
    .from("segadeals_offers")
    .select("*")
    .eq("request_id", request.id)
    .eq("org_id", org.id)
    .maybeSingle();

  return (
    <div>
      <PageHeader eyebrow="SegaDeals" title={`Permintaan ${TYPE_LABEL[request.type] ?? request.type}`} actions={<Badge status={request.status} />} />

      <div className="grid gap-6 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardHeader><p className="font-display font-bold text-text-primary">Detail Permintaan Traveler</p></CardHeader>
          <CardBody className="grid gap-3 sm:grid-cols-2 text-sm">
            <div><p className="text-xs text-muted">Asal</p><p className="font-semibold text-text-primary">{request.origin_city ?? "—"}</p></div>
            <div><p className="text-xs text-muted">Tujuan</p><p className="font-semibold text-text-primary">{request.destination ?? "—"}</p></div>
            <div><p className="text-xs text-muted">Tanggal</p><p className="font-semibold text-text-primary">{formatDate(request.date_from)} {request.flex_days > 0 && `(±${request.flex_days} hari)`}</p></div>
            <div><p className="text-xs text-muted">Jumlah Jamaah</p><p className="font-semibold text-text-primary">{request.pax} pax</p></div>
            <div><p className="text-xs text-muted">Budget</p><p className="font-semibold text-text-primary">{request.budget_min ? formatIDR(request.budget_min) : "—"} – {request.budget_max ? formatIDR(request.budget_max) : "—"}</p></div>
            <div><p className="text-xs text-muted">Preferensi Hotel</p><p className="font-semibold text-text-primary">{request.hotel_pref ?? "—"}</p></div>
            <div><p className="text-xs text-muted">Preferensi Maskapai</p><p className="font-semibold text-text-primary">{request.airline_pref ?? "—"}</p></div>
            <div><p className="text-xs text-muted">Konfigurasi Kamar</p><p className="font-semibold text-text-primary">{request.room_config ?? "—"}</p></div>
            {request.additional_request && (
              <div className="sm:col-span-2"><p className="text-xs text-muted">Permintaan Tambahan</p><p className="text-text-secondary">{request.additional_request}</p></div>
            )}
          </CardBody>
        </Card>

        <Card>
          <CardHeader><p className="font-display font-bold text-text-primary">Penawaran Anda</p></CardHeader>
          <CardBody>
            {myOffer ? (
              <div className="space-y-2 text-sm">
                <div className="flex justify-between"><span className="text-text-secondary">Harga</span><span className="font-semibold text-text-primary">{formatIDR(myOffer.price)}</span></div>
                <div className="flex justify-between"><span className="text-text-secondary">Status</span><Badge status={myOffer.status} /></div>
                {myOffer.notes && <p className="text-text-secondary">{myOffer.notes}</p>}
              </div>
            ) : request.status === "closed" || request.status === "converted" || request.status === "expired" ? (
              <p className="text-sm text-muted">Permintaan ini sudah tidak menerima penawaran baru.</p>
            ) : (
              <OfferForm orgSlug={params.org} requestId={request.id} />
            )}
          </CardBody>
        </Card>
      </div>
    </div>
  );
}
