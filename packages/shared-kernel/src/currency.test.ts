import { describe, expect, it } from 'vitest';

import { SUPPORTED_CURRENCIES, isSupportedCurrency, parseCurrency } from './currency.js';

describe('Currency', () => {
  it('contains the currencies supported by the initial Segaloka platform', () => {
    expect(SUPPORTED_CURRENCIES).toEqual(['IDR', 'USD', 'SAR']);
  });

  it('recognizes supported currencies', () => {
    expect(isSupportedCurrency('IDR')).toBe(true);
    expect(isSupportedCurrency('USD')).toBe(true);
    expect(isSupportedCurrency('SAR')).toBe(true);
  });

  it('rejects unsupported currencies', () => {
    expect(isSupportedCurrency('EUR')).toBe(false);
  });

  it('normalizes currency input', () => {
    expect(parseCurrency(' idr ')).toBe('IDR');
  });

  it('throws when currency is unsupported', () => {
    expect(() => parseCurrency('EUR')).toThrow('Unsupported currency: EUR');
  });
});
