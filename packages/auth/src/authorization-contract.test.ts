import { describe, expect, it } from 'vitest';

import { asOpaqueId } from '@segaloka/shared-kernel';

import { AUTHORIZATION_DENY_REASONS } from './authorization-contract.js';

import type { AuthorizationDecision, AuthorizationRequest } from './authorization-contract.js';

describe('Authorization contract', () => {
  it('creates an authorization request without caller-defined scope', () => {
    const request: AuthorizationRequest = {
      context: {
        requestId: asOpaqueId<'RequestId'>('request_01'),
        principalId: asOpaqueId<'PrincipalId'>('principal_01'),
        tenantId: asOpaqueId<'TenantId'>('tenant_01'),
        branchId: asOpaqueId<'BranchId'>('branch_01'),
        locale: 'id',
        riskLevel: 'LOW'
      },
      permissionKey: 'booking.read',
      resource: {
        tenantId: asOpaqueId<'TenantId'>('tenant_01'),
        branchId: asOpaqueId<'BranchId'>('branch_01'),
        ownerSubjectId: asOpaqueId<'AuthorizationSubjectId'>('subject_01'),
        assignedSubjectIds: [asOpaqueId<'AuthorizationSubjectId'>('subject_02')]
      }
    };

    expect(request.permissionKey).toBe('booking.read');

    expect(request.resource?.tenantId).toBe(request.context.tenantId);
  });

  it('represents an allow decision with the satisfied scope', () => {
    const decision: AuthorizationDecision = {
      allowed: true,
      permissionKey: 'booking.read',
      satisfiedScope: 'BRANCH'
    };

    expect(decision.allowed).toBe(true);

    if (decision.allowed) {
      expect(decision.satisfiedScope).toBe('BRANCH');
    }
  });

  it('represents a deny decision with a stable reason', () => {
    const decision: AuthorizationDecision = {
      allowed: false,
      permissionKey: 'booking.read',
      reason: 'BRANCH_ACCESS_REQUIRED'
    };

    expect(decision.allowed).toBe(false);

    if (!decision.allowed) {
      expect(decision.reason).toBe('BRANCH_ACCESS_REQUIRED');
    }
  });

  it('contains unique deny reason codes', () => {
    expect(new Set(AUTHORIZATION_DENY_REASONS).size).toBe(AUTHORIZATION_DENY_REASONS.length);
  });

  it('includes deny reasons for policy layers beyond RBAC', () => {
    expect(AUTHORIZATION_DENY_REASONS).toContain('ENTITLEMENT_REQUIRED');

    expect(AUTHORIZATION_DENY_REASONS).toContain('CAPABILITY_RESTRICTED');

    expect(AUTHORIZATION_DENY_REASONS).toContain('RISK_POLICY_DENIED');
  });
});
