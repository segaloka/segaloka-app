import type { Metadata } from "next";
import { PublicInfoPage } from "@/components/public/PublicInfoPage";

export const metadata: Metadata = {
  title: "Tentang Segaloka",
};

export default function TentangPage() {
  return (
    <PublicInfoPage
      eyebrow="Tentang Segaloka"
      title="Satu ekosistem untuk perjalanan dan bisnis travel."
      description="Segaloka menghubungkan traveler, Travel, Vendor, Agen, Mitra, dan Affiliate dalam satu ekosistem digital perjalanan."
      sections={[
        {
          title: "Ekosistem Terhubung",
          paragraphs: [
            "Segaloka dirancang agar proses pencarian perjalanan, penjualan paket, pengelolaan pelanggan, kerja sama vendor, dan jaringan penjualan dapat berjalan dalam ekosistem yang saling terhubung.",
          ],
        },
        {
          title: "Untuk Traveler",
          items: [
            "Mencari dan membandingkan paket perjalanan.",
            "Mengelola booking dan informasi perjalanan.",
            "Menggunakan SegaDeals untuk menyampaikan kebutuhan perjalanan.",
          ],
        },
        {
          title: "Untuk Pelaku Usaha",
          items: [
            "Travel dapat mengelola produk, pelanggan, operasional, dan jaringan penjualan.",
            "Vendor dapat terhubung dengan kebutuhan Travel.",
            "Agen, Mitra, dan Affiliate dapat berpartisipasi sesuai hubungan dan kewenangannya.",
          ],
        },
      ]}
    />
  );
}