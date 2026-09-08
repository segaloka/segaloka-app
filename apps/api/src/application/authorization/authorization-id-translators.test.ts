import { describe, expect, it } from 'vitest';

import type {
  BranchId as AuthorizationBranchId,
  WorkspaceId as AuthorizationWorkspaceId
} from '@segaloka/auth';

import type {
  BranchId as IdentityBranchId,
  IdentityId,
  OrganizationId,
  WorkspaceId as IdentityWorkspaceId
} from '@segaloka/domain-identity';

import {
  toAuthorizationSubjectId,
  toAuthorizationTenantId,
  toIdentityBranchId,
  toIdentityWorkspaceId
} from './authorization-id-translators.js';

describe('authorization ID translators', () => {
  it('preserves workspace ID exactly across the composition boundary', () => {
    const workspaceId = ' workspace_01 ' as AuthorizationWorkspaceId;

    const translated: IdentityWorkspaceId = toIdentityWorkspaceId(workspaceId);

    expect(translated).toBe(workspaceId);
    expect(translated).toBe(' workspace_01 ');
  });

  it('preserves branch ID exactly across the composition boundary', () => {
    const branchId = ' branch_01 ' as AuthorizationBranchId;

    const translated: IdentityBranchId = toIdentityBranchId(branchId);

    expect(translated).toBe(branchId);
    expect(translated).toBe(' branch_01 ');
  });

  it('maps organization ID to authorization tenant ID without normalization', () => {
    const organizationId = ' organization_01 ' as OrganizationId;

    const translated = toAuthorizationTenantId(organizationId);

    expect(translated).toBe(organizationId);
    expect(translated).toBe(' organization_01 ');
  });

  it('maps identity ID to authorization subject ID without normalization', () => {
    const identityId = ' identity_01 ' as IdentityId;

    const translated = toAuthorizationSubjectId(identityId);

    expect(translated).toBe(identityId);
    expect(translated).toBe(' identity_01 ');
  });
});
