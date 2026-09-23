# SEGALOKA Control Center

Dashboard Super Admin + 6 portal ekosistem (Travel, Vendor, Pengguna, Affiliate, Mitra Travel, Agen) untuk platform SEGALOKA.
Aplikasinya satu halaman HTML mandiri (vanilla JS, tanpa framework) yang tersambung ke Supabase (Postgres) secara realtime.

## Isi

| Area | Ringkasan |
|---|---|
| Shell | Sidebar 3 level (Group → Module → Submodule), ID / EN / AR (RTL), tema Terang / Gelap / Sistem, pencarian global (Ctrl K), notifikasi, simulasi permission |
| Admin | Overview, Approval Center, Ekosistem, Marketplace, Omnichannel, Ads & Promotion, Booking & Operasional, Keuangan, SaaS, Platform, Compliance & Security, Analytics, System (165 route) |
| Portal | Travel, Vendor, Aplikasi Pengguna (mobile), Affiliate, Mitra Travel, Agen, dengan mode "masuk sebagai" |
| Data | Schema `control_center` di Supabase (dibuat otomatis oleh halaman), audit log append-only, realtime antar-layar |

### Aturan bisnis yang dijaga
- Mitra Travel terikat ke tepat **satu** Travel. Agen berada di bawah Mitra (Travel → Mitra → Agen), dan ini dijaga oleh trigger database.
- Affiliate boleh bekerja dengan banyak Travel, dan terpisah dari Vendor maupun Mitra.
- Payment flow: `DIRECT_TO_TRAVEL` dan `VIA_SEGALOKA`.
- **Ads hanya tayang di Website Segaloka dan Aplikasi Segaloka.** Tidak ada platform iklan eksternal. Slot yang tersedia:
  - Web: Banner Beranda, Sponsored Pencarian, Halaman Kategori, Rekomendasi Detail Paket.
  - App: Banner Beranda, Sponsored Pencarian, Rekomendasi Paket, Notifikasi In-App.
  - Landing selalu di dalam Segaloka: halaman paket, profil Travel, chat in-app, atau form SegaDeals.
- **SegaDeals = permintaan dari pengguna → penawaran dari Travel.**
  1. Pengguna mengajukan permintaan: jenis, tujuan, bulan, pax, budget, catatan.
  2. Hanya Travel yang aktif dan izinnya sesuai yang bisa mengirim penawaran (Umrah → PPIU, Haji → PIHK, Tour/Halal Tour → BPW). Penawaran dibuat dari paket mereka yang sudah *published*.
  3. Pengguna memilih satu penawaran. Sistem lalu membuat booking (`source: SegaDeals`, total = harga × pax) dan tagihan DP 30% via VA, dan penawaran lain otomatis ditolak.
  4. Admin memantau dan memoderasi di Marketplace › SegaDeals: tutup permintaan, perpanjang, atau tarik penawaran. Admin **tidak** membuat deal.
- AI hanya merangkum atau menyarankan, dan tidak pernah menggantikan otorisasi.

## Struktur kode

```
build.sh           → menggabungkan semua file → segaloka-control-center.html
i18n.js            kamus ID/EN/AR + label status
data.js            data demo (seed), ditandai is_demo di database
core.js            state, permission, komponen, router, shell, tabel
pages_a..g.js      halaman admin
portals.js         6 portal ekosistem
segadeals.js       alur SegaDeals (pengguna ↔ Travel ↔ admin)
sync.js            sinkronisasi Supabase, realtime, migrasi data
boot.js            start
styles.css         design tokens (terang/gelap), layout responsif
migration.sql      schema control_center (v1 + v2 Agen)
tests/             E2E (Supabase/Postgres) + crawler yang mengklik semua aksi
```

## Build

```bash
bash build.sh        # menghasilkan segaloka-control-center.html
```

Catatan: path di `build.sh` diawali `cd /home/claude/sg`. Ubah ke folder repo Anda bila perlu.

## Tes

```bash
npm i -g playwright
# 1) Klik setiap tombol/aksi di semua route (mode lokal), laporkan error JS
node tests/crawl-all-actions.js
# 2) E2E dengan Postgres lokal (socket /tmp/pgd, port 55432) yang meniru connector Supabase:
#    migrasi data lama, SegaDeals end-to-end dua layar (realtime), wizard Ads
V5_HTML=path/ke/build-lama.html node tests/e2e-supabase.js
```

Hasil terakhir: crawler 165 route / ±3.600 klik tanpa error JS; E2E 25/25 lulus.

## Supabase

- Project: `lcfjqhnimbigwiqkrapm`, schema `control_center`. RLS aktif tanpa policy; akses `anon` dan `authenticated` dicabut.
- Halaman mengakses database lewat connector Supabase milik viewer, jadi tidak ada kunci di dalam kode.
- Saat halaman dibuka, migrasi data berjalan otomatis dan idempoten (misalnya memetakan channel iklan lama ke slot Segaloka).

## Batasan saat ini
- Portal masih berupa pratinjau "masuk sebagai". Untuk produksi, setiap portal perlu login sendiri (Supabase Auth) dan RLS per tenant.
- Simulasi role di UI bukan kontrol keamanan.
- Konflik tulis memakai prinsip *last-writer-wins*.
