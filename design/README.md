# Segaloka — Panduan Desain UI/UX untuk Developer

Folder ini adalah **sumber kebenaran desain** Segaloka. Kode di `src/` harus mengikuti desain di sini.
Pembagian kerja: **desain UI/UX = Claude**, **implementasi/coding = ChatGPT (developer)**.

- Kanvas desain (lihat & klik semua layar, mode *Play*): artifact **"Segaloka UI/UX"** di claude.ai (pemilik repo harus membagikan link-nya lewat menu *Share*).
- `design/canvas/*.dc.html` = sumber setiap layar (HTML + style inline). Bisa dibaca langsung sebagai referensi ukuran, warna, teks, dan struktur. File ini butuh runtime kanvas untuk tampil sempurna — buka lewat kanvas, atau baca kodenya.
- `design/canvas/canvas.json` = daftar papan (judul, ukuran, posisi).
- `design/control-center.html` = **prototipe Super Admin lengkap yang bisa dibuka langsung di browser** (klik dua kali). 13 grup · 101 menu, tema terang/gelap, ID/EN/AR (RTL), simulasi izin & state (loading/kosong/error). Ini referensi perilaku Super Admin paling lengkap.

> Semua angka, nama Travel, harga dan nama orang di desain adalah **DATA CONTOH**. Ambil data asli dari Supabase.

---

## 1. Aturan bisnis yang WAJIB diikuti

1. **Tidak ada WhatsApp / telepon / Instagram / Facebook** untuk komunikasi Jamaah ↔ Travel ↔ Vendor. Semua komunikasi lewat **menu Pesan di sistem & aplikasi** (papan 13 `Messages`, SA `AdminOmniInbox`).
   - Nomor HP & link `wa.me`/`t.me` di pesan, foto paket, deskripsi dan iklan **disensor/ditolak** otomatis.
   - Kolom "No. HP" hanya untuk verifikasi akun, tidak ditampilkan publik.
2. **Iklan hanya tayang di website & aplikasi Segaloka** (tidak ada Meta/Google/TikTok Ads). Pemasang: Travel & Vendor terverifikasi.
3. **SegaDeals** = permintaan yang dibuat **jamaah**, lalu **Travel** mengirim penawaran. Admin hanya memantau.
4. Hirarki jaringan: **Travel → Mitra Travel → Agen**. Mitra hanya terikat ke **satu** Travel. Penjual lintas Travel = **Affiliate**.
5. Paket langganan (sesuai database): **Starter** (gratis, 1 cabang, 5 user) · **Growth** (Rp 499 rb/bln, 3 cabang, 20 user) · **Scale** (Rp 1,499 jt/bln, 10 cabang, tanpa batas user). Trial 14 hari.
6. Bahasa: **Indonesia (default), English, العربية**. Arab = tata letak **kanan-ke-kiri** sungguhan (`dir="rtl"`, pakai properti logis `ms-/me-/ps-/pe-/start/end`, ikon panah dibalik dengan `.flip-rtl`).
7. Tema: **Terang / Gelap / Sistem** (sudah ada `ThemeToggle` + `data-theme`).

### Usulan desain yang masih perlu dikonfirmasi pemilik
- Settlement ke Travel: DP & pelunasan dirilis **H-30** keberangkatan, sisa **H+3** kepulangan.
- Biaya transaksi 1,5% ke Travel; biaya layanan 0% ke jamaah; komisi Affiliate default 2%; komisi dibayar ≤ 14 hari setelah lunas.
- Settlement **ditahan otomatis** bila ada komplain aktif atau rekening Travel baru diganti.
- 6 role admin (Super Admin, Verifikator, Moderator, Finance, Support, Marketing) + izin baru: `content.moderate`, `finance.settle`, `support.handle`, `ads.manage`, `users.manage`, `audit.read`, `platform.settings` (belum ada di database).

---

## 2. Token desain (sudah dipasang di `src/app/globals.css`)

| Token | Terang | Gelap | Pakai untuk |
|---|---|---|---|
| `--color-primary` | `#0a66e0` | `#4d9bff` | Tombol utama, link, menu aktif |
| `--color-primary-hover` | `#0852b8` | `#74b1ff` | Hover |
| `--color-secondary` (CTA) | `#ff9f1c` (teks `#241400`) | `#ffb547` | **Satu** ajakan utama per layar: Cari, Pesan sekarang, Daftarkan Travel |
| Harga | `#e25d00` | `#ffb547` | Angka harga paket |
| `--color-background` | `#f3f6fb` | `#0b1220` | Latar halaman |
| `--color-surface` | `#ffffff` | `#111a2b` | Kartu, tabel |
| `--color-border` | `#e1e7f0` | `#22304a` | Garis |
| `--color-text-primary` | `#0f1b2d` | `#eef3fa` | Teks |
| `--color-text-secondary` | `#4a5870` | `#b6c2d6` | Keterangan |
| Sidebar Super Admin | `#0b1f3f` (navy) | — | Menu Control Center |

Status (latar / teks): Aktif/Sukses `#e4f3e4 / #0a6b0a` · Menunggu `#fdf0da / #8a5300` · Ditolak/Bahaya `#fbe7e7 / #a42424` · Info/Terbit `#e6f0fd / #0852b8` · Draf `#eef1f6 / #4a5870`.

**Huruf:** Plus Jakarta Sans (400–800) untuk Latin, IBM Plex Sans Arabic untuk Arab (sudah dipasang di `src/app/layout.tsx`).
Skala: Display 40/800 · Judul 28/700 · Subjudul 20/700 · Isi 16/400 · Kecil 14 · Label 12/700 kapital.

**Ukuran:** tombol & target sentuh min **44px**; sudut 8/12/20/28px; jarak kelipatan 4px; sidebar 264px; topbar 64–72px; kontras teks min 4.5:1.

---

## 3. Daftar layar → rute kode

### Fondasi & publik
| Papan | Layar | Rute |
|---|---|---|
| 01 `Main` | Fondasi desain (warna, huruf, tombol, form, kartu, menu, pemilih bahasa/tema) | — |
| 02 `Home` / 03 `HomeMobile` | Beranda publik (pencarian besar ala OTA, paket terbaru, SegaDeals, Travel terverifikasi) | `/` |
| 06 `Search` | Hasil pencarian + filter | `/paket/[type]` |
| 07 `PackageDetail` | Detail paket + kotak pemesanan | `/paket/detail/[slug]` |
| 08 `Checkout` | Booking: kontak, data jamaah (paspor), unggah dokumen, kode referral, DP/lunas | `/booking/baru` |
| 09 `PaymentMobile` | Pembayaran: hitung mundur, VA, QRIS, transfer manual | `/akun/booking/[id]` (bayar) |
| 10 `MyBookingMobile` | Booking saya: progres bayar, status, dokumen | `/akun/booking/[id]` |
| 11 `SegaDealsNew` | Ajukan SegaDeals | `/akun/segadeals/baru` |
| 12 `SegaDealsOffers` | Bandingkan penawaran | `/akun/segadeals/[id]` |
| 13 `Messages` | Pesan (chat dalam sistem) | `/pesan` (baru) + dashboard |

### Dashboard Travel
| Papan | Layar | Rute |
|---|---|---|
| 05 `TravelDashboard` | Ringkasan | `/dashboard/[org]` |
| T-01 `TravelPackageEditor` | Buat/ubah paket (7 langkah, pratinjau) | `/dashboard/[org]/produk/paket` |
| T-02 `TravelManifest` | Manifest + status dokumen | `/dashboard/[org]/operasional/manifest` |
| T-03 `TravelRoomList` | Room list (peringatan kamar campur) | `/dashboard/[org]/operasional/roomlist` |
| T-04 `TravelFinance` | Keuangan & ledger | `/dashboard/[org]/finance` |
| T-05 `TravelWebsite` | Website Travel (builder) | `/dashboard/[org]/website` |
| `TravelSidebar` | Komponen menu Travel | `src/app/dashboard/[org]/layout.tsx` |

### Ekosistem
| E-01 `VendorDashboard` | `/vendor` | E-02 `AffiliateDashboard` | `/affiliate` |
|---|---|---|---|
| E-03 `MitraDashboard` | `/mitra` | E-04 `AgenMobile` | `/agen` (baru, mobile-first) |

### Super Admin — Control Center (13 grup · 101 menu)
Menu lengkap **sudah di-coding** di `src/lib/admin-nav.ts` (satu sumber). Menu yang halamannya belum dibuat otomatis tampil lewat `src/app/admin/[...slug]/page.tsx` ("Modul sedang dikembangkan"). Untuk membangun satu modul: buat rute spesifiknya (mis. `src/app/admin/approval/page.tsx`) lalu set `built: true` di `admin-nav.ts`.

| Papan | Menu | Rute |
|---|---|---|
| SA-00 `AdminApp` | **Semua 101 menu** (isi, KPI, kolom tabel, status, aksi utama tiap modul ada di objek `S` di file ini) | semua `/admin/...` |
| 04 `AdminOverview` | Overview | `/admin` |
| SA-01 `AdminApproval` | Approval Center | `/admin/approval` |
| SA-02 `AdminVerifyTravel` | Legalitas & Perizinan | `/admin/verifikasi` |
| SA-03 `AdminTravels` | Semua Travel | `/admin/travel` |
| SA-04 `AdminVerifyVendor` | Verifikasi Vendor | `/admin/vendor` |
| SA-05 `AdminEcosystem` | Affiliate, Mitra & Agen | `/admin/affiliate` |
| SA-06 `AdminUsers` | Traveler | `/admin/traveler` |
| SA-07 `AdminModeration` | Moderasi Produk | `/admin/marketplace/moderasi` |
| SA-08 `AdminSegaDeals` | SegaDeals | `/admin/marketplace/segadeals` |
| SA-09 `AdminOmniInbox` | Inbox | `/admin/pesan/inbox` |
| SA-10 `AdminSupport` | Percakapan & Tiket | `/admin/pesan/tiket` |
| SA-11 `AdminAds` | Overview Iklan | `/admin/iklan` |
| SA-12 `AdminFinance` | Overview Keuangan & Settlement | `/admin/finance` |
| SA-13 `AdminDisputes` | Refund & Komplain | `/admin/keuangan/refund` |
| SA-14 `AdminPlans` | Plan & Pricing | `/admin/subscription` |
| SA-15 `AdminTeam` | Role & Permission | `/admin/platform/role` |
| SA-16 `AdminAudit` | Audit Log | `/admin/audit` |
| SA-17 `AdminAnalytics` | Executive Analytics | `/admin/analitik` |
| SA-18 `AdminHealth` | Kesehatan Sistem | `/admin/sistem/kesehatan` |
| SA-19 `AdminSettings` | Konfigurasi Pembayaran | `/admin/sistem/pembayaran` |

Pola halaman modul standar (semua menu lain): breadcrumb → judul + deskripsi + tombol Ekspor & aksi utama → 4 KPI → baris filter → tabel (kolom pertama tebal, kolom terakhir = pill status berwarna) → paginasi. Setiap tabel butuh state **loading, kosong, error, tanpa izin**.

---

## 4. Urutan implementasi yang disarankan
1. Perbaiki error TypeScript lama (lihat bagian 5) supaya `npm run build` lolos.
2. Tabel/kolom database yang dirujuk kode tapi belum ada.
3. Super Admin: Approval Center → Semua Travel → Moderasi → Keuangan/Settlement/Withdrawal → Inbox.
4. Pesan (chat dalam sistem) untuk semua peran — ini pengganti WhatsApp.
5. Alur jamaah: pencarian → detail → booking → bayar → booking saya → SegaDeals.
6. Dashboard Travel dalam, lalu Vendor / Affiliate / Mitra / Agen.
7. Pemilih bahasa ID/EN/AR + RTL (kamus sudah ada di `src/lib/i18n.ts`, belum dipakai halaman).

## 5. Temuan teknis saat review (untuk developer)
`tsc --noEmit` menunjukkan **21 error lama** (bukan dari perubahan desain) — `next build` akan gagal sampai ini dibereskan:
- Tabel **`wishlists`** tidak ada di `database.types.ts` / database → `WishlistButton.tsx`, `akun/favorit/*`, `paket/detail/[slug]`.
- Kolom **`organizations.bank_info`** tidak ada → `dashboard/[org]/settings/*`.
- Tipe `string | null` vs `string` di `onboarding/vendor/actions.ts`, `dashboard/[org]/team/actions.ts`.
- Beberapa error tipe di `dashboard/[org]/booking/*`, `akun/segadeals/[id]/actions.ts`.
Jalankan `npx supabase gen types` ulang (proyek `ftxmahrubwbzqikjrvvs`) setelah migrasi dilengkapi.
