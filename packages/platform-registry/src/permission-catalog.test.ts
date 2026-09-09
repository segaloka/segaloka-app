import { describe, expect, it } from 'vitest';

import { PERMISSION_CATALOG, PERMISSION_REGISTRY } from './permission-catalog.js';

import { getPermission, requirePermission } from './permission-registry.js';

describe('canonical permission catalog', () => {
  it('starts with no speculative production permissions', () => {
    expect(PERMISSION_CATALOG).toEqual([]);
    expect(PERMISSION_REGISTRY.permissions).toEqual([]);
    expect(PERMISSION_REGISTRY.byKey.size).toBe(0);
  });

  it('is immutable at the catalog boundary', () => {
    expect(Object.isFrozen(PERMISSION_CATALOG)).toBe(true);
    expect(Object.isFrozen(PERMISSION_REGISTRY.permissions)).toBe(true);
  });

  it('uses the canonical registry as the lookup authority', () => {
    expect(getPermission(PERMISSION_REGISTRY, 'booking.read')).toBeUndefined();

    expect(() => requirePermission(PERMISSION_REGISTRY, 'booking.read')).toThrow(
      'Unknown permission key: booking.read'
    );
  });
});
