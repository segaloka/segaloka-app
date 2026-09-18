import { describe, expect, it } from 'vitest';

import type {
  AuthorizationEvaluationInput,
  AuthorizationSubjectId,
  BranchId,
  PrincipalId,
  RequestId,
  TenantId,
  WorkspaceId
} from '@segaloka/auth';

import { createPermissionRegistry, definePermission } from '@segaloka/platform-registry';

import { RegistryAuthorizationEvaluator } from './registry-authorization-evaluator.js';

function asId<T>(value: string): T {
  return value as T;
}

function createInput(): AuthorizationEvaluationInput {
  return {
    context: {
      requestId: asId<RequestId>('request_01'),
      principalId: asId<PrincipalId>('principal_01'),
      workspaceId: asId<WorkspaceId>('workspace_01'),
      tenantId: asId<TenantId>('tenant_01'),
      branchId: asId<BranchId>('branch_01'),
      locale: 'id',
      riskLevel: 'LOW'
    },
    permissionKey: 'booking.read',
    subjectId: asId<AuthorizationSubjectId>('subject_01'),
    tenantId: asId<TenantId>('tenant_01'),
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
    entitlementState: 'SATISFIED',
    capabilityState: 'SATISFIED',
    relationshipState: 'NOT_REQUIRED',
    resourcePolicyState: 'NOT_REQUIRED',
    riskPolicyState: 'SATISFIED'
  };
}

function createRegistry() {
  return createPermissionRegistry([
    definePermission({
      key: 'booking.read',
      description: 'Read bookings.',
      visibility: 'TENANT_ASSIGNABLE',
      allowedScopes: ['TENANT']
    })
  ]);
}

describe('RegistryAuthorizationEvaluator', () => {
  it('delegates authorization evaluation to the canonical auth evaluator using its registry', () => {
    const evaluator = new RegistryAuthorizationEvaluator(createRegistry());

    expect(evaluator.evaluate(createInput())).toEqual({
      allowed: true,
      permissionKey: 'booking.read',
      satisfiedScope: 'TENANT'
    });
  });

  it('does not invent permissions that are absent from its registry', () => {
    const evaluator = new RegistryAuthorizationEvaluator(createPermissionRegistry([]));

    expect(evaluator.evaluate(createInput())).toEqual({
      allowed: false,
      permissionKey: 'booking.read',
      reason: 'UNKNOWN_PERMISSION'
    });
  });

  it('preserves registry scope restrictions instead of bypassing them', () => {
    const registry = createPermissionRegistry([
      definePermission({
        key: 'booking.read',
        description: 'Read bookings.',
        visibility: 'TENANT_ASSIGNABLE',
        allowedScopes: ['BRANCH']
      })
    ]);

    const evaluator = new RegistryAuthorizationEvaluator(registry);

    expect(evaluator.evaluate(createInput())).toEqual({
      allowed: false,
      permissionKey: 'booking.read',
      reason: 'SCOPE_NOT_SATISFIED'
    });
  });
});
