import type { OpaqueId } from '@segaloka/shared-kernel';

export type IdentityId = OpaqueId<'IdentityId'>;

export const IDENTITY_STATUSES = ['ACTIVE', 'SUSPENDED', 'DISABLED'] as const;

export type IdentityStatus = (typeof IDENTITY_STATUSES)[number];

export interface Identity {
  readonly id: IdentityId;
  readonly status: IdentityStatus;
}
