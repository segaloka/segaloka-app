import type { Metadata } from "next";
import { PublicInfoPage } from "@/components/public/PublicInfoPage";

export const metadata: Metadata = {
  title: "Kebijakan Refund",
};

export default function RefundPage() {
  return (
    <PublicInfoPage
      eyebrow="Perubahan Perjalanan"
      title="Kebijakan Pembatalan dan Refund"
      description="Ketentuan refund bergantung pada produk, Travel, komponen perjalanan, status pembayaran, waktu pengajuan, dan kebijakan yang berlaku pada booking."
      sections={[
        {
          title: "Pengajuan",
          paragraphs: [
            "Permintaan pembatalan, refund, atau perubahan perjalanan harus diajukan melalui kanal yang tersedia pada transaksi atau akun pengguna.",
          ],
        },
        {
          title: "Penilaian Permintaan",
          paragraphs: [
            "Nilai yang dapat dikembalikan dapat dipengaruhi biaya yang sudah terjadi, ketentuan penyedia layanan, komponen yang tidak dapat dikembalikan, dan kebijakan produk yang disetujui saat booking.",
          ],
        },
        {
          title: "Status dan Penyelesaian",
          paragraphs: [
            "Pengguna dapat memperoleh informasi status permintaan sesuai proses transaksi. Penyelesaian dilakukan setelah proses pemeriksaan dan rekonsiliasi yang diperlukan selesai.",
          ],
        },
      ]}
    />
  );
}