import { describe, expect, it } from 'vitest';

import { asOpaqueId } from '@segaloka/shared-kernel';

import {
  branchAccessBelongsToMembership,
  branchBelongsToOrganization,
  canMembershipAccessBranch,
  membershipBelongsToOrganization,
  workspaceBelongsToOrganization
} from './relationships.js';

import type { Branch } from './branch.js';
import type { BranchAccess } from './branch-access.js';
import type { Membership } from './membership.js';
import type { Organization } from './organization.js';
import type { Workspace } from './workspace.js';

const travelOrganization: Organization = {
  id: asOpaqueId<'OrganizationId'>('org_travel_01'),
  type: 'TRAVEL',
  status: 'ACTIVE'
};

const otherOrganization: Organization = {
  id: asOpaqueId<'OrganizationId'>('org_travel_02'),
  type: 'TRAVEL',
  status: 'ACTIVE'
};

const membership: Membership = {
  id: asOpaqueId<'MembershipId'>('membership_01'),
  identityId: asOpaqueId<'IdentityId'>('identity_01'),
  organizationId: travelOrganization.id,
  status: 'ACTIVE'
};

const workspace: Workspace = {
  id: asOpaqueId<'WorkspaceId'>('workspace_01'),
  organizationId: travelOrganization.id
};

const branch: Branch = {
  id: asOpaqueId<'BranchId'>('branch_01'),
  organizationId: travelOrganization.id,
  status: 'ACTIVE'
};

const branchAccess: BranchAccess = {
  id: asOpaqueId<'BranchAccessId'>('branch_access_01'),
  membershipId: membership.id,
  branchId: branch.id,
  status: 'ACTIVE'
};

describe('Identity relationships', () => {
  it('matches membership to its organization', () => {
    expect(membershipBelongsToOrganization(membership, travelOrganization)).toBe(true);

    expect(membershipBelongsToOrganization(membership, otherOrganization)).toBe(false);
  });

  it('matches workspace to its organization', () => {
    expect(workspaceBelongsToOrganization(workspace, travelOrganization)).toBe(true);
  });

  it('matches branch to its organization', () => {
    expect(branchBelongsToOrganization(branch, travelOrganization)).toBe(true);
  });

  it('matches branch access to its membership', () => {
    expect(branchAccessBelongsToMembership(branchAccess, membership)).toBe(true);
  });

  it('allows active membership to access an assigned active branch', () => {
    expect(canMembershipAccessBranch(membership, branchAccess, branch)).toBe(true);
  });

  it('rejects cross-organization branch access', () => {
    const foreignBranch: Branch = {
      id: branch.id,
      organizationId: otherOrganization.id,
      status: 'ACTIVE'
    };

    expect(canMembershipAccessBranch(membership, branchAccess, foreignBranch)).toBe(false);
  });

  it('rejects suspended membership access', () => {
    const suspendedMembership: Membership = {
      ...membership,
      status: 'SUSPENDED'
    };

    expect(canMembershipAccessBranch(suspendedMembership, branchAccess, branch)).toBe(false);
  });

  it('rejects revoked branch access', () => {
    const revokedAccess: BranchAccess = {
      ...branchAccess,
      status: 'REVOKED'
    };

    expect(canMembershipAccessBranch(membership, revokedAccess, branch)).toBe(false);
  });

  it('rejects access to a closed branch', () => {
    const closedBranch: Branch = {
      ...branch,
      status: 'CLOSED'
    };

    expect(canMembershipAccessBranch(membership, branchAccess, closedBranch)).toBe(false);
  });
});
