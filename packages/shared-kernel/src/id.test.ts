import { describe, expect, it } from 'vitest';

import { asOpaqueId } from './id.js';

describe('OpaqueId', () => {
  it('creates an opaque ID from a non-empty string', () => {
    const id = asOpaqueId<'TravelId'>('travel_123');

    expect(id).toBe('travel_123');
  });

  it('trims surrounding whitespace', () => {
    const id = asOpaqueId<'TravelId'>('  travel_123  ');

    expect(id).toBe('travel_123');
  });

  it('rejects an empty value', () => {
    expect(() => asOpaqueId<'TravelId'>('   ')).toThrow('Opaque ID cannot be empty.');
  });
});
