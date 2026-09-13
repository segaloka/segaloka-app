import type { PrincipalId } from './request-context.js';

export interface VerifiedExternalIdentity {
  readonly issuer: string;
  readonly subject: string;
}

export interface PrincipalBindingResolutionPort {
  resolvePrincipalId(externalIdentity: VerifiedExternalIdentity): Promise<PrincipalId | undefined>;
}
