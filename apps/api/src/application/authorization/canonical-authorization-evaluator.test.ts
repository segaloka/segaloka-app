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
    resourcePolicyState: 'NOT_REQUIRED',
    riskPolicyState: 'SATISFIED'
  };
}

describe('canonical authorization evaluator composition', () => {
  it('creates the registry-backed production evaluator boundary', () => {
    const evaluator = createCanonicalAuthorizationEvaluator();

    expect(evaluator).toBeInstanceOf(RegistryAuthorizationEvaluator);
  });

  it('fails closed for an unknown permission even when a role grants it', () => {
    expect(PERMISSION_REGISTRY.byKey.has('booking.read')).toBe(false);

    const evaluator = createCanonicalAuthorizationEvaluator();

    expect(evaluator.evaluate(createInput())).toEqual({
      allowed: false,
      permissionKey: 'booking.read',
      reason: 'UNKNOWN_PERMISSION'
    });
  });

  it('does not automatically grant registered package publication permission', () => {
    expect(PERMISSION_REGISTRY.byKey.has('package.publish')).toBe(true);

    const evaluator = createCanonicalAuthorizationEvaluator();
    const input: AuthorizationEvaluationInput = {
      ...createInput(),
      permissionKey: 'package.publish'
    };

    expect(evaluator.evaluate(input)).toEqual({
      allowed: false,
      permissionKey: 'package.publish',
      reason: 'PERMISSION_NOT_GRANTED'
    });
  });

  it('creates independent evaluator instances without mutating the canonical registry', () => {
    const permissionsBefore = [...PERMISSION_REGISTRY.permissions];
    const entriesBefore = [...PERMISSION_REGISTRY.byKey.entries()];

    const first = createCanonicalAuthorizationEvaluator();
    const second = createCanonicalAuthorizationEvaluator();

    first.evaluate(createInput());
    second.evaluate(createInput());

    expect(first).not.toBe(second);
    expect(PERMISSION_REGISTRY.permissions).toEqual(permissionsBefore);
    expect([...PERMISSION_REGISTRY.byKey.entries()]).toEqual(entriesBefore);
    expect(PERMISSION_REGISTRY.permissions.map((permission) => permission.key)).toEqual([
      'package.publish'
    ]);
    expect(PERMISSION_REGISTRY.byKey.size).toBe(1);
  });
});
