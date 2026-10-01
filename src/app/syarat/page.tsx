import type { Metadata } from "next";
import { PublicInfoPage } from "@/components/public/PublicInfoPage";

export const metadata: Metadata = {
  title: "Syarat dan Ketentuan",
};

export default function SyaratPage() {
  return (
    <PublicInfoPage
      eyebrow="Legal"
      title="Syarat dan Ketentuan Segaloka"
      description="Ketentuan ini menjelaskan kerangka penggunaan platform Segaloka. Ketentuan khusus Travel atau produk dapat berlaku secara terpisah pada transaksi terkait."
      sections={[
        {
          title: "Penggunaan Platform",
          paragraphs: [
            "Pengguna wajib memberikan informasi yang benar dan menggunakan akun serta layanan Segaloka secara sah dan bertanggung jawab.",
          ],
        },
        {
          title: "Produk dan Layanan Travel",
          paragraphs: [
            "Produk perjalanan disediakan oleh pihak yang tercantum pada produk atau transaksi. Ketentuan mengenai jadwal, fasilitas, pembayaran, perubahan, dan pembatalan dapat berbeda untuk setiap produk.",
          ],
        },
        {
          title: "Pembayaran",
          paragraphs: [
            "Nilai transaksi, tahap pembayaran, biaya yang berlaku, serta status pembayaran ditampilkan pada proses transaksi terkait.",
          ],
        },
        {
          title: "Perubahan Ketentuan",
          paragraphs: [
            "Ketentuan dapat diperbarui sesuai perkembangan layanan. Versi yang berlaku untuk suatu transaksi mengikuti ketentuan yang disajikan pada proses terkait.",
          ],
        },
      ]}
    />
  );
}