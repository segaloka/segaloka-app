"use client";

import { useMemo, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import type { Database } from "@/lib/database.types";
import { Card, CardBody, CardHeader } from "@/components/ui/Card";
import { Input, Select, Textarea } from "@/components/ui/Field";


type Ad = Database["public"]["Tables"]["marketplace_ads"]["Row"];
type AdInsert = Database["public"]["Tables"]["marketplace_ads"]["Insert"];

type FormState = {
  travel_name: string;
  category: string;
  title: string;
  detail: string;
  price_text: string;
  href: string;
  icon: string;
  tone: "blue" | "yellow";
  image_url: string;
  active: boolean;
  sort_order: string;
  starts_at: string;
  ends_at: string;
};

const emptyForm: FormState = {
  travel_name: "",
  category: "",
  title: "",
  detail: "",
  price_text: "",
  href: "/paket/umrah",
  icon: "building",
  tone: "blue",
  image_url: "",
  active: false,
  sort_order: "0",
  starts_at: "",
  ends_at: "",
};

function toLocalInput(value: string | null) {
  if (!value) return "";
  const date = new Date(value);
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}T${pad(date.getHours())}:${pad(date.getMinutes())}`;
}

function toIso(value: string) {
  return value ? new Date(value).toISOString() : null;
}

function formFromAd(ad: Ad): FormState {
  return {
    travel_name: ad.travel_name,
    category: ad.category,
    title: ad.title,
    detail: ad.detail,
    price_text: ad.price_text,
    href: ad.href,
    icon: ad.icon,
    tone: ad.tone === "yellow" ? "yellow" : "blue",
    image_url: ad.image_url ?? "",
    active: ad.active,
    sort_order: String(ad.sort_order),
    starts_at: toLocalInput(ad.starts_at),
    ends_at: toLocalInput(ad.ends_at),
  };
}

export function MarketplaceAdsManager({ initialAds }: { initialAds: Ad[] }) {
  const supabase = useMemo(() => createClient(), []);
  const [ads, setAds] = useState(initialAds);
  const [form, setForm] = useState<FormState>(emptyForm);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  const reset = () => {
    setEditingId(null);
    setForm(emptyForm);
    setMessage(null);
  };

  const refresh = async () => {
    const { data, error } = await supabase
      .from("marketplace_ads")
      .select("*")
      .order("sort_order", { ascending: true })
      .order("created_at", { ascending: false });
    if (error) throw error;
    setAds(data ?? []);
  };

  const uploadImage = async (file: File) => {
    const allowed = ["image/jpeg", "image/png", "image/webp"];
    if (!allowed.includes(file.type)) throw new Error("Gunakan JPG, PNG, atau WebP.");
    if (file.size > 5 * 1024 * 1024) throw new Error("Ukuran gambar maksimal 5 MB.");

    setUploading(true);
    try {
      const extension = file.name.split(".").pop()?.toLowerCase() || "jpg";
      const path = `${crypto.randomUUID()}.${extension}`;
      const { error } = await supabase.storage.from("marketplace-ads").upload(path, file, {
        cacheControl: "3600",
        upsert: false,
        contentType: file.type,
      });
      if (error) throw error;
      const { data } = supabase.storage.from("marketplace-ads").getPublicUrl(path);
      setForm((current) => ({ ...current, image_url: data.publicUrl }));
      setMessage("Gambar berhasil diunggah.");
    } finally {
      setUploading(false);
    }
  };

  const save = async () => {
    setSaving(true);
    setMessage(null);
    try {
      const payload: AdInsert = {
        travel_name: form.travel_name.trim(),
        category: form.category.trim(),
        title: form.title.trim(),
        detail: form.detail.trim(),
        price_text: form.price_text.trim(),
        href: form.href.trim(),
        icon: form.icon,
        tone: form.tone,
        image_url: form.image_url.trim() || null,
        active: form.active,
        sort_order: Number(form.sort_order) || 0,
        starts_at: toIso(form.starts_at),
        ends_at: toIso(form.ends_at),
      };

      if (!payload.travel_name || !payload.category || !payload.title || !payload.detail || !payload.price_text || !payload.href) {
        throw new Error("Lengkapi field wajib terlebih dahulu.");
      }

      if (editingId) {
        const { error } = await supabase.from("marketplace_ads").update(payload).eq("id", editingId);
        if (error) throw error;
        setMessage("Iklan berhasil diperbarui.");
      } else {
        const { data: userData } = await supabase.auth.getUser();
        const { error } = await supabase.from("marketplace_ads").insert({
          ...payload,
          created_by: userData.user?.id ?? null,
        });
        if (error) throw error;
        setMessage("Iklan berhasil dibuat.");
      }

      await refresh();
      reset();
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Gagal menyimpan iklan.");
    } finally {
      setSaving(false);
    }
  };

  const remove = async (id: string) => {
    if (!window.confirm("Hapus iklan ini? Tindakan ini tidak dapat dibatalkan.")) return;
    const { error } = await supabase.from("marketplace_ads").delete().eq("id", id);
    if (error) {
      setMessage(error.message);
      return;
    }
    await refresh();
    if (editingId === id) reset();
    setMessage("Iklan dihapus.");
  };

  const toggle = async (ad: Ad) => {
    const { error } = await supabase.from("marketplace_ads").update({ active: !ad.active }).eq("id", ad.id);
    if (error) {
      setMessage(error.message);
      return;
    }
    await refresh();
  };

  return (
    <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_420px]">
      <Card>
        <CardHeader>
          <div>
            <p className="font-display text-sm font-bold text-text-primary">Iklan Marketplace</p>
            <p className="mt-0.5 text-xs text-muted">Konten yang aktif akan tampil otomatis di homepage Marketplace.</p>
          </div>
          <button type="button" onClick={reset} className="h-9 rounded-md border border-border-strong px-3 text-xs font-semibold text-text-primary hover:bg-bg">Iklan Baru</button>
        </CardHeader>
        <CardBody className="space-y-3">
          {ads.length === 0 ? (
            <div className="rounded-md border border-dashed border-border-strong p-8 text-center text-sm text-muted">Belum ada iklan. Buat iklan pertama dari form di sebelah kanan.</div>
          ) : ads.map((ad) => (
            <div key={ad.id} className="rounded-xl border border-border p-4">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div className="min-w-0">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="rounded-full bg-[#ffd94a] px-2 py-1 text-[10px] font-extrabold uppercase text-[#604800]">Iklan</span>
                    <span className="text-xs font-bold text-text-secondary">{ad.travel_name}</span>
                    <span className="text-[10px] font-bold uppercase text-primary">{ad.category}</span>
                    <span className={`rounded-full px-2 py-1 text-[10px] font-bold ${ad.active ? "bg-success-tint text-success" : "bg-bg text-muted"}`}>{ad.active ? "Aktif" : "Nonaktif"}</span>
                  </div>
                  <p className="mt-2 text-sm font-extrabold text-text-primary">{ad.title}</p>
                  <p className="mt-1 text-xs text-text-secondary">{ad.detail} · {ad.price_text}</p>
                </div>
                <div className="flex shrink-0 gap-2">
                  <button type="button" onClick={() => { setEditingId(ad.id); setForm(formFromAd(ad)); setMessage(null); }} className="h-9 rounded-md border border-border-strong px-3 text-xs font-semibold text-text-primary hover:bg-bg">Edit</button>
                  <button type="button" onClick={() => toggle(ad)} className="h-9 rounded-md border border-border-strong px-3 text-xs font-semibold text-text-primary hover:bg-bg">{ad.active ? "Nonaktifkan" : "Aktifkan"}</button>
                  <button type="button" onClick={() => remove(ad.id)} className="h-9 rounded-md border border-danger/30 px-3 text-xs font-semibold text-danger hover:bg-danger-tint">Hapus</button>
                </div>
              </div>
            </div>
          ))}
        </CardBody>
      </Card>

      <Card>
        <CardHeader>
          <div>
            <p className="font-display text-sm font-bold text-text-primary">{editingId ? "Edit Iklan" : "Buat Iklan"}</p>
            <p className="mt-0.5 text-xs text-muted">Atur konten card yang tampil di Marketplace.</p>
          </div>
        </CardHeader>
        <CardBody className="space-y-4">
          <Input value={form.travel_name} onChange={(e) => setForm({ ...form, travel_name: e.target.value })} placeholder="Nama Travel" />
          <Input value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })} placeholder="Kategori, mis. Umrah Oktober" />
          <Textarea value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} placeholder="Judul iklan" />
          <Input value={form.detail} onChange={(e) => setForm({ ...form, detail: e.target.value })} placeholder="Detail, mis. 9 hari · Jakarta · 18 Okt 2026" />
          <Input value={form.price_text} onChange={(e) => setForm({ ...form, price_text: e.target.value })} placeholder="Rp 28.900.000" />
          <Input value={form.href} onChange={(e) => setForm({ ...form, href: e.target.value })} placeholder="/paket/umrah" />
          <div className="grid gap-3 sm:grid-cols-2">
            <Select value={form.icon} onChange={(e) => setForm({ ...form, icon: e.target.value })}>
              <option value="building">Building</option>
              <option value="globe">Globe</option>
              <option value="route">Route</option>
            </Select>
            <Select value={form.tone} onChange={(e) => setForm({ ...form, tone: e.target.value as "blue" | "yellow" })}>
              <option value="blue">Blue</option>
              <option value="yellow">Yellow</option>
            </Select>
          </div>
          <Input type="number" min="0" value={form.sort_order} onChange={(e) => setForm({ ...form, sort_order: e.target.value })} placeholder="Urutan" />
          <div className="grid gap-3 sm:grid-cols-2">
            <label className="flex flex-col gap-1.5 text-xs font-semibold text-text-secondary"><span>Mulai tayang</span><Input type="datetime-local" value={form.starts_at} onChange={(e) => setForm({ ...form, starts_at: e.target.value })} /></label>
            <label className="flex flex-col gap-1.5 text-xs font-semibold text-text-secondary"><span>Berakhir</span><Input type="datetime-local" value={form.ends_at} onChange={(e) => setForm({ ...form, ends_at: e.target.value })} /></label>
          </div>
          <div className="rounded-lg border border-dashed border-border-strong p-3">
            <p className="text-xs font-semibold text-text-primary">Materi gambar</p>
            <p className="mt-1 text-xs text-muted">Opsional. JPG, PNG, WebP maksimal 5 MB.</p>
            <input className="mt-3 block w-full text-xs" type="file" accept="image/jpeg,image/png,image/webp" disabled={uploading} onChange={(e) => { const file = e.target.files?.[0]; if (!file) return; uploadImage(file).catch((error) => setMessage(error instanceof Error ? error.message : "Upload gagal.")); }} />
            {form.image_url && <p className="mt-2 break-all text-[11px] text-text-secondary">{form.image_url}</p>}
          </div>
          <label className="flex items-center gap-2 text-sm font-semibold text-text-primary"><input type="checkbox" checked={form.active} onChange={(e) => setForm({ ...form, active: e.target.checked })} /> Publikasikan sekarang</label>
          {message && <p role="alert" className="rounded-md bg-bg px-3 py-2 text-xs text-text-secondary">{message}</p>}
          <div className="flex gap-2">
            <button type="button" onClick={reset} className="h-10 rounded-md border border-border-strong px-4 text-xs font-semibold text-text-primary hover:bg-bg">Batal</button>
            <button type="button" disabled={saving || uploading} onClick={save} className="h-10 rounded-md bg-primary px-4 text-xs font-bold text-primary-fg hover:bg-primary-hover disabled:opacity-60">{saving ? "Menyimpan…" : "Simpan Iklan"}</button>
          </div>
        </CardBody>
      </Card>
    </div>
  );
}
