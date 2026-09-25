import type { Metadata } from "next";
import "./globals.css";
import { ThemeInit } from "@/components/layout/ThemeInit";
import { ToastProvider } from "@/components/ui/Toast";

export const metadata: Metadata = {
  title: {
    default: "Segaloka — Ekosistem Digital Umrah, Haji & Halal Tour",
    template: "%s · Segaloka",
  },
  description:
    "Segaloka menghubungkan jamaah, Travel, Vendor, Affiliate, dan Mitra dalam satu ekosistem digital Umrah, Haji, dan Halal Tour.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="id" suppressHydrationWarning>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link
          rel="stylesheet"
          href="https://fonts.googleapis.com/css2?family=Manrope:wght@600;700;800&family=IBM+Plex+Sans:wght@400;500;600;700&display=swap"
        />
        <ThemeInit />
      </head>
      <body>
        <ToastProvider>{children}</ToastProvider>
      </body>
    </html>
  );
}
