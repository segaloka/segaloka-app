import type { Branch, BranchId } from './branch.js';
import type { BranchAccess } from './branch-access.js';
import type { Identity, IdentityId } from './identity.js';
import type { Membership } from './membership.js';
import type { Organization, OrganizationId } from './organization.js';
import type { RoleAssignment } from './role-assignment.js';
import type { Role, RoleId } from './role.js';
import type { Workspace, WorkspaceId } from './workspace.js';

export interface IdentityAuthorizationReadPort {
  findIdentityById(identityId: IdentityId): Promise<Identity | undefined>;

  findWorkspaceById(workspaceId: WorkspaceId): Promise<Workspace | undefined>;

  findOrganizationById(organizationId: OrganizationId): Promise<Organization | undefined>;

  findMembership(
    identityId: IdentityId,
    organizationId: OrganizationId
  ): Promise<Membership | undefined>;

  findBranchById(branchId: BranchId): Promise<Branch | undefined>;

  listBranchAccessForMembership(membershipId: Membership['id']): Promise<readonly BranchAccess[]>;

  listRoleAssignmentsForMembership(
    membershipId: Membership['id']
  ): Promise<readonly RoleAssignment[]>;

  findRolesByIds(roleIds: readonly RoleId[]): Promise<readonly Role[]>;
}
