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
data.js            data contoh (hanya dipakai di mode ?demo)
datamode.js        mode produksi/demo, angka turunan dari data nyata (recompute, seri harian, saldo)
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

## Mode data

- **Produksi (default)**: tidak ada data rekaan. Semua entitas diisi lewat UI (Portal Travel/Vendor/Affiliate/Mitra/Agen/Pengguna atau Control Center) dan semua angka (GMV, revenue, saldo, komisi, SLA, FRT, grafik harian) dihitung dari transaksi di database.
- **Demo (`?demo` di URL)**: data contoh fiktif untuk presentasi. Mode ini tidak tersambung dan tidak pernah menulis ke database.
- Bila database masih berisi seed demo lama, dashboard menampilkan banner **Cadangkan & hapus data demo**. Pembersihan hanya berjalan setelah pemilik menekan tombol itu: baris demo disalin ke `control_center.demo_backup` lalu dihapus, dan konfigurasi tetap.

## Tes

```bash
npm i -g playwright
# 1) Semua route + klik setiap aksi; cek error JS, teks undefined/NaN, dan overflow horizontal
W=390 node tests/crawl-all-actions.js            # produksi, mobile
W=1440 Q='?demo' node tests/crawl-all-actions.js # demo, desktop
# 2) E2E produksi multi-layar dengan Postgres lokal (socket /tmp/pgd, port 55432) yang meniru connector Supabase:
#    seed lama -> konfirmasi pembersihan -> Travel daftar & diverifikasi -> paket dimoderasi -> pengguna booking + referral + bayar
#    -> angka turunan -> vendor diverifikasi, produk, order dari Travel, saldo vendor -> SegaDeals
V5_HTML=path/ke/build-lama.html W=390 node tests/e2e-production.js
```

Hasil terakhir: E2E produksi 34/34 lulus di 1440px dan 390px. Crawler tanpa error JS dan tanpa overflow di 360–1440px.

## Supabase

- Project: `lcfjqhnimbigwiqkrapm`, schema `control_center`. RLS aktif tanpa policy; akses `anon` dan `authenticated` dicabut.
- Halaman mengakses database lewat connector Supabase milik viewer, jadi tidak ada kunci di dalam kode.
- Saat halaman dibuka, migrasi data berjalan otomatis dan idempoten (misalnya memetakan channel iklan lama ke slot Segaloka).

## Batasan saat ini
- Pembayaran di aplikasi pengguna adalah simulasi sandbox sampai kredensial payment gateway (Midtrans/Xendit) dipasang. WhatsApp/Email broadcast dan penayangan iklan di website/aplikasi Segaloka juga butuh integrasi eksternal. Tanpa itu, status terkirim/tayang ditampilkan "—", bukan angka rekaan.
- Portal masih berupa pratinjau "masuk sebagai". Untuk produksi, setiap portal perlu login sendiri (Supabase Auth) dan RLS per tenant.
- Simulasi role di UI bukan kontrol keamanan.
- Konflik tulis memakai prinsip *last-writer-wins*.
