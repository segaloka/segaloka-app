import type { Branch } from './branch.js';
import type { BranchAccess } from './branch-access.js';
import type { Membership } from './membership.js';
import type { Organization } from './organization.js';
import type { Workspace } from './workspace.js';

export function membershipBelongsToOrganization(
  membership: Membership,
  organization: Organization
): boolean {
  return membership.organizationId === organization.id;
}

export function workspaceBelongsToOrganization(
  workspace: Workspace,
  organization: Organization
): boolean {
  return workspace.organizationId === organization.id;
}

export function branchBelongsToOrganization(branch: Branch, organization: Organization): boolean {
  return branch.organizationId === organization.id;
}

export function branchAccessBelongsToMembership(
  branchAccess: BranchAccess,
  membership: Membership
): boolean {
  return branchAccess.membershipId === membership.id;
}

export function canMembershipAccessBranch(
  membership: Membership,
  branchAccess: BranchAccess,
  branch: Branch
): boolean {
  return (
    membership.status === 'ACTIVE' &&
    branchAccess.status === 'ACTIVE' &&
    branch.status === 'ACTIVE' &&
    branchAccess.membershipId === membership.id &&
    branchAccess.branchId === branch.id &&
    membership.organizationId === branch.organizationId
  );
}
