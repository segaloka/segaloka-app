import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { requireUser, getMyMemberships, getProfile } from "@/lib/auth";
import { PageHeader } from "@/components/layout/PageHeader";
import { Card, CardBody } from "@/components/ui/Card";
import { EmptyState } from "@/components/ui/EmptyState";
import { Badge } from "@/components/ui/Badge";
import { formatDate, formatIDR } from "@/lib/utils";
import { LinkButton } from "@/components/ui/Button";

export default async function AkunHomePage() {
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
    <div>
      <PageHeader
        eyebrow="Traveler"
        title={`Halo, ${profile?.full_name?.split(" ")[0] || "Traveler"}`}
        description="Ringkasan booking, permintaan SegaDeals, dan aktivitas akun Anda."
      />

      {memberships.length > 0 && (
        <Card className="mb-6">
          <CardBody className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <p className="text-sm font-semibold text-text-primary">Anda juga tergabung sebagai staff Travel</p>
              <p className="text-xs text-text-secondary">Beralih ke dashboard operasional Travel Anda.</p>
            </div>
            <div className="flex flex-wrap gap-2">
              {memberships
                .filter((m: any) => m.organizations)
                .map((m: any) => (
                  <LinkButton key={m.id} href={`/dashboard/${m.organizations.slug}`} variant="outline" size="sm">
                    {m.organizations.name}
                  </LinkButton>
                ))}
            </div>
          </CardBody>
        </Card>
      )}

      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <div className="flex items-center justify-between border-b border-border px-5 py-4">
            <p className="font-display font-bold text-text-primary">Booking Terbaru</p>
            <Link href="/akun/booking" className="text-xs font-semibold text-primary hover:underline">Lihat semua</Link>
          </div>
          <CardBody>
            {!bookings || bookings.length === 0 ? (
              <EmptyState
                title="Belum ada booking"
                description="Jelajahi paket Umrah, Haji, atau Halal Tour dan buat booking pertama Anda."
                action={<LinkButton href="/paket/umrah" size="sm">Jelajahi Paket</LinkButton>}
              />
            ) : (
              <div className="space-y-3">
                {bookings.map((b: any) => (
                  <Link key={b.id} href={`/akun/booking/${b.id}`} className="flex items-center justify-between rounded-md border border-border px-3 py-2.5 hover:border-primary/40">
                    <div>
                      <p className="text-sm font-semibold text-text-primary">{b.departures?.packages?.name}</p>
                      <p className="text-xs text-text-secondary">{b.code} · {formatDate(b.departures?.departure_date)}</p>
                    </div>
                    <Badge status={b.status} />
                  </Link>
                ))}
              </div>
            )}
          </CardBody>
        </Card>

        <Card>
          <div className="flex items-center justify-between border-b border-border px-5 py-4">
            <p className="font-display font-bold text-text-primary">Permintaan SegaDeals</p>
            <Link href="/akun/segadeals" className="text-xs font-semibold text-primary hover:underline">Lihat semua</Link>
          </div>
          <CardBody>
            {!requests || requests.length === 0 ? (
              <EmptyState
                title="Belum ada permintaan"
                description="Sampaikan kebutuhan perjalanan Anda dan terima penawaran dari banyak Travel."
                action={<LinkButton href="/akun/segadeals/baru" size="sm">Ajukan SegaDeals</LinkButton>}
              />
            ) : (
              <div className="space-y-3">
                {requests.map((r) => (
                  <Link key={r.id} href={`/akun/segadeals/${r.id}`} className="flex items-center justify-between rounded-md border border-border px-3 py-2.5 hover:border-primary/40">
                    <div>
                      <p className="text-sm font-semibold capitalize text-text-primary">{r.type.replace("_", " ")}</p>
                      <p className="text-xs text-text-secondary">{r.destination || "Tujuan fleksibel"}</p>
                    </div>
                    <Badge status={r.status} />
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
            <p className="text-sm font-semibold text-text-primary">Punya bisnis Travel?</p>
            <p className="text-xs text-text-secondary">Daftarkan Travel Anda dan kelola paket, booking, hingga keuangan dalam satu dashboard.</p>
          </div>
          <LinkButton href="/onboarding" variant="secondary" size="sm">Daftarkan Travel</LinkButton>
        </CardBody>
      </Card>
    </div>
  );
}
