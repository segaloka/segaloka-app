import { describe, expect, it } from 'vitest';

import type {
  AuthorizationEvaluationInput,
  AuthorizationSubjectId,
  PrincipalId,
  RequestId,
  TenantId,
  WorkspaceId
} from '@segaloka/auth';

import { PERMISSION_REGISTRY } from '@segaloka/platform-registry';

import { createCanonicalAuthorizationEvaluator } from './canonical-authorization-evaluator.js';
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
    riskPolicyState: 'SATISFIED'
  };
}

describe('canonical authorization evaluator composition', () => {
  it('creates the registry-backed production evaluator boundary', () => {
    const evaluator = createCanonicalAuthorizationEvaluator();

    expect(evaluator).toBeInstanceOf(RegistryAuthorizationEvaluator);
  });

  it('uses the canonical production permission registry and therefore fails closed for unknown permissions', () => {
    expect(PERMISSION_REGISTRY.permissions).toEqual([]);

    const evaluator = createCanonicalAuthorizationEvaluator();

    expect(evaluator.evaluate(createInput())).toEqual({
      allowed: false,
      permissionKey: 'booking.read',
      reason: 'UNKNOWN_PERMISSION'
    });
  });

  it('creates independent evaluator instances without mutating the canonical registry', () => {
    const first = createCanonicalAuthorizationEvaluator();
    const second = createCanonicalAuthorizationEvaluator();

    expect(first).not.toBe(second);
    expect(PERMISSION_REGISTRY.permissions).toEqual([]);
    expect(PERMISSION_REGISTRY.byKey.size).toBe(0);
  });
});
