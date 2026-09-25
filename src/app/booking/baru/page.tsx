import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { requireUser } from "@/lib/auth";
import { formatDate, formatIDR } from "@/lib/utils";
import { BookingForm } from "./BookingForm";
import { PublicNav } from "@/components/layout/PublicNav";

export default async function NewBookingPage({ searchParams }: { searchParams: { departure?: string } }) {
  await requireUser();
  if (!searchParams.departure) notFound();

  const supabase = await createClient();
  const { data: departure } = await supabase
    .from("departures")
    .select("*, packages(name, base_price, duration_days, organizations(name))")
    .eq("id", searchParams.departure)
    .single();

  if (!departure) notFound();
  const pkg = departure.packages as any;
  const remaining = departure.quota - departure.filled;

  return (
    <div className="min-h-screen bg-bg">
      <PublicNav />
      <div className="mx-auto max-w-2xl px-4 py-10">
        <p className="text-xs font-bold uppercase tracking-wider text-primary">Booking</p>
        <h1 className="mt-1 font-display text-2xl font-bold text-text-primary">{pkg.name}</h1>
        <p className="mt-1 text-sm text-text-secondary">
          {pkg.organizations?.name} · Berangkat {formatDate(departure.departure_date)} · {pkg.duration_days} hari · {formatIDR(pkg.base_price)}/pax
        </p>

        <div className="mt-6 rounded-xl border border-border bg-surface p-6 shadow-card">
          {remaining <= 0 ? (
            <p className="text-sm text-danger">Mohon maaf, jadwal ini sudah penuh.</p>
          ) : (
            <BookingForm departureId={departure.id} basePrice={pkg.base_price} maxPax={remaining} />
          )}
        </div>
      </div>
    </div>
  );
}
