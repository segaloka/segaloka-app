export const SUPPORTED_CURRENCIES = ['IDR', 'USD', 'SAR'] as const;

export type Currency = (typeof SUPPORTED_CURRENCIES)[number];

export function isSupportedCurrency(value: string): value is Currency {
  return SUPPORTED_CURRENCIES.includes(value as Currency);
}

export function parseCurrency(value: string): Currency {
  const normalized = value.trim().toUpperCase();

  if (!isSupportedCurrency(normalized)) {
    throw new Error(`Unsupported currency: ${value}`);
  }

  return normalized;
}
