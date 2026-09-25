"use client";

import { useFormState, useFormStatus } from "react-dom";
import { createSegaDealsRequestAction } from "./actions";
import { Input, Select, Textarea } from "@/components/ui/Field";
import { PageHeader } from "@/components/layout/PageHeader";
import { Card, CardBody } from "@/components/ui/Card";

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <button type="submit" disabled={pending} className="h-11 rounded-md bg-primary px-6 font-semibold text-primary-fg hover:bg-primary-hover disabled:opacity-60">
      {pending ? "Mengirim…" : "Kirim Permintaan"}
    </button>
  );
}

export default function NewSegaDealsPage() {
  const [state, formAction] = useFormState(createSegaDealsRequestAction, null);

  return (
    <div>
      <PageHeader eyebrow="SegaDeals" title="Ajukan Kebutuhan Perjalanan" description="Isi detail perjalanan Anda — permintaan ini akan dikirim ke Travel yang sesuai." />
      <Card className="max-w-2xl">
        <CardBody>
          <form action={formAction} className="space-y-4">
            <div>
              <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-text-secondary">Jenis Perjalanan</label>
              <Select name="type" required defaultValue="">
                <option value="" disabled>Pilih jenis</option>
                <option value="umrah">Umrah</option>
                <option value="haji">Haji</option>
                <option value="halal_tour">Halal Tour</option>
                <option value="tour">Tour</option>
              </Select>
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-text-secondary">Kota Keberangkatan</label>
                <Input name="origin_city" placeholder="cth. Jakarta" />
              </div>
              <div>
                <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-text-secondary">Tujuan</label>
                <Input name="destination" placeholder="cth. Makkah & Madinah" />
              </div>
            </div>
            <div className="grid gap-4 sm:grid-cols-3">
              <div>
                <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-text-secondary">Tanggal Mulai</label>
                <Input type="date" name="date_from" />
              </div>
              <div>
                <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-text-secondary">Tanggal Selesai</label>
                <Input type="date" name="date_to" />
              </div>
              <div>
                <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-text-secondary">Fleksibilitas (hari)</label>
                <Input type="number" name="flex_days" min={0} defaultValue={0} />
              </div>
            </div>
            <div className="grid gap-4 sm:grid-cols-3">
              <div>
                <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-text-secondary">Jumlah Pax</label>
                <Input type="number" name="pax" min={1} defaultValue={1} required />
              </div>
              <div>
                <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-text-secondary">Budget Min (Rp)</label>
                <Input type="number" name="budget_min" min={0} />
              </div>
              <div>
                <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-text-secondary">Budget Maks (Rp)</label>
                <Input type="number" name="budget_max" min={0} />
              </div>
            </div>
            <div className="grid gap-4 sm:grid-cols-3">
              <div>
                <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-text-secondary">Preferensi Hotel</label>
                <Input name="hotel_pref" placeholder="cth. Bintang 4, dekat Haram" />
              </div>
              <div>
                <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-text-secondary">Preferensi Maskapai</label>
                <Input name="airline_pref" placeholder="cth. Saudia" />
              </div>
              <div>
                <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-text-secondary">Konfigurasi Kamar</label>
                <Input name="room_config" placeholder="cth. 2 quad, 1 double" />
              </div>
            </div>
            <div>
              <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-text-secondary">Permintaan Tambahan</label>
              <Textarea name="additional_request" placeholder="Kebutuhan khusus lainnya" />
            </div>
            {state?.error && <p role="alert" className="rounded-md bg-danger-tint px-3 py-2 text-sm text-danger">{state.error}</p>}
            <SubmitButton />
          </form>
        </CardBody>
      </Card>
    </div>
  );
}
