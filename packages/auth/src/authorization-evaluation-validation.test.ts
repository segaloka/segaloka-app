import { describe, expect, it } from 'vitest';

import { asOpaqueId } from '@segaloka/shared-kernel';

import { validateAuthorizationEvaluationInput } from './authorization-evaluation-validation.js';

import type { AuthorizationEvaluationInput } from './authorization-evaluation.js';

function createBaseInput(): AuthorizationEvaluationInput {
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
    resourcePolicyState: 'NOT_REQUIRED',
    riskPolicyState: 'NOT_REQUIRED'
  };
}

describe('Authorization evaluation validation', () => {
  it('accepts consistent resolved authorization facts', () => {
    const result = validateAuthorizationEvaluationInput(createBaseInput());

    expect(result.valid).toBe(true);
    expect(result.errors).toEqual([]);
  });

  it('rejects role grants without an active role assignment', () => {
    const input: AuthorizationEvaluationInput = {
      ...createBaseInput(),
      roleAssignmentState: 'NONE'
    };

    const result = validateAuthorizationEvaluationInput(input);

    expect(result.valid).toBe(false);
    expect(result.errors).toContainEqual({
      code: 'ROLE_GRANTS_WITHOUT_ACTIVE_ASSIGNMENT'
    });
  });

  it('rejects an active role assignment without role grants', () => {
    const input: AuthorizationEvaluationInput = {
      ...createBaseInput(),
      roleGrants: []
    };

    const result = validateAuthorizationEvaluationInput(input);

    expect(result.valid).toBe(false);
    expect(result.errors).toContainEqual({
      code: 'ACTIVE_ASSIGNMENT_WITHOUT_ROLE_GRANTS'
    });
  });

  it('rejects authority facts for an anonymous request', () => {
    const input: AuthorizationEvaluationInput = {
      ...createBaseInput(),
      context: {
        requestId: asOpaqueId<'RequestId'>('request_02'),
        tenantId: asOpaqueId<'TenantId'>('tenant_01'),
        locale: 'id',
        riskLevel: 'LOW'
      }
    };

    const result = validateAuthorizationEvaluationInput(input);

    expect(result.valid).toBe(false);
    expect(result.errors).toContainEqual({
      code: 'ANONYMOUS_IDENTITY_PRESENT'
    });

    expect(result.errors).toContainEqual({
      code: 'ANONYMOUS_SUBJECT_PRESENT'
    });

    expect(result.errors).toContainEqual({
      code: 'ANONYMOUS_MEMBERSHIP_PRESENT'
    });

    expect(result.errors).toContainEqual({
      code: 'ANONYMOUS_ROLE_ASSIGNMENT_PRESENT'
    });

    expect(result.errors).toContainEqual({
      code: 'ANONYMOUS_ROLE_GRANTS_PRESENT'
    });
  });

  it('rejects authority facts when membership is missing', () => {
    const input: AuthorizationEvaluationInput = {
      ...createBaseInput(),
      membershipState: 'MISSING'
    };

    const result = validateAuthorizationEvaluationInput(input);

    expect(result.valid).toBe(false);

    expect(result.errors).toContainEqual({
      code: 'MISSING_MEMBERSHIP_WITH_ROLE_ASSIGNMENT'
    });

    expect(result.errors).toContainEqual({
      code: 'MISSING_MEMBERSHIP_WITH_ROLE_GRANTS'
    });
  });

  it('accepts a clean anonymous authorization resolution', () => {
    const input: AuthorizationEvaluationInput = {
      context: {
        requestId: asOpaqueId<'RequestId'>('request_03'),
        tenantId: asOpaqueId<'TenantId'>('tenant_public'),
        locale: 'en',
        riskLevel: 'LOW'
      },
      permissionKey: 'booking.read',
      tenantId: asOpaqueId<'TenantId'>('tenant_public'),
      identityState: 'MISSING',
      membershipState: 'MISSING',
      organizationState: 'ACTIVE',
      roleAssignmentState: 'NONE',
      roleGrants: [],
      branchAccess: [],
      entitlementState: 'NOT_REQUIRED',
      capabilityState: 'NOT_REQUIRED',
      relationshipState: 'NOT_REQUIRED',
      resourcePolicyState: 'NOT_REQUIRED',
      riskPolicyState: 'NOT_REQUIRED'
    };

    const result = validateAuthorizationEvaluationInput(input);

    expect(result.valid).toBe(true);
    expect(result.errors).toEqual([]);
  });

  it('rejects authority facts when identity is missing', () => {
    const input: AuthorizationEvaluationInput = {
      ...createBaseInput(),
      identityState: 'MISSING'
    };

    const result = validateAuthorizationEvaluationInput(input);

    expect(result.valid).toBe(false);

    expect(result.errors).toContainEqual({
      code: 'MISSING_IDENTITY_WITH_SUBJECT'
    });

    expect(result.errors).toContainEqual({
      code: 'MISSING_IDENTITY_WITH_MEMBERSHIP'
    });

    expect(result.errors).toContainEqual({
      code: 'MISSING_IDENTITY_WITH_ROLE_ASSIGNMENT'
    });

    expect(result.errors).toContainEqual({
      code: 'MISSING_IDENTITY_WITH_ROLE_GRANTS'
    });
  });

  it('returns immutable validation output', () => {
    const result = validateAuthorizationEvaluationInput(createBaseInput());

    expect(Object.isFrozen(result)).toBe(true);
    expect(Object.isFrozen(result.errors)).toBe(true);
  });
});
