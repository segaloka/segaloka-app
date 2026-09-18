import { describe, expect, it } from 'vitest';

import { asOpaqueId } from '@segaloka/shared-kernel';

import {
  AUTHORIZATION_IDENTITY_STATES,
  AUTHORIZATION_MEMBERSHIP_STATES,
  AUTHORIZATION_POLICY_STATES,
  AUTHORIZATION_ROLE_ASSIGNMENT_STATES
} from './authorization-evaluation.js';

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
      relationshipState: 'NOT_REQUIRED',
      resourcePolicyState: 'NOT_REQUIRED',
      riskPolicyState: 'SATISFIED'
    };

    expect(input.permissionKey).toBe('booking.read');
    expect(input.membershipState).toBe('ACTIVE');
    expect(input.roleAssignmentState).toBe('ACTIVE');
    expect(input.roleGrants).toHaveLength(1);
    expect(input.branchAccess).toHaveLength(1);
    expect(input.riskPolicyState).toBe('SATISFIED');
  });

  it('distinguishes missing identity from inactive identity', () => {
    expect(AUTHORIZATION_IDENTITY_STATES).toContain('MISSING');
    expect(AUTHORIZATION_IDENTITY_STATES).toContain('ACTIVE');
    expect(AUTHORIZATION_IDENTITY_STATES).toContain('INACTIVE');
  });

  it('distinguishes missing membership from inactive membership', () => {
    expect(AUTHORIZATION_MEMBERSHIP_STATES).toContain('MISSING');

    expect(AUTHORIZATION_MEMBERSHIP_STATES).toContain('INACTIVE');
  });

  it('distinguishes no active role assignment from missing permission', () => {
    const input: AuthorizationEvaluationInput = {
      context: {
        requestId: asOpaqueId<'RequestId'>('request_02'),
        principalId: asOpaqueId<'PrincipalId'>('principal_02'),
        tenantId: asOpaqueId<'TenantId'>('tenant_02'),
        locale: 'en',
        riskLevel: 'LOW'
      },
      permissionKey: 'booking.read',
      subjectId: asOpaqueId<'AuthorizationSubjectId'>('subject_02'),
      tenantId: asOpaqueId<'TenantId'>('tenant_02'),
      identityState: 'ACTIVE',
      membershipState: 'ACTIVE',
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

    expect(input.roleAssignmentState).toBe('NONE');
    expect(input.roleGrants).toEqual([]);
  });

  it('supports unauthenticated resolution without a business subject', () => {
    const input: AuthorizationEvaluationInput = {
      context: {
        requestId: asOpaqueId<'RequestId'>('request_03'),
        tenantId: asOpaqueId<'TenantId'>('tenant_03'),
        locale: 'id',
        riskLevel: 'LOW'
      },
      permissionKey: 'booking.read',
      tenantId: asOpaqueId<'TenantId'>('tenant_03'),
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

    expect(input.context.principalId).toBeUndefined();
    expect(input.subjectId).toBeUndefined();
    expect(input.membershipState).toBe('MISSING');
  });

  it('represents an unsatisfied risk policy explicitly', () => {
    const input: AuthorizationEvaluationInput = {
      context: {
        requestId: asOpaqueId<'RequestId'>('request_04'),
        principalId: asOpaqueId<'PrincipalId'>('principal_04'),
        tenantId: asOpaqueId<'TenantId'>('tenant_04'),
        locale: 'ar',
        riskLevel: 'HIGH'
      },
      permissionKey: 'booking.read',
      subjectId: asOpaqueId<'AuthorizationSubjectId'>('subject_04'),
      tenantId: asOpaqueId<'TenantId'>('tenant_04'),
      identityState: 'ACTIVE',
      membershipState: 'ACTIVE',
      organizationState: 'ACTIVE',
      roleAssignmentState: 'ACTIVE',
      roleGrants: [
        {
          roleId: 'role_04',
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
      riskPolicyState: 'UNSATISFIED'
    };

    expect(input.riskPolicyState).toBe('UNSATISFIED');
  });

  it('contains unique state vocabularies', () => {
    expect(new Set(AUTHORIZATION_IDENTITY_STATES).size).toBe(AUTHORIZATION_IDENTITY_STATES.length);
    expect(new Set(AUTHORIZATION_MEMBERSHIP_STATES).size).toBe(
      AUTHORIZATION_MEMBERSHIP_STATES.length
    );

    expect(new Set(AUTHORIZATION_ROLE_ASSIGNMENT_STATES).size).toBe(
      AUTHORIZATION_ROLE_ASSIGNMENT_STATES.length
    );

    expect(new Set(AUTHORIZATION_POLICY_STATES).size).toBe(AUTHORIZATION_POLICY_STATES.length);
  });
});
