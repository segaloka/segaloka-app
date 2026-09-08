import { describe, expect, it } from 'vitest';

import type {
  AuthorizationPolicyState,
  AuthorizationRequest,
  AuthorizationSubjectId,
  BranchId,
  PrincipalId,
  RequestId,
  TenantId,
  WorkspaceId
} from '@segaloka/auth';

import { composeAuthorizationEvaluationInput } from './authorization-evaluation-input-composer.js';
import type { AuthorizationPolicyFacts } from './authorization-policy-fact-resolver.js';
import type { IdentityAuthorizationFacts } from './identity-authorization-fact-resolver.js';

function asId<T>(value: string): T {
  return value as T;
}

function createAuthorizationRequest(): AuthorizationRequest {
  return {
    context: {
      requestId: asId<RequestId>('request_01'),
      principalId: asId<PrincipalId>('principal_01'),
      workspaceId: asId<WorkspaceId>('workspace_01'),
      tenantId: asId<TenantId>('tenant_assertion_01'),
      branchId: asId<BranchId>('branch_context_01'),
      locale: 'id',
      riskLevel: 'LOW'
    },
    permissionKey: 'booking.read',
    resource: {
      tenantId: asId<TenantId>('resource_tenant_01'),
      branchId: asId<BranchId>('resource_branch_01'),
      ownerSubjectId: asId<AuthorizationSubjectId>('owner_01'),
      assignedSubjectIds: [asId<AuthorizationSubjectId>('assignee_01')]
    }
  };
}

function createIdentityFacts(): IdentityAuthorizationFacts {
  return {
    subjectId: asId<AuthorizationSubjectId>('identity_subject_01'),
    tenantId: asId<TenantId>('authoritative_tenant_01'),
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
    branchAccess: [
      {
        branchId: asId<BranchId>('authorized_branch_01')
      }
    ]
  };
}

function createPolicyFacts(
  overrides: Partial<Record<keyof AuthorizationPolicyFacts, AuthorizationPolicyState>> = {}
): AuthorizationPolicyFacts {
  return {
    entitlementState: 'SATISFIED',
    capabilityState: 'SATISFIED',
    relationshipState: 'NOT_REQUIRED',
    riskPolicyState: 'SATISFIED',
    ...overrides
  };
}

describe('composeAuthorizationEvaluationInput', () => {
  it('preserves authorization request intent and resource context', () => {
    const authorizationRequest = createAuthorizationRequest();

    const result = composeAuthorizationEvaluationInput({
      authorizationRequest,
      identityFacts: createIdentityFacts(),
      policyFacts: createPolicyFacts()
    });

    expect(result.context).toEqual(authorizationRequest.context);
    expect(result.permissionKey).toBe(authorizationRequest.permissionKey);
    expect(result.resource).toEqual(authorizationRequest.resource);
  });

  it('uses resolved identity facts without deriving authority from the request context', () => {
    const identityFacts = createIdentityFacts();

    const result = composeAuthorizationEvaluationInput({
      authorizationRequest: createAuthorizationRequest(),
      identityFacts,
      policyFacts: createPolicyFacts()
    });

    expect(result.subjectId).toBe(identityFacts.subjectId);
    expect(result.tenantId).toBe(identityFacts.tenantId);
    expect(result.identityState).toBe(identityFacts.identityState);
    expect(result.membershipState).toBe(identityFacts.membershipState);
    expect(result.organizationState).toBe(identityFacts.organizationState);
    expect(result.roleAssignmentState).toBe(identityFacts.roleAssignmentState);
    expect(result.roleGrants).toEqual(identityFacts.roleGrants);
    expect(result.branchAccess).toEqual(identityFacts.branchAccess);
  });

  it('keeps the authoritative resolved tenant separate from the request tenant assertion', () => {
    const authorizationRequest = createAuthorizationRequest();
    const identityFacts = createIdentityFacts();

    const result = composeAuthorizationEvaluationInput({
      authorizationRequest,
      identityFacts,
      policyFacts: createPolicyFacts()
    });

    expect(result.context.tenantId).toBe(authorizationRequest.context.tenantId);
    expect(result.tenantId).toBe(identityFacts.tenantId);
    expect(result.tenantId).not.toBe(result.context.tenantId);
  });

  it('copies every resolved policy fact explicitly without defaulting policy state', () => {
    const policyFacts = createPolicyFacts({
      entitlementState: 'UNSATISFIED',
      capabilityState: 'NOT_REQUIRED',
      relationshipState: 'SATISFIED',
      riskPolicyState: 'UNSATISFIED'
    });

    const result = composeAuthorizationEvaluationInput({
      authorizationRequest: createAuthorizationRequest(),
      identityFacts: createIdentityFacts(),
      policyFacts
    });

    expect(result.entitlementState).toBe('UNSATISFIED');
    expect(result.capabilityState).toBe('NOT_REQUIRED');
    expect(result.relationshipState).toBe('SATISFIED');
    expect(result.riskPolicyState).toBe('UNSATISFIED');
  });

  it('omits optional subjectId and resource properties when they are unresolved or absent', () => {
    const authorizationRequest: AuthorizationRequest = {
      context: {
        requestId: asId<RequestId>('request_02'),
        principalId: asId<PrincipalId>('principal_02'),
        workspaceId: asId<WorkspaceId>('workspace_02'),
        tenantId: asId<TenantId>('tenant_assertion_02'),
        locale: 'en',
        riskLevel: 'MEDIUM'
      },
      permissionKey: 'booking.read'
    };

    const identityFacts: IdentityAuthorizationFacts = {
      tenantId: asId<TenantId>('authoritative_tenant_02'),
      identityState: 'MISSING',
      membershipState: 'MISSING',
      organizationState: 'ACTIVE',
      roleAssignmentState: 'NONE',
      roleGrants: [],
      branchAccess: []
    };

    const result = composeAuthorizationEvaluationInput({
      authorizationRequest,
      identityFacts,
      policyFacts: createPolicyFacts({
        entitlementState: 'NOT_REQUIRED',
        capabilityState: 'NOT_REQUIRED',
        relationshipState: 'NOT_REQUIRED',
        riskPolicyState: 'NOT_REQUIRED'
      })
    });

    expect(Object.hasOwn(result, 'subjectId')).toBe(false);
    expect(Object.hasOwn(result, 'resource')).toBe(false);
    expect(result.subjectId).toBeUndefined();
    expect(result.resource).toBeUndefined();
  });

  it('preserves authoritative fact and request references without cloning them', () => {
    const authorizationRequest = createAuthorizationRequest();
    const identityFacts = createIdentityFacts();

    const result = composeAuthorizationEvaluationInput({
      authorizationRequest,
      identityFacts,
      policyFacts: createPolicyFacts()
    });

    expect(result.context).toBe(authorizationRequest.context);
    expect(result.resource).toBe(authorizationRequest.resource);
    expect(result.roleGrants).toBe(identityFacts.roleGrants);
    expect(result.branchAccess).toBe(identityFacts.branchAccess);
  });
});
