import { describe, expect, it } from 'vitest';

import { asOpaqueId } from '@segaloka/shared-kernel';

import { RISK_LEVELS, SUPPORTED_LOCALES, isAuthenticatedContext } from './request-context.js';

import type { RequestContext } from './request-context.js';

describe('RequestContext', () => {
  it('defines the supported platform locales', () => {
    expect(SUPPORTED_LOCALES).toEqual(['id', 'en', 'ar']);
  });

  it('defines supported risk levels', () => {
    expect(RISK_LEVELS).toEqual(['LOW', 'MEDIUM', 'HIGH', 'CRITICAL']);
  });

  it('recognizes an authenticated request context', () => {
    const context: RequestContext = {
      requestId: asOpaqueId<'RequestId'>('req_01'),
      principalId: asOpaqueId<'PrincipalId'>('principal_01'),
      tenantId: asOpaqueId<'TenantId'>('travel_01'),
      workspaceId: asOpaqueId<'WorkspaceId'>('workspace_01'),
      branchId: asOpaqueId<'BranchId'>('branch_01'),
      locale: 'id',
      riskLevel: 'LOW'
    };

    expect(isAuthenticatedContext(context)).toBe(true);
  });

  it('recognizes an anonymous request context', () => {
    const context: RequestContext = {
      requestId: asOpaqueId<'RequestId'>('req_02'),
      locale: 'en',
      riskLevel: 'LOW'
    };

    expect(isAuthenticatedContext(context)).toBe(false);
  });
});
