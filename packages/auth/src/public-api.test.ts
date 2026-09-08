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
        'AUTHORIZATION_ROLE_ASSIGNMENT_STATES',
        'AuthorizationEvaluationInvariantError',
        'RISK_LEVELS',
        'SUPPORTED_LOCALES',
        'evaluateAuthorization',
        'isAuthenticatedContext',
        'isAuthorizationAllowed',
        'isAuthorizationDenied'
      ].sort()
    );
  });
});
