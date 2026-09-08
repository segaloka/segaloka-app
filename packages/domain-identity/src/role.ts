import type { OpaqueId } from '@segaloka/shared-kernel';
import type { AuthorizationScope, PermissionKey } from '@segaloka/platform-registry';

import type { OrganizationId } from './organization.js';

export type RoleId = OpaqueId<'RoleId'>;

export const ROLE_KINDS = ['SYSTEM', 'CUSTOM'] as const;

export type RoleKind = (typeof ROLE_KINDS)[number];

export const ROLE_STATUSES = ['ACTIVE', 'ARCHIVED'] as const;

export type RoleStatus = (typeof ROLE_STATUSES)[number];

export interface RolePermission {
  readonly permissionKey: PermissionKey;
  readonly scope: AuthorizationScope;
}

export interface Role {
  readonly id: RoleId;
  readonly organizationId: OrganizationId;
  readonly name: string;
  readonly kind: RoleKind;
  readonly status: RoleStatus;
  readonly permissions: readonly RolePermission[];
}
