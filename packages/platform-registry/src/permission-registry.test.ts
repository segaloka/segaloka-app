import { describe, expect, it } from 'vitest';

import { definePermission } from './authorization.js';
import {
  canAssignPermissionToTenant,
  createPermissionRegistry,
  getPermission,
  isScopeAllowedForPermission,
  requirePermission
} from './permission-registry.js';

const bookingRead = definePermission({
  key: 'booking.read',
  description: 'View bookings.',
  visibility: 'TENANT_ASSIGNABLE',
  allowedScopes: ['TENANT', 'BRANCH', 'OWN', 'ASSIGNED']
});

const platformAudit = definePermission({
  key: 'platform.audit',
  description: 'View platform audit records.',
  visibility: 'PLATFORM_ONLY',
  allowedScopes: ['GLOBAL']
});

describe('PermissionRegistry', () => {
  it('creates deterministic permission lookup by key', () => {
    const registry = createPermissionRegistry([bookingRead, platformAudit]);

    expect(getPermission(registry, 'booking.read')).toBe(bookingRead);

    expect(getPermission(registry, 'platform.audit')).toBe(platformAudit);
  });

  it('preserves registration order', () => {
    const registry = createPermissionRegistry([bookingRead, platformAudit]);

    expect(registry.permissions.map((permission) => permission.key)).toEqual([
      'booking.read',
      'platform.audit'
    ]);
  });

  it('rejects duplicate permission keys', () => {
    expect(() => createPermissionRegistry([bookingRead, bookingRead])).toThrow(
      'Duplicate permission key: booking.read'
    );
  });

  it('returns undefined for an unknown permission', () => {
    const registry = createPermissionRegistry([bookingRead]);

    expect(getPermission(registry, 'unknown.read')).toBeUndefined();
  });

  it('requires known permissions explicitly', () => {
    const registry = createPermissionRegistry([bookingRead]);

    expect(requirePermission(registry, 'booking.read')).toBe(bookingRead);

    expect(() => requirePermission(registry, 'unknown.read')).toThrow(
      'Unknown permission key: unknown.read'
    );
  });

  it('prevents platform-only permissions from tenant assignment', () => {
    expect(canAssignPermissionToTenant(bookingRead)).toBe(true);

    expect(canAssignPermissionToTenant(platformAudit)).toBe(false);
  });

  it('validates scope against permission definition', () => {
    expect(isScopeAllowedForPermission(bookingRead, 'BRANCH')).toBe(true);

    expect(isScopeAllowedForPermission(bookingRead, 'GLOBAL')).toBe(false);

    expect(isScopeAllowedForPermission(platformAudit, 'GLOBAL')).toBe(true);
  });

  it('freezes the exposed permission collection', () => {
    const registry = createPermissionRegistry([bookingRead]);

    expect(Object.isFrozen(registry)).toBe(true);
    expect(Object.isFrozen(registry.permissions)).toBe(true);
  });
});
