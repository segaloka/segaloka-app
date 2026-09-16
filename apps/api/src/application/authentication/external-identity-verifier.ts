import type { VerifiedExternalIdentity } from '@segaloka/auth';

export const EXTERNAL_IDENTITY_VERIFICATION_FAILURE_REASONS = [
  'CREDENTIAL_MISSING',
  'CREDENTIAL_INVALID',
  'CREDENTIAL_EXPIRED'
] as const;

export type ExternalIdentityVerificationFailureReason =
  (typeof EXTERNAL_IDENTITY_VERIFICATION_FAILURE_REASONS)[number];

export interface ExternalIdentityVerificationSuccess {
  readonly verified: true;
  readonly externalIdentity: VerifiedExternalIdentity;
}

export interface ExternalIdentityVerificationFailure {
  readonly verified: false;
  readonly reason: ExternalIdentityVerificationFailureReason;
}

export type ExternalIdentityVerificationResult =
  | ExternalIdentityVerificationSuccess
  | ExternalIdentityVerificationFailure;

export interface ExternalIdentityVerifier {
  verify(credential: string): Promise<ExternalIdentityVerificationResult>;
}
