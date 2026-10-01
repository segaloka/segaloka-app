import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { requireUser } from "@/lib/auth";
import { PageHeader } from "@/components/layout/PageHeader";
import { Card, CardBody, CardHeader } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { EmptyState } from "@/components/ui/EmptyState";
import { formatDate, formatIDR } from "@/lib/utils";
import { OfferActions } from "./OfferActions";

export default async function SegaDealsDetailPage({ params }: { params: { id: string } }) {
  const user = await requireUser();
  const supabase = await createClient();

  const { data: req } = await supabase.from("segadeals_requests").select("*").eq("id", params.id).single();
  if (!req || req.traveler_user_id !== user.id) notFound();

  const { data: offers } = await supabase
    .from("segadeals_offers")
    .select("*, organizations(name, slug)")
    .eq("request_id", req.id)
    .order("price", { ascending: true });

  return (
    <div>
      <PageHeader
        eyebrow="SegaDeals"
        title={`${req.type.replace("_", " ")} — ${req.destination ?? "Tujuan fleksibel"}`}
        actions={<Badge status={req.status} />}
      />

      <div className="grid gap-6 lg:grid-cols-3">
        <Card className="lg:col-span-1">
          <CardHeader><p className="font-display font-bold text-text-primary">Detail Permintaan</p></CardHeader>
          <CardBody className="space-y-2 text-sm">
            <div className="flex justify-between"><span className="text-muted">Kota Asal</span><span>{req.origin_city ?? "—"}</span></div>
            <div className="flex justify-between"><span className="text-muted">Tanggal</span><span>{formatDate(req.date_from)}</span></div>
            <div className="flex justify-between"><span className="text-muted">Fleksibilitas</span><span>{req.flex_days} hari</span></div>
            <div className="flex justify-between"><span className="text-muted">Pax</span><span>{req.pax} orang</span></div>
            <div className="flex justify-between"><span className="text-muted">Budget</span><span>{formatIDR(req.budget_min)} – {formatIDR(req.budget_max)}</span></div>
            <div className="flex justify-between"><span className="text-muted">Hotel</span><span>{req.hotel_pref ?? "—"}</span></div>
            <div className="flex justify-between"><span className="text-muted">Maskapai</span><span>{req.airline_pref ?? "—"}</span></div>
            {req.additional_request && <p className="border-t border-border pt-2 text-text-secondary">{req.additional_request}</p>}
          </CardBody>
        </Card>

        <div className="space-y-4 lg:col-span-2">
          <p className="font-display font-bold text-text-primary">Penawaran Masuk ({offers?.length ?? 0})</p>
          {!offers || offers.length === 0 ? (
            <EmptyState title="Belum ada penawaran" description="Travel yang eligible akan mengirim penawaran ke sini. Anda akan mendapat notifikasi." />
          ) : (
            offers.map((o) => (
              <Card key={o.id}>
                <CardBody className="flex flex-wrap items-center justify-between gap-4">
                  <div>
                    <p className="font-display text-base font-bold text-text-primary">{(o.organizations as any)?.name}</p>
                    <p className="mt-1 text-sm text-text-secondary">{o.notes}</p>
                    {o.expires_at && <p className="mt-1 text-xs text-muted">Berlaku hingga {formatDate(o.expires_at)}</p>}
                  </div>
                  <div className="text-right">
                    <p className="font-display text-xl font-bold text-primary">{formatIDR(o.price)}</p>
                    <Badge status={o.status} />
                    {o.status === "pending" && ["open", "offered"].includes(req.status) && (
                      <div className="mt-2"><OfferActions offerId={o.id} requestId={req.id} /></div>
                    )}
                  </div>
                </CardBody>
              </Card>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
