import type { OpaqueId } from '@segaloka/shared-kernel';

import type { MembershipId } from './membership.js';
import type { RoleId } from './role.js';

export type RoleAssignmentId = OpaqueId<'RoleAssignmentId'>;

export const ROLE_ASSIGNMENT_STATUSES = ['ACTIVE', 'SUSPENDED', 'REVOKED'] as const;

export type RoleAssignmentStatus = (typeof ROLE_ASSIGNMENT_STATUSES)[number];

export interface RoleAssignment {
  readonly id: RoleAssignmentId;
  readonly membershipId: MembershipId;
  readonly roleId: RoleId;
  readonly status: RoleAssignmentStatus;
}
