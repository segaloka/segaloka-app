import type { Locale } from '@/config/locales';

export const messages = {
  id: {
    overview: 'Overview',
    search: 'Cari travel, booking, transaksi...',
    production: 'Production',
    notifications: 'Notifikasi',
    superAdmin: 'Super Admin',
    platformOwner: 'Platform Owner',
    systemNormal: 'Semua sistem normal',
    systemChecked: 'Terakhir diperiksa 1 mnt lalu',
    navigation: 'Navigasi utama',
    expand: 'Buka',
    collapse: 'Tutup',
    planned: 'Direncanakan',
    active: 'Aktif',
    theme: 'Tema',
    language: 'Bahasa',
    light: 'Siang',
    dark: 'Malam',
    system: 'Sistem'
  },

  en: {
    overview: 'Overview',
    search: 'Search travel, bookings, transactions...',
    production: 'Production',
    notifications: 'Notifications',
    superAdmin: 'Super Admin',
    platformOwner: 'Platform Owner',
    systemNormal: 'All systems operational',
    systemChecked: 'Last checked 1 min ago',
    navigation: 'Main navigation',
    expand: 'Expand',
    collapse: 'Collapse',
    planned: 'Planned',
    active: 'Active',
    theme: 'Theme',
    language: 'Language',
    light: 'Light',
    dark: 'Dark',
    system: 'System'
  },

  ar: {
    overview: 'نظرة عامة',
    search: 'ابحث عن السفر والحجوزات والمعاملات...',
    production: 'الإنتاج',
    notifications: 'الإشعارات',
    superAdmin: 'المشرف العام',
    platformOwner: 'مالك المنصة',
    systemNormal: 'جميع الأنظمة تعمل بشكل طبيعي',
    systemChecked: 'آخر فحص قبل دقيقة',
    navigation: 'التنقل الرئيسي',
    expand: 'فتح',
    collapse: 'إغلاق',
    planned: 'مخطط',
    active: 'نشط',
    theme: 'المظهر',
    language: 'اللغة',
    light: 'نهاري',
    dark: 'ليلي',
    system: 'النظام'
  }
} as const;

export type MessageKey = keyof (typeof messages)['id'];

export function translate(
  locale: Locale,
  key: MessageKey
): string {
  return messages[locale][key];
}
