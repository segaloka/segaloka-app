import { describe, expect, it } from 'vitest';

import * as authPublicApi from './index.js';

describe('@segaloka/auth public API', () => {
  it('exposes only the intended runtime authorization surface', () => {
    expect(Object.keys(authPublicApi).sort()).toEqual(
      [
        'AUTHORIZATION_DENY_REASONS',
        'AUTHORIZATION_IDENTITY_STATES',
        'AUTHORIZATION_MEMBERSHIP_STATES',
        'AUTHORIZATION_ORGANIZATION_STATES',
        'AUTHORIZATION_POLICY_STATES',
        'AUTHORIZATION_RESOURCE_TYPES',
        'AUTHORIZATION_ROLE_ASSIGNMENT_STATES',
        'AuthorizationEvaluationInvariantError',
        'RISK_LEVELS',
        'SUPPORTED_LOCALES',
        'asCanonicalPrincipalId',
        'evaluateAuthorization',
        'isAuthenticatedContext',
        'isAuthorizationAllowed',
        'isAuthorizationDenied'
      ].sort()
    );
  });

  it('exposes canonical PrincipalId construction through the package boundary', () => {
    expect(authPublicApi.asCanonicalPrincipalId('550e8400-e29b-41d4-a716-446655440000')).toBe(
      '550e8400-e29b-41d4-a716-446655440000'
    );

    expect(() => authPublicApi.asCanonicalPrincipalId('principal_01')).toThrow(
      'Canonical PrincipalId must be a valid UUID.'
    );
  });
});
