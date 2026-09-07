import type { Currency } from './currency.js';

export interface Money {
  readonly amountMinor: bigint;
  readonly currency: Currency;
}

export function createMoney(amountMinor: bigint, currency: Currency): Money {
  return Object.freeze({
    amountMinor,
    currency
  });
}

export function zeroMoney(currency: Currency): Money {
  return createMoney(0n, currency);
}

export function addMoney(left: Money, right: Money): Money {
  assertSameCurrency(left, right);

  return createMoney(left.amountMinor + right.amountMinor, left.currency);
}

export function subtractMoney(left: Money, right: Money): Money {
  assertSameCurrency(left, right);

  return createMoney(left.amountMinor - right.amountMinor, left.currency);
}

export function negateMoney(money: Money): Money {
  return createMoney(-money.amountMinor, money.currency);
}

export function isZeroMoney(money: Money): boolean {
  return money.amountMinor === 0n;
}

export function isPositiveMoney(money: Money): boolean {
  return money.amountMinor > 0n;
}

export function isNegativeMoney(money: Money): boolean {
  return money.amountMinor < 0n;
}

export function equalsMoney(left: Money, right: Money): boolean {
  return left.currency === right.currency && left.amountMinor === right.amountMinor;
}

function assertSameCurrency(left: Money, right: Money): void {
  if (left.currency !== right.currency) {
    throw new Error(`Currency mismatch: ${left.currency} !== ${right.currency}`);
  }
}
