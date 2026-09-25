// Single source of truth for the Super Admin (Control Center) information
// architecture: 13 groups / 101 menu entries, matching the approved UI/UX
// design ("Segaloka UI/UX" canvas, board SA-00, and design/control-center.html).
//
// `built: true` means a real page exists under src/app/admin/…; every other
// entry is rendered by src/app/admin/[...slug]/page.tsx as a "coming soon"
// module page so the whole menu is navigable while pages are implemented.
//
// Rule: no WhatsApp / Instagram / Facebook channels — all communication
// happens inside Segaloka (Pesan aplikasi, web chat, email, push).

import type { IconName } from "@/components/layout/Icon";

export interface AdminNavLeaf {
  id: string;
  label: string;
  href: string;
  desc?: string;
  perm?: string;
  built?: boolean;
}
export interface AdminNavItem extends AdminNavLeaf {
  children?: AdminNavLeaf[];
}
export interface AdminNavGroup {
  id: string;
  label: string;
  icon: IconName;
  items: AdminNavItem[];
}

const L = (id: string, label: string, href: string, desc?: string, built?: boolean): AdminNavLeaf => ({ id, label, href, desc, built });

export const ADMIN_NAV: AdminNavGroup[] = [
  { id: "utama", label: "Utama", icon: "dashboard", items: [
    L("overview", "Overview", "/admin", "Kondisi seluruh ekosistem Segaloka secara realtime.", true),
    L("approval", "Approval Center", "/admin/approval", "Satu antrean untuk semua persetujuan: legalitas, vendor, paket, iklan, withdrawal, refund, perubahan rekening."),
  ] },
  { id: "ekosistem", label: "Ekosistem", icon: "building", items: [
    { ...L("travel", "Travel", "/admin/travel"), children: [
      L("travel_all", "Semua Travel", "/admin/travel", "Daftar tenant Travel, status, langganan dan kesehatan akun."),
      L("travel_branch", "Cabang Travel", "/admin/travel/cabang", "Semua cabang dari setiap Travel; kuota mengikuti paket langganan."),
      L("travel_legal", "Legalitas & Perizinan", "/admin/verifikasi", "Verifikasi izin PPIU/PIHK, NIB, akta dan rekening badan usaha.", true),
      L("travel_subs", "Subscription Travel", "/admin/travel/langganan", "Langganan SaaS per Travel: paket, trial, tagihan dan kuota."),
      L("travel_web", "Website Travel", "/admin/travel/website", "Halaman resmi setiap Travel. Nomor telepon & WhatsApp tidak boleh dicantumkan."),
    ] },
    { ...L("vendor", "Vendor", "/admin/vendor"), children: [
      L("vendor_all", "Semua Vendor", "/admin/vendor/semua", "Hotel, transportasi, katering, handling dan visa yang terhubung dengan Travel."),
      L("vendor_cat", "Kategori Vendor", "/admin/vendor/kategori", "Kategori dan atribut wajib per kategori."),
      L("vendor_verif", "Verifikasi Vendor", "/admin/vendor", "Tinjau lisensi & data layanan Vendor.", true),
      L("vendor_prod", "Produk & Layanan", "/admin/vendor/produk", "Katalog layanan & harga Vendor yang bisa dipesan Travel."),
    ] },
    { ...L("affiliate", "Affiliate", "/admin/affiliate"), children: [
      L("aff_all", "Semua Affiliate", "/admin/affiliate", "Affiliate lintas Travel, performa dan status."),
      L("aff_ref", "Referral", "/admin/affiliate/referral", "Klik & referral dari link Affiliate, termasuk deteksi klik palsu."),
      L("aff_com", "Komisi", "/admin/affiliate/komisi", "Komisi yang harus dibayar Travel ke Affiliate lewat sistem."),
      L("aff_perf", "Performance", "/admin/affiliate/performa", "Peringkat Affiliate berdasarkan booking & konversi."),
    ] },
    L("mitra", "Mitra Travel", "/admin/mitra", "Mitra terikat pada satu Travel dan membawahi Agen."),
    L("agen", "Agen", "/admin/agen", "Agen berada di bawah satu Mitra Travel."),
    L("traveler", "Traveler", "/admin/traveler", "Akun pembeli (jamaah) di website & aplikasi Segaloka."),
  ] },
  { id: "marketplace", label: "Marketplace", icon: "package", items: [
    L("mp_ov", "Overview Marketplace", "/admin/marketplace", "Paket tayang, konversi pencarian, harga pasar."),
    L("mp_pkg", "Paket Travel", "/admin/marketplace/paket", "Semua paket dari semua Travel."),
    L("mp_vprod", "Produk Vendor", "/admin/marketplace/produk-vendor", "Layanan Vendor yang ditampilkan ke Travel (B2B)."),
    L("segadeals", "SegaDeals", "/admin/marketplace/segadeals", "Permintaan jamaah yang ditawar Travel. Admin memantau, tidak membuat penawaran."),
    L("mp_cat", "Kategori", "/admin/marketplace/kategori", "Kategori & filter pencarian."),
    L("mp_mod", "Moderasi Produk", "/admin/marketplace/moderasi", "Paket & produk yang ditandai sistem atau dilaporkan."),
  ] },
  { id: "pesan", label: "Pesan & Omnichannel", icon: "message", items: [
    L("om_ov", "Overview", "/admin/pesan", "Semua komunikasi berjalan di dalam sistem & aplikasi Segaloka."),
    L("om_inbox", "Inbox", "/admin/pesan/inbox", "Percakapan masuk dari Jamaah, Travel, Vendor, Mitra, Agen & Affiliate."),
    L("om_conv", "Percakapan & Tiket", "/admin/pesan/tiket", "Tiket bantuan beserta prioritas, petugas dan SLA."),
    { ...L("om_chan", "Channel", "/admin/pesan/channel"), children: [
      L("om_app", "Pesan Aplikasi", "/admin/pesan/channel/aplikasi", "Chat di dalam aplikasi & dashboard. Nomor telepon disensor otomatis."),
      L("om_web", "Web Chat", "/admin/pesan/channel/web", "Widget chat di segaloka.com."),
      L("om_email", "Email", "/admin/pesan/channel/email", "Email bantuan & notifikasi."),
      L("om_push", "Push & Notifikasi", "/admin/pesan/channel/push", "Notifikasi push aplikasi & notifikasi dashboard."),
    ] },
    L("om_contact", "Kontak / Audiens", "/admin/pesan/kontak", "Segmen pengguna untuk broadcast in-app & email."),
    L("om_tpl", "Template Pesan", "/admin/pesan/template", "Template untuk aplikasi, email & push dalam 3 bahasa."),
    L("om_bc", "Broadcast", "/admin/pesan/broadcast", "Pengumuman massal ke segmen."),
    L("om_auto", "Otomasi", "/admin/pesan/otomasi", "Aturan otomatis berbasis event sistem."),
    L("om_route", "Routing & Penugasan", "/admin/pesan/routing", "Arahkan percakapan ke antrean & petugas."),
    L("om_sla", "SLA & Respons", "/admin/pesan/sla", "Target waktu respons & penyelesaian."),
    L("om_ana", "Analitik Pesan", "/admin/pesan/analitik", "Volume, topik & kepuasan percakapan."),
  ] },
  { id: "iklan", label: "Iklan & Promosi", icon: "tag", items: [
    L("ads_ov", "Overview Iklan", "/admin/iklan", "Iklan hanya tayang di website & aplikasi Segaloka."),
    L("ads_camp", "Kampanye", "/admin/iklan/kampanye"),
    L("ads_ads", "Iklan", "/admin/iklan/iklan"),
    L("ads_set", "Ad Set / Audiens", "/admin/iklan/audiens"),
    L("ads_cre", "Materi Iklan", "/admin/iklan/materi"),
    L("ads_plc", "Slot Tayang", "/admin/iklan/slot"),
    L("ads_bud", "Budget", "/admin/iklan/budget"),
    L("ads_vou", "Voucher & Promo", "/admin/iklan/voucher"),
    L("ads_trk", "Tracking", "/admin/iklan/tracking", "Pelacakan event di dalam platform (tanpa piksel pihak ketiga)."),
    L("ads_conv", "Konversi", "/admin/iklan/konversi"),
    L("ads_attr", "Atribusi", "/admin/iklan/atribusi"),
    L("ads_perf", "Performa Iklan", "/admin/iklan/performa"),
  ] },
  { id: "booking", label: "Booking & Operasional", icon: "plane", items: [
    L("booking", "Booking", "/admin/booking", "Semua booking di Segaloka."),
    L("manifest", "Manifest", "/admin/booking/manifest"),
    L("roomlist", "Room List", "/admin/booking/room-list"),
    L("pkginfo", "Paket Info", "/admin/booking/paket-info", "Standar info wajib di setiap paket."),
    L("opsdoc", "Dokumen Operasional", "/admin/booking/dokumen"),
  ] },
  { id: "keuangan", label: "Keuangan", icon: "wallet", items: [
    L("fin_ov", "Overview Keuangan", "/admin/finance", "Uang jamaah → rekening penampung → Travel → komisi jaringan.", true),
    L("fin_tx", "Transaksi", "/admin/keuangan/transaksi"),
    L("fin_pg", "Payment Gateway", "/admin/keuangan/gateway"),
    L("fin_set", "Settlement", "/admin/keuangan/settlement", "DP & pelunasan dirilis H-30, sisa H+3 kepulangan (usulan, perlu konfirmasi)."),
    L("fin_wd", "Withdrawal", "/admin/keuangan/withdrawal"),
    L("fin_dep", "Deposit Travel", "/admin/keuangan/deposit"),
    L("fin_ref", "Refund & Komplain", "/admin/keuangan/refund"),
    L("fin_rec", "Rekonsiliasi", "/admin/keuangan/rekonsiliasi"),
    L("fin_fee", "Fee & Komisi", "/admin/keuangan/fee"),
  ] },
  { id: "saas", label: "SaaS & Langganan", icon: "chart", items: [
    L("sub", "Subscription", "/admin/saas/langganan"),
    L("plan", "Plan & Pricing", "/admin/subscription", "Starter / Growth / Scale.", true),
    L("addon", "Add-on", "/admin/saas/addon"),
    L("website", "Website Travel", "/admin/saas/website"),
    L("crm", "CRM", "/admin/saas/crm"),
  ] },
  { id: "platform", label: "Platform", icon: "users", items: [
    L("users", "User Management", "/admin/platform/pengguna"),
    L("roles", "Role & Permission", "/admin/platform/role"),
    L("notif", "Notifikasi", "/admin/platform/notifikasi"),
    L("ai", "Segaloka AI", "/admin/platform/ai"),
  ] },
  { id: "compliance", label: "Compliance & Keamanan", icon: "shield", items: [
    L("legal", "Legalitas", "/admin/compliance/legalitas"),
    L("audit", "Audit Log", "/admin/audit", "Jejak semua perubahan penting.", true),
    L("security", "Keamanan", "/admin/compliance/keamanan"),
    L("risk", "Risiko & Fraud", "/admin/compliance/risiko"),
  ] },
  { id: "analytics", label: "Analytics", icon: "chart", items: [
    L("an_exec", "Executive", "/admin/analitik"),
    L("an_mp", "Marketplace", "/admin/analitik/marketplace"),
    L("an_travel", "Travel", "/admin/analitik/travel"),
    L("an_vendor", "Vendor", "/admin/analitik/vendor"),
    L("an_fin", "Keuangan", "/admin/analitik/keuangan"),
    L("an_omni", "Pesan", "/admin/analitik/pesan"),
    L("an_ads", "Iklan", "/admin/analitik/iklan"),
    L("an_camp", "Kampanye", "/admin/analitik/kampanye"),
    L("an_conv", "Konversi & Atribusi", "/admin/analitik/konversi"),
    L("an_growth", "Growth", "/admin/analitik/growth"),
  ] },
  { id: "system", label: "System", icon: "settings", items: [
    L("sys_cfg", "Konfigurasi", "/admin/pengaturan", "Pengaturan umum platform.", true),
    L("sys_brand", "Brand & Tampilan", "/admin/sistem/brand"),
    L("sys_lang", "Bahasa & Lokalisasi", "/admin/sistem/bahasa", "Indonesia, English, العربية (kanan-ke-kiri)."),
    L("sys_cur", "Mata Uang", "/admin/sistem/mata-uang", "IDR, SAR, USD."),
    L("sys_pay", "Konfigurasi Pembayaran", "/admin/sistem/pembayaran"),
    L("sys_ncfg", "Konfigurasi Notifikasi", "/admin/sistem/notifikasi", "Event → aplikasi, email, push (tanpa WhatsApp)."),
    L("sys_flag", "Feature Flags", "/admin/sistem/flags"),
    L("sys_int", "Integrasi & API", "/admin/sistem/integrasi"),
    L("sys_health", "Kesehatan Sistem", "/admin/sistem/kesehatan"),
  ] },
];

export function allAdminLeaves(): (AdminNavLeaf & { group: AdminNavGroup; parent?: AdminNavItem })[] {
  const out: (AdminNavLeaf & { group: AdminNavGroup; parent?: AdminNavItem })[] = [];
  for (const g of ADMIN_NAV) for (const it of g.items) {
    if (it.children) for (const c of it.children) out.push({ ...c, group: g, parent: it });
    else out.push({ ...it, group: g });
  }
  return out;
}

export function findAdminLeafByHref(href: string) {
  return allAdminLeaves().find((l) => l.href === href);
}
