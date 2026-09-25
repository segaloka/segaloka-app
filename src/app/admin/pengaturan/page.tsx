import { createClient } from "@/lib/supabase/server";
import { isPlatformAdmin } from "@/lib/auth";
import { PageHeader } from "@/components/layout/PageHeader";
import { EmptyState, ForbiddenState } from "@/components/ui/EmptyState";
import { formatDateTime } from "@/lib/utils";
import { SettingForm } from "./SettingForm";

export default async function AdminSettingsPage() {
  const admin = await isPlatformAdmin();
  if (!admin) return <ForbiddenState reason="Hanya Super Admin yang dapat mengakses pengaturan platform." />;

  const supabase = await createClient();
  const { data: settings } = await supabase.from("platform_settings").select("*").order("key");

  return (
    <div>
      <PageHeader
        eyebrow="Konfigurasi"
        title="Pengaturan Platform"
        description="Seluruh aturan bisnis platform (fee, deposit minimum, batas, jadwal settlement, dsb) dikonfigurasi di sini — tidak di-hardcode di kode aplikasi."
      />

      <p className="mb-4 font-display text-sm font-bold text-text-primary">Tambah / Ubah Setting</p>
      <SettingForm />

      <div className="mt-8">
        <p className="mb-3 font-display text-sm font-bold text-text-primary">Setting Aktif</p>
        {!settings || settings.length === 0 ? (
          <EmptyState title="Belum ada setting tersimpan" description="Tambahkan setting pertama menggunakan form di atas." />
        ) : (
          <div className="grid gap-4 lg:grid-cols-2">
            {settings.map((s) => (
              <div key={s.key} className="rounded-lg border border-border bg-surface p-4">
                <p className="font-mono text-sm font-semibold text-text-primary">{s.key}</p>
                {s.description && <p className="mt-0.5 text-xs text-muted">{s.description}</p>}
                <pre className="mt-2 overflow-x-auto rounded-md bg-bg p-2.5 text-xs text-text-secondary">{JSON.stringify(s.value, null, 2)}</pre>
                <p className="mt-2 text-xs text-muted">Diperbarui {formatDateTime(s.updated_at)}</p>
                <div className="mt-2">
                  <SettingForm setting={{ key: s.key, value: s.value, description: s.description }} />
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
