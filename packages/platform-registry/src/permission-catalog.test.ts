import { describe, expect, it } from 'vitest';

import { PERMISSION_CATALOG, PERMISSION_REGISTRY } from './permission-catalog.js';
import {
  canAssignPermissionToTenant,
  getPermission,
  isScopeAllowedForPermission,
  requirePermission
} from './permission-registry.js';

describe('canonical permission catalog', () => {
  it('registers only the package publication authorization intent', () => {
    expect(PERMISSION_CATALOG.map((permission) => permission.key)).toEqual(['package.publish']);
    expect(PERMISSION_REGISTRY.permissions).toEqual(PERMISSION_CATALOG);
    expect(PERMISSION_REGISTRY.byKey.size).toBe(1);
  });

  it('restricts package publication to tenant-scoped assignments', () => {
    const permission = requirePermission(PERMISSION_REGISTRY, 'package.publish');

    expect(canAssignPermissionToTenant(permission)).toBe(true);
    expect(permission.allowedScopes).toEqual(['TENANT']);
    expect(isScopeAllowedForPermission(permission, 'TENANT')).toBe(true);

    for (const scope of [
      'GLOBAL',
      'BRANCH',
      'OWN',
      'ASSIGNED',
      'RELATIONSHIP',
      'PUBLIC'
    ] as const) {
      expect(isScopeAllowedForPermission(permission, scope)).toBe(false);
    }
  });

  it('is immutable at the catalog and definition boundaries', () => {
    expect(Object.isFrozen(PERMISSION_CATALOG)).toBe(true);
    expect(Object.isFrozen(PERMISSION_REGISTRY.permissions)).toBe(true);

    const permission = requirePermission(PERMISSION_REGISTRY, 'package.publish');
    expect(Object.isFrozen(permission)).toBe(true);
    expect(Object.isFrozen(permission.allowedScopes)).toBe(true);
  });

  it('uses the canonical registry as the lookup authority', () => {
    expect(getPermission(PERMISSION_REGISTRY, 'package.publish')).toBe(PERMISSION_CATALOG[0]);

    expect(getPermission(PERMISSION_REGISTRY, 'booking.read')).toBeUndefined();
    expect(() => requirePermission(PERMISSION_REGISTRY, 'booking.read')).toThrow(
      'Unknown permission key: booking.read'
    );
  });
});
