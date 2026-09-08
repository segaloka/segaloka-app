import { describe, expect, it } from 'vitest';

import { createPermissionRegistry, definePermission } from '@segaloka/platform-registry';

import type { RolePermission } from './role.js';

import { validateRolePermissions } from './role-permission-validation.js';

const registry = createPermissionRegistry([
  definePermission({
    key: 'booking.read',
    description: 'Read bookings.',
    visibility: 'TENANT_ASSIGNABLE',
    allowedScopes: ['TENANT', 'BRANCH', 'OWN']
  }),
  definePermission({
    key: 'booking.refund',
    description: 'Approve booking refunds.',
    visibility: 'TENANT_ASSIGNABLE',
    allowedScopes: ['TENANT']
  }),
  definePermission({
    key: 'platform.audit',
    description: 'Read platform-wide audit records.',
    visibility: 'PLATFORM_ONLY',
    allowedScopes: ['GLOBAL']
  })
]);

describe('Role permission validation', () => {
  it('accepts valid tenant-assignable permission grants for travel', () => {
    const permissions: readonly RolePermission[] = [
      {
        permissionKey: 'booking.read',
        scope: 'BRANCH'
      },
      {
        permissionKey: 'booking.refund',
        scope: 'TENANT'
      }
    ];

    const result = validateRolePermissions('TRAVEL', permissions, registry);

    expect(result.valid).toBe(true);
    expect(result.errors).toEqual([]);
  });

  it('accepts valid tenant-assignable permission grants for vendor', () => {
    const permissions: readonly RolePermission[] = [
      {
        permissionKey: 'booking.read',
        scope: 'TENANT'
      }
    ];

    const result = validateRolePermissions('VENDOR', permissions, registry);

    expect(result.valid).toBe(true);
    expect(result.errors).toEqual([]);
  });

  it('rejects an unknown permission', () => {
    const permissions: readonly RolePermission[] = [
      {
        permissionKey: 'unknown.read',
        scope: 'TENANT'
      }
    ];

    const result = validateRolePermissions('TRAVEL', permissions, registry);

    expect(result.valid).toBe(false);
    expect(result.errors).toEqual([
      expect.objectContaining({
        code: 'UNKNOWN_PERMISSION',
        permissionKey: 'unknown.read'
      })
    ]);
  });

  it('rejects a scope that the permission does not allow', () => {
    const permissions: readonly RolePermission[] = [
      {
        permissionKey: 'booking.refund',
        scope: 'BRANCH'
      }
    ];

    const result = validateRolePermissions('TRAVEL', permissions, registry);

    expect(result.valid).toBe(false);
    expect(result.errors).toEqual([
      expect.objectContaining({
        code: 'SCOPE_NOT_ALLOWED',
        permissionKey: 'booking.refund'
      })
    ]);
  });

  it('rejects platform-only permission for a travel organization', () => {
    const permissions: readonly RolePermission[] = [
      {
        permissionKey: 'platform.audit',
        scope: 'GLOBAL'
      }
    ];

    const result = validateRolePermissions('TRAVEL', permissions, registry);

    expect(result.valid).toBe(false);
    expect(result.errors).toEqual([
      expect.objectContaining({
        code: 'PERMISSION_NOT_ASSIGNABLE_TO_ORGANIZATION',
        permissionKey: 'platform.audit'
      })
    ]);
  });

  it('rejects platform-only permission for a vendor organization', () => {
    const permissions: readonly RolePermission[] = [
      {
        permissionKey: 'platform.audit',
        scope: 'GLOBAL'
      }
    ];

    const result = validateRolePermissions('VENDOR', permissions, registry);

    expect(result.valid).toBe(false);
    expect(result.errors).toEqual([
      expect.objectContaining({
        code: 'PERMISSION_NOT_ASSIGNABLE_TO_ORGANIZATION',
        permissionKey: 'platform.audit'
      })
    ]);
  });

  it('allows platform-only permission for a platform organization', () => {
    const permissions: readonly RolePermission[] = [
      {
        permissionKey: 'platform.audit',
        scope: 'GLOBAL'
      }
    ];

    const result = validateRolePermissions('PLATFORM', permissions, registry);

    expect(result.valid).toBe(true);
    expect(result.errors).toEqual([]);
  });

  it('rejects duplicate permission grants even with different scopes', () => {
    const permissions: readonly RolePermission[] = [
      {
        permissionKey: 'booking.read',
        scope: 'BRANCH'
      },
      {
        permissionKey: 'booking.read',
        scope: 'OWN'
      }
    ];

    const result = validateRolePermissions('TRAVEL', permissions, registry);

    expect(result.valid).toBe(false);
    expect(result.errors).toEqual([
      expect.objectContaining({
        code: 'DUPLICATE_PERMISSION_GRANT',
        permissionKey: 'booking.read'
      })
    ]);
  });

  it('can report multiple independent validation errors', () => {
    const permissions: readonly RolePermission[] = [
      {
        permissionKey: 'booking.refund',
        scope: 'BRANCH'
      },
      {
        permissionKey: 'platform.audit',
        scope: 'GLOBAL'
      }
    ];

    const result = validateRolePermissions('TRAVEL', permissions, registry);

    expect(result.valid).toBe(false);
    expect(result.errors.map((error) => error.code)).toEqual([
      'SCOPE_NOT_ALLOWED',
      'PERMISSION_NOT_ASSIGNABLE_TO_ORGANIZATION'
    ]);
  });
});
