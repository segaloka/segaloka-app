import { describe, expect, it } from 'vitest';

import type { IdentityAuthorizationReadPort } from '@segaloka/domain-identity';

import {
  IdentityAuthorizationPersistenceError,
  IDENTITY_AUTHORIZATION_PERSISTENCE_ERROR_CODES
} from './index.js';
import type { PostgresIdentityAuthorizationReadAdapter } from './index.js';

describe('identity authorization persistence public contract', () => {
  it('exports the persistence corruption error taxonomy', () => {
    expect(IDENTITY_AUTHORIZATION_PERSISTENCE_ERROR_CODES).toEqual([
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
    ]);
  });

  it('constructs a stable persistence mapping error', () => {
    const error = new IdentityAuthorizationPersistenceError(
      'INVALID_IDENTITY_STATUS',
      'Persisted identity status is invalid.'
    );

    expect(error).toBeInstanceOf(Error);
    expect(error.name).toBe('IdentityAuthorizationPersistenceError');
    expect(error.code).toBe('INVALID_IDENTITY_STATUS');
  });

  it('exports an adapter constructor assignable to the domain read port', () => {
    type Adapter = InstanceType<typeof PostgresIdentityAuthorizationReadAdapter>;

    const assertPort = (_value: Adapter): IdentityAuthorizationReadPort => _value;

    expect(assertPort).toBeTypeOf('function');
  });
});
