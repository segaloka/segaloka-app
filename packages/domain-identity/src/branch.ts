import type { OpaqueId } from '@segaloka/shared-kernel';

import type { OrganizationId } from './organization.js';

export type BranchId = OpaqueId<'BranchId'>;

export const BRANCH_STATUSES = ['ACTIVE', 'SUSPENDED', 'CLOSED'] as const;

export type BranchStatus = (typeof BRANCH_STATUSES)[number];

export interface Branch {
  readonly id: BranchId;
  readonly organizationId: OrganizationId;
  readonly status: BranchStatus;
}
