import type { PrincipalId } from '@segaloka/auth';
import type { IdentityId } from '@segaloka/domain-identity';

export interface PrincipalIdentityResolutionPort {
  resolveIdentityId(principalId: PrincipalId): Promise<IdentityId | undefined>;
}
