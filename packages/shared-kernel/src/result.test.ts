import { describe, expect, it } from 'vitest';

import { err, isErr, isOk, ok } from './result.js';

describe('Result', () => {
  it('creates a successful result', () => {
    const result = ok('value');

    expect(result).toEqual({
      ok: true,
      value: 'value'
    });

    expect(isOk(result)).toBe(true);
    expect(isErr(result)).toBe(false);
  });

  it('creates a failed result', () => {
    const result = err('error');

    expect(result).toEqual({
      ok: false,
      error: 'error'
    });

    expect(isOk(result)).toBe(false);
    expect(isErr(result)).toBe(true);
  });
});
