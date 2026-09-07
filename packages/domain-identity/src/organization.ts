import type { OpaqueId } from '@segaloka/shared-kernel';

export type OrganizationId = OpaqueId<'OrganizationId'>;

export const ORGANIZATION_TYPES = ['PLATFORM', 'TRAVEL', 'VENDOR'] as const;

export type OrganizationType = (typeof ORGANIZATION_TYPES)[number];

export const ORGANIZATION_STATUSES = ['ACTIVE', 'SUSPENDED', 'TERMINATED'] as const;

export type OrganizationStatus = (typeof ORGANIZATION_STATUSES)[number];

export interface Organization {
  readonly id: OrganizationId;
  readonly type: OrganizationType;
  readonly status: OrganizationStatus;
}
