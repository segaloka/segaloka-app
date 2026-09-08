import {
  canAssignPermissionToTenant,
  getPermission,
  isScopeAllowedForPermission
} from '@segaloka/platform-registry';

import type { PermissionKey, PermissionRegistry } from '@segaloka/platform-registry';

import type { OrganizationType } from './organization.js';
import type { RolePermission } from './role.js';

export const ROLE_PERMISSION_VALIDATION_ERROR_CODES = [
  'UNKNOWN_PERMISSION',
  'SCOPE_NOT_ALLOWED',
  'PERMISSION_NOT_ASSIGNABLE_TO_ORGANIZATION',
  'DUPLICATE_PERMISSION_GRANT'
] as const;

export type RolePermissionValidationErrorCode =
  (typeof ROLE_PERMISSION_VALIDATION_ERROR_CODES)[number];

export interface RolePermissionValidationError {
  readonly code: RolePermissionValidationErrorCode;
  readonly permissionKey: PermissionKey;
  readonly message: string;
}

export interface RolePermissionValidationResult {
  readonly valid: boolean;
  readonly errors: readonly RolePermissionValidationError[];
}

export function validateRolePermissions(
  organizationType: OrganizationType,
  permissions: readonly RolePermission[],
  registry: PermissionRegistry
): RolePermissionValidationResult {
  const errors: RolePermissionValidationError[] = [];
  const seenPermissionKeys = new Set<PermissionKey>();

  for (const grant of permissions) {
    if (seenPermissionKeys.has(grant.permissionKey)) {
      errors.push({
        code: 'DUPLICATE_PERMISSION_GRANT',
        permissionKey: grant.permissionKey,
        message: `Permission "${grant.permissionKey}" is granted more than once.`
      });

      continue;
    }

    seenPermissionKeys.add(grant.permissionKey);

    const definition = getPermission(registry, grant.permissionKey);

    if (definition === undefined) {
      errors.push({
        code: 'UNKNOWN_PERMISSION',
        permissionKey: grant.permissionKey,
        message: `Permission "${grant.permissionKey}" is not registered.`
      });

      continue;
    }

    if (organizationType !== 'PLATFORM' && !canAssignPermissionToTenant(definition)) {
      errors.push({
        code: 'PERMISSION_NOT_ASSIGNABLE_TO_ORGANIZATION',
        permissionKey: grant.permissionKey,
        message: `Permission "${grant.permissionKey}" cannot be assigned to organization type "${organizationType}".`
      });
    }

    if (!isScopeAllowedForPermission(definition, grant.scope)) {
      errors.push({
        code: 'SCOPE_NOT_ALLOWED',
        permissionKey: grant.permissionKey,
        message: `Scope "${grant.scope}" is not allowed for permission "${grant.permissionKey}".`
      });
    }
  }

  return Object.freeze({
    valid: errors.length === 0,
    errors: Object.freeze(errors)
  });
}
