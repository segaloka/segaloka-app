import { describe, expect, it } from 'vitest';

import {
  AUTHORIZATION_SCOPES,
  PERMISSION_VISIBILITIES,
  definePermission,
  isAuthorizationScope,
  isPermissionVisibility
} from './authorization.js';

describe('Authorization registry', () => {
  it('defines the canonical authorization scopes', () => {
    expect(AUTHORIZATION_SCOPES).toEqual([
      'GLOBAL',
      'TENANT',
      'BRANCH',
      'OWN',
      'ASSIGNED',
      'RELATIONSHIP',
      'PUBLIC'
    ]);
  });

  it('recognizes authorization scopes', () => {
    expect(isAuthorizationScope('TENANT')).toBe(true);
    expect(isAuthorizationScope('BRANCH')).toBe(true);
    expect(isAuthorizationScope('UNKNOWN')).toBe(false);
  });

  it('defines permission visibility classes', () => {
    expect(PERMISSION_VISIBILITIES).toEqual(['PLATFORM_ONLY', 'TENANT_ASSIGNABLE']);

    expect(isPermissionVisibility('PLATFORM_ONLY')).toBe(true);

    expect(isPermissionVisibility('UNKNOWN')).toBe(false);
  });

  it('defines an immutable tenant-assignable permission', () => {
    const permission = definePermission({
      key: 'booking.read',
      description: 'View bookings.',
      visibility: 'TENANT_ASSIGNABLE',
      allowedScopes: ['TENANT', 'BRANCH', 'OWN', 'ASSIGNED']
    });

    expect(permission).toEqual({
      key: 'booking.read',
      description: 'View bookings.',
      visibility: 'TENANT_ASSIGNABLE',
      allowedScopes: ['TENANT', 'BRANCH', 'OWN', 'ASSIGNED']
    });

    expect(Object.isFrozen(permission)).toBe(true);
    expect(Object.isFrozen(permission.allowedScopes)).toBe(true);
  });

  it('supports platform-only permissions', () => {
    const permission = definePermission({
      key: 'platform.audit',
      description: 'View platform audit records.',
      visibility: 'PLATFORM_ONLY',
      allowedScopes: ['GLOBAL']
    });

    expect(permission.visibility).toBe('PLATFORM_ONLY');
  });

  it('rejects an invalid permission key', () => {
    expect(() =>
      definePermission({
        key: 'Booking Read' as 'booking.read',
        description: 'View bookings.',
        visibility: 'TENANT_ASSIGNABLE',
        allowedScopes: ['TENANT']
      })
    ).toThrow('Invalid permission key: Booking Read');
  });

  it('rejects permissions without scopes', () => {
    expect(() =>
      definePermission({
        key: 'booking.read',
        description: 'View bookings.',
        visibility: 'TENANT_ASSIGNABLE',
        allowedScopes: []
      })
    ).toThrow('Permission must allow at least one authorization scope.');
  });

  it('rejects duplicate scopes', () => {
    expect(() =>
      definePermission({
        key: 'booking.read',
        description: 'View bookings.',
        visibility: 'TENANT_ASSIGNABLE',
        allowedScopes: ['TENANT', 'TENANT']
      })
    ).toThrow('Permission authorization scopes must be unique.');
  });
});
