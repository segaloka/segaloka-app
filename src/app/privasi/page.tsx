import type { Metadata } from "next";
import { PublicInfoPage } from "@/components/public/PublicInfoPage";

export const metadata: Metadata = {
  title: "Kebijakan Privasi",
};

export default function PrivasiPage() {
  return (
    <PublicInfoPage
      eyebrow="Privasi"
      title="Kebijakan Privasi Segaloka"
      description="Segaloka memproses data yang diperlukan untuk menyediakan akun, transaksi, perjalanan, dukungan, keamanan, dan pengoperasian layanan."
      sections={[
        {
          title: "Data yang Digunakan",
          items: [
            "Informasi akun dan profil yang diberikan pengguna.",
            "Informasi booking, perjalanan, pembayaran, dan aktivitas layanan.",
            "Data teknis yang diperlukan untuk keamanan dan pengoperasian platform.",
          ],
        },
        {
          title: "Tujuan Pemrosesan",
          items: [
            "Menyediakan dan mengelola layanan yang diminta pengguna.",
            "Memproses transaksi dan kebutuhan operasional perjalanan.",
            "Menjaga keamanan, audit, dan integritas platform.",
          ],
        },
        {
          title: "Akses Data",
          paragraphs: [
            "Akses terhadap data dibatasi berdasarkan kebutuhan layanan, peran, kewenangan, serta hubungan pengguna dengan transaksi atau organisasi terkait.",
          ],
        },
      ]}
    />
  );
}