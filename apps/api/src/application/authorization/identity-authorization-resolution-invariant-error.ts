export const IDENTITY_AUTHORIZATION_RESOLUTION_INVARIANT_CODES = [
  'PRINCIPAL_IDENTITY_MAPPING_BROKEN'
] as const;

export type IdentityAuthorizationResolutionInvariantCode =
  (typeof IDENTITY_AUTHORIZATION_RESOLUTION_INVARIANT_CODES)[number];

export class IdentityAuthorizationResolutionInvariantError extends Error {
  readonly code: IdentityAuthorizationResolutionInvariantCode;

  constructor(code: IdentityAuthorizationResolutionInvariantCode, message: string) {
    super(message);
    this.name = 'IdentityAuthorizationResolutionInvariantError';
    this.code = code;
  }
}
