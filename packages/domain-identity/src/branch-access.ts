import type { OpaqueId } from '@segaloka/shared-kernel';

import type { BranchId } from './branch.js';
import type { MembershipId } from './membership.js';

export type BranchAccessId = OpaqueId<'BranchAccessId'>;

export const BRANCH_ACCESS_STATUSES = ['ACTIVE', 'SUSPENDED', 'REVOKED'] as const;

export type BranchAccessStatus = (typeof BRANCH_ACCESS_STATUSES)[number];

export interface BranchAccess {
  readonly id: BranchAccessId;
  readonly membershipId: MembershipId;
  readonly branchId: BranchId;
  readonly status: BranchAccessStatus;
}
