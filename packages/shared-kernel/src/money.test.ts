import { describe, expect, it } from 'vitest';

import {
  addMoney,
  createMoney,
  equalsMoney,
  isNegativeMoney,
  isPositiveMoney,
  isZeroMoney,
  negateMoney,
  subtractMoney,
  zeroMoney
} from './money.js';

describe('Money', () => {
  it('creates money using bigint minor units', () => {
    const money = createMoney(100_000n, 'IDR');

    expect(money.amountMinor).toBe(100_000n);
    expect(money.currency).toBe('IDR');
  });

  it('creates zero money', () => {
    expect(zeroMoney('IDR')).toEqual({
      amountMinor: 0n,
      currency: 'IDR'
    });
  });

  it('adds values with the same currency', () => {
    const left = createMoney(100_000n, 'IDR');
    const right = createMoney(50_000n, 'IDR');

    expect(addMoney(left, right)).toEqual({
      amountMinor: 150_000n,
      currency: 'IDR'
    });
  });

  it('subtracts values with the same currency', () => {
    const left = createMoney(100_000n, 'IDR');
    const right = createMoney(25_000n, 'IDR');

    expect(subtractMoney(left, right)).toEqual({
      amountMinor: 75_000n,
      currency: 'IDR'
    });
  });

  it('rejects arithmetic across different currencies', () => {
    const rupiah = createMoney(100_000n, 'IDR');
    const dollar = createMoney(100n, 'USD');

    expect(() => addMoney(rupiah, dollar)).toThrow('Currency mismatch: IDR !== USD');
  });

  it('negates money without changing its currency', () => {
    expect(negateMoney(createMoney(100n, 'USD'))).toEqual({
      amountMinor: -100n,
      currency: 'USD'
    });
  });

  it('checks zero, positive, and negative values', () => {
    expect(isZeroMoney(createMoney(0n, 'SAR'))).toBe(true);
    expect(isPositiveMoney(createMoney(1n, 'SAR'))).toBe(true);
    expect(isNegativeMoney(createMoney(-1n, 'SAR'))).toBe(true);
  });

  it('compares both amount and currency', () => {
    expect(equalsMoney(createMoney(100n, 'USD'), createMoney(100n, 'USD'))).toBe(true);

    expect(equalsMoney(createMoney(100n, 'USD'), createMoney(100n, 'SAR'))).toBe(false);
  });
});
