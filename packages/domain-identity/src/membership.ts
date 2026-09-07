import type { OpaqueId } from '@segaloka/shared-kernel';

import type { IdentityId } from './identity.js';
import type { OrganizationId } from './organization.js';

export type MembershipId = OpaqueId<'MembershipId'>;

export const MEMBERSHIP_STATUSES = ['ACTIVE', 'SUSPENDED', 'REVOKED'] as const;

export type MembershipStatus = (typeof MEMBERSHIP_STATUSES)[number];

export interface Membership {
  readonly id: MembershipId;
  readonly identityId: IdentityId;
  readonly organizationId: OrganizationId;
  readonly status: MembershipStatus;
}
