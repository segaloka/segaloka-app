import { describe, expect, it } from 'vitest';

import { asOpaqueId } from '@segaloka/shared-kernel';

import {
  assertValidAuthorizationEvaluationInput,
  AuthorizationEvaluationInvariantError
} from './authorization-evaluation-invariant.js';

import type { AuthorizationEvaluationInput } from './authorization-evaluation.js';

function createValidInput(): AuthorizationEvaluationInput {
  return {
    context: {
      requestId: asOpaqueId<'RequestId'>('request_01'),
      principalId: asOpaqueId<'PrincipalId'>('principal_01'),
      tenantId: asOpaqueId<'TenantId'>('tenant_01'),
      locale: 'id',
      riskLevel: 'LOW'
    },
    permissionKey: 'booking.read',
    subjectId: asOpaqueId<'AuthorizationSubjectId'>('subject_01'),
    tenantId: asOpaqueId<'TenantId'>('tenant_01'),
    identityState: 'ACTIVE',
    membershipState: 'ACTIVE',
    organizationState: 'ACTIVE',
    roleAssignmentState: 'ACTIVE',
    roleGrants: [
      {
        roleId: 'role_01',
        permissions: [
          {
            permissionKey: 'booking.read',
            scope: 'TENANT'
          }
        ]
      }
    ],
    branchAccess: [],
    entitlementState: 'NOT_REQUIRED',
    capabilityState: 'NOT_REQUIRED',
    relationshipState: 'NOT_REQUIRED',
    riskPolicyState: 'NOT_REQUIRED'
  };
}

describe('Authorization evaluation invariant boundary', () => {
  it('accepts a consistent evaluation input', () => {
    expect(() => assertValidAuthorizationEvaluationInput(createValidInput())).not.toThrow();
  });

  it('throws a typed invariant error for contradictory role facts', () => {
    const input: AuthorizationEvaluationInput = {
      ...createValidInput(),
      roleAssignmentState: 'NONE'
    };

    expect(() => assertValidAuthorizationEvaluationInput(input)).toThrow(
      AuthorizationEvaluationInvariantError
    );
  });

  it('preserves validation error codes in the invariant error', () => {
    const input: AuthorizationEvaluationInput = {
      ...createValidInput(),
      roleAssignmentState: 'NONE'
    };

    try {
      assertValidAuthorizationEvaluationInput(input);
      throw new Error('Expected authorization invariant error.');
    } catch (error) {
      expect(error).toBeInstanceOf(AuthorizationEvaluationInvariantError);

      if (error instanceof AuthorizationEvaluationInvariantError) {
        expect(error.errors).toContainEqual({
          code: 'ROLE_GRANTS_WITHOUT_ACTIVE_ASSIGNMENT'
        });
      }
    }
  });

  it('collects multiple invariant violations for malformed anonymous authority facts', () => {
    const input: AuthorizationEvaluationInput = {
      ...createValidInput(),
      context: {
        requestId: asOpaqueId<'RequestId'>('request_02'),
        tenantId: asOpaqueId<'TenantId'>('tenant_01'),
        locale: 'id',
        riskLevel: 'LOW'
      }
    };

    try {
      assertValidAuthorizationEvaluationInput(input);
      throw new Error('Expected authorization invariant error.');
    } catch (error) {
      expect(error).toBeInstanceOf(AuthorizationEvaluationInvariantError);

      if (error instanceof AuthorizationEvaluationInvariantError) {
        expect(error.errors).toContainEqual({
          code: 'ANONYMOUS_IDENTITY_PRESENT'
        });

        expect(error.errors).toContainEqual({
          code: 'ANONYMOUS_SUBJECT_PRESENT'
        });

        expect(error.errors).toContainEqual({
          code: 'ANONYMOUS_MEMBERSHIP_PRESENT'
        });

        expect(error.errors).toContainEqual({
          code: 'ANONYMOUS_ROLE_ASSIGNMENT_PRESENT'
        });

        expect(error.errors).toContainEqual({
          code: 'ANONYMOUS_ROLE_GRANTS_PRESENT'
        });
      }
    }
  });

  it('exposes immutable invariant error details', () => {
    const input: AuthorizationEvaluationInput = {
      ...createValidInput(),
      roleAssignmentState: 'NONE'
    };

    try {
      assertValidAuthorizationEvaluationInput(input);
      throw new Error('Expected authorization invariant error.');
    } catch (error) {
      if (error instanceof AuthorizationEvaluationInvariantError) {
        expect(Object.isFrozen(error.errors)).toBe(true);

        expect(error.errors.every((item) => Object.isFrozen(item))).toBe(true);
      } else {
        throw error;
      }
    }
  });
});
