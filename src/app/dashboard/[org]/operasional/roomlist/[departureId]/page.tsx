import { notFound } from "next/navigation";
import { getOrgBySlug, hasPermission } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import { PageHeader } from "@/components/layout/PageHeader";
import { EmptyState, ForbiddenState } from "@/components/ui/EmptyState";
import { formatDate } from "@/lib/utils";
import { RoomForm } from "./RoomForm";
import { AssignOccupantForm } from "./AssignOccupantForm";
import { removeRoomOccupantAction } from "../../actions";

export default async function RoomListDetailPage({ params }: { params: { org: string; departureId: string } }) {
  const org = await getOrgBySlug(params.org);
  if (!org) return null;
  const allowed = await hasPermission(org.id, "operations.manage");
  if (!allowed) return <ForbiddenState reason="Anda tidak memiliki izin operations.manage." />;

  const supabase = await createClient();
  const { data: departure } = await supabase
    .from("departures")
    .select("id, departure_date, packages!inner(name, org_id)")
    .eq("id", params.departureId)
    .eq("packages.org_id", org.id)
    .single();
  if (!departure) notFound();

  const [{ data: rooms }, { data: bookings }] = await Promise.all([
    supabase.from("rooms").select("*, room_occupants(id, booking_passenger_id, booking_passengers(full_name))").eq("departure_id", departure.id).order("created_at"),
    supabase.from("bookings").select("booking_passengers(id, full_name)").eq("departure_id", departure.id).in("status", ["confirmed", "completed"]),
  ]);

  const allPassengers = (bookings ?? []).flatMap((b: any) => b.booking_passengers ?? []);
  const assignedIds = new Set((rooms ?? []).flatMap((r: any) => r.room_occupants.map((o: any) => o.booking_passenger_id)));
  const unassigned = allPassengers.filter((p: any) => !assignedIds.has(p.id));
  const pkg = departure.packages as any;

  return (
    <div>
      <PageHeader eyebrow="Operasional" title={`Room List — ${pkg?.name}`} description={`Keberangkatan ${formatDate(departure.departure_date)} · ${unassigned.length} jamaah belum dialokasikan`} />

      <RoomForm orgSlug={params.org} departureId={departure.id} />

      <div className="mt-4">
        {!rooms || rooms.length === 0 ? (
          <EmptyState title="Belum ada kamar" description="Tambahkan kamar untuk mulai mengalokasikan jamaah." />
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {rooms.map((r: any) => (
              <div key={r.id} className="rounded-lg border border-border bg-surface p-4">
                <div className="flex items-center justify-between">
                  <p className="font-display text-sm font-bold text-text-primary">{r.hotel_name ?? "Hotel"} {r.room_number && `#${r.room_number}`}</p>
                  <span className="text-xs text-muted">{r.room_occupants.length}/{r.capacity}</span>
                </div>
                {r.room_type && <p className="text-xs text-muted">{r.room_type}</p>}
                <div className="mt-3 space-y-1.5">
                  {r.room_occupants.map((o: any) => (
                    <div key={o.id} className="flex items-center justify-between rounded-md bg-bg px-2.5 py-1.5 text-sm">
                      <span className="text-text-primary">{o.booking_passengers?.full_name}</span>
                      <form action={removeRoomOccupantAction}>
                        <input type="hidden" name="org_slug" value={params.org} />
                        <input type="hidden" name="departure_id" value={departure.id} />
                        <input type="hidden" name="occupant_id" value={o.id} />
                        <button className="text-xs text-danger hover:underline">Hapus</button>
                      </form>
                    </div>
                  ))}
                </div>
                {r.room_occupants.length < r.capacity && (
                  <div className="mt-2">
                    <AssignOccupantForm orgSlug={params.org} departureId={departure.id} roomId={r.id} unassigned={unassigned} />
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
