import { describe, expect, it } from 'vitest';

import { asOpaqueId } from '@segaloka/shared-kernel';

import { AUTHORIZATION_POLICY_STATES } from './authorization-evaluation.js';

import type { AuthorizationEvaluationInput } from './authorization-evaluation.js';

describe('Authorization evaluation input', () => {
  it('represents fully resolved backend authorization facts', () => {
    const input: AuthorizationEvaluationInput = {
      context: {
        requestId: asOpaqueId<'RequestId'>('request_01'),
        principalId: asOpaqueId<'PrincipalId'>('principal_01'),
        tenantId: asOpaqueId<'TenantId'>('tenant_01'),
        branchId: asOpaqueId<'BranchId'>('branch_01'),
        locale: 'id',
        riskLevel: 'LOW'
      },
      subjectId: asOpaqueId<'AuthorizationSubjectId'>('subject_01'),
      tenantId: asOpaqueId<'TenantId'>('tenant_01'),
      membershipState: 'ACTIVE',
      organizationState: 'ACTIVE',
      roleGrants: [
        {
          roleId: 'role_01',
          permissions: [
            {
              permissionKey: 'booking.read',
              scope: 'BRANCH'
            }
          ]
        }
      ],
      branchAccess: [
        {
          branchId: asOpaqueId<'BranchId'>('branch_01')
        }
      ],
      resource: {
        tenantId: asOpaqueId<'TenantId'>('tenant_01'),
        branchId: asOpaqueId<'BranchId'>('branch_01'),
        ownerSubjectId: asOpaqueId<'AuthorizationSubjectId'>('subject_01')
      },
      entitlementState: 'SATISFIED',
      capabilityState: 'SATISFIED',
      relationshipState: 'NOT_REQUIRED'
    };

    expect(input.membershipState).toBe('ACTIVE');
    expect(input.organizationState).toBe('ACTIVE');
    expect(input.roleGrants).toHaveLength(1);
    expect(input.branchAccess).toHaveLength(1);
    expect(input.entitlementState).toBe('SATISFIED');
  });

  it('supports authorization without branch access', () => {
    const input: AuthorizationEvaluationInput = {
      context: {
        requestId: asOpaqueId<'RequestId'>('request_02'),
        principalId: asOpaqueId<'PrincipalId'>('principal_02'),
        tenantId: asOpaqueId<'TenantId'>('tenant_02'),
        locale: 'en',
        riskLevel: 'LOW'
      },
      subjectId: asOpaqueId<'AuthorizationSubjectId'>('subject_02'),
      tenantId: asOpaqueId<'TenantId'>('tenant_02'),
      membershipState: 'ACTIVE',
      organizationState: 'ACTIVE',
      roleGrants: [
        {
          roleId: 'role_02',
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
      relationshipState: 'NOT_REQUIRED'
    };

    expect(input.branchAccess).toEqual([]);
  });

  it('represents unsatisfied policy requirements explicitly', () => {
    const input: AuthorizationEvaluationInput = {
      context: {
        requestId: asOpaqueId<'RequestId'>('request_03'),
        principalId: asOpaqueId<'PrincipalId'>('principal_03'),
        tenantId: asOpaqueId<'TenantId'>('tenant_03'),
        locale: 'ar',
        riskLevel: 'HIGH'
      },
      subjectId: asOpaqueId<'AuthorizationSubjectId'>('subject_03'),
      tenantId: asOpaqueId<'TenantId'>('tenant_03'),
      membershipState: 'ACTIVE',
      organizationState: 'ACTIVE',
      roleGrants: [],
      branchAccess: [],
      entitlementState: 'UNSATISFIED',
      capabilityState: 'NOT_REQUIRED',
      relationshipState: 'UNSATISFIED'
    };

    expect(input.entitlementState).toBe('UNSATISFIED');

    expect(input.relationshipState).toBe('UNSATISFIED');
  });

  it('contains unique policy states', () => {
    expect(new Set(AUTHORIZATION_POLICY_STATES).size).toBe(AUTHORIZATION_POLICY_STATES.length);
  });
});
