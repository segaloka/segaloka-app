import { describe, expect, it } from 'vitest';

import { asCanonicalPrincipalId } from './canonical-principal-id.js';

describe('Canonical PrincipalId', () => {
  it('accepts a canonical UUID principal identifier', () => {
    const principalId = asCanonicalPrincipalId('550e8400-e29b-41d4-a716-446655440000');

    expect(principalId).toBe('550e8400-e29b-41d4-a716-446655440000');
  });

  it('normalizes surrounding whitespace before validation', () => {
    const principalId = asCanonicalPrincipalId('  550e8400-e29b-41d4-a716-446655440000  ');

    expect(principalId).toBe('550e8400-e29b-41d4-a716-446655440000');
  });

  it.each([
    '',
    '   ',
    'principal_01',
    'not-a-uuid',
    '550e8400-e29b-41d4-a716-44665544000',
    '550e8400-e29b-41d4-a716-446655440000-extra'
  ])('rejects a non-canonical principal identifier: %j', (value) => {
    expect(() => asCanonicalPrincipalId(value)).toThrow(
      'Canonical PrincipalId must be a valid UUID.'
    );
  });
});
