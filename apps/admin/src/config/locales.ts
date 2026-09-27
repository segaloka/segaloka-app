export const supportedLocales = ['id', 'en', 'ar'] as const;

export type Locale = (typeof supportedLocales)[number];

export const defaultLocale: Locale = 'id';

export const localeOptions: ReadonlyArray<{
  value: Locale;
  shortLabel: string;
  label: string;
  direction: 'ltr' | 'rtl';
}> = [
  {
    value: 'id',
    shortLabel: 'ID',
    label: 'Indonesia',
    direction: 'ltr'
  },
  {
    value: 'en',
    shortLabel: 'EN',
    label: 'English',
    direction: 'ltr'
  },
  {
    value: 'ar',
    shortLabel: 'AR',
    label: 'العربية',
    direction: 'rtl'
  }
];

export function isLocale(value: string | null): value is Locale {
  return supportedLocales.some((locale) => locale === value);
}

export function getLocaleDirection(locale: Locale): 'ltr' | 'rtl' {
  return locale === 'ar' ? 'rtl' : 'ltr';
}
