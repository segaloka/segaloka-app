import type { Metadata } from 'next';

import { AppProvider } from '@/components/app-provider';

import './globals.css';
import './control-center-shell.css';

export const metadata: Metadata = {
  title: 'Segaloka Control Center',
  description:
    'Administration and ecosystem control center for Segaloka'
};

export default function RootLayout({
  children
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      data-locale="id"
      data-theme="light"
      data-theme-preference="system"
      dir="ltr"
      lang="id"
      suppressHydrationWarning
    >
      <body>
        <AppProvider>{children}</AppProvider>
      </body>
    </html>
  );
}
