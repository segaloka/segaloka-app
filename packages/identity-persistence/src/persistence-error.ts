export const IDENTITY_AUTHORIZATION_PERSISTENCE_ERROR_CODES = [
  'INVALID_IDENTITY_STATUS',
  'INVALID_ORGANIZATION_TYPE',
  'INVALID_ORGANIZATION_STATUS',
  'INVALID_MEMBERSHIP_STATUS',
  'INVALID_BRANCH_STATUS',
  'INVALID_BRANCH_ACCESS_STATUS',
  'INVALID_ROLE_KIND',
  'INVALID_ROLE_STATUS',
  'INVALID_ROLE_ASSIGNMENT_STATUS',
  'INVALID_PERMISSION_KEY',
  'INVALID_PERMISSION_SCOPE'
] as const;

export type IdentityAuthorizationPersistenceErrorCode =
  (typeof IDENTITY_AUTHORIZATION_PERSISTENCE_ERROR_CODES)[number];

export class IdentityAuthorizationPersistenceError extends Error {
  readonly code: IdentityAuthorizationPersistenceErrorCode;

  constructor(code: IdentityAuthorizationPersistenceErrorCode, message: string) {
    super(message);

    this.name = 'IdentityAuthorizationPersistenceError';
    this.code = code;
  }
}
