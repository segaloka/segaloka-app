import type { AuthorizationBranchAccess, AuthorizationRoleGrant } from '@segaloka/auth';
import type {
  Branch,
  BranchId,
  IdentityAuthorizationReadPort,
  Role,
  RoleId
} from '@segaloka/domain-identity';
import {
  branchBelongsToOrganization,
  canMembershipAccessBranch,
  isActiveRoleAssignment
} from '@segaloka/domain-identity';

import {
  toAuthorizationBranchId,
  toAuthorizationSubjectId,
  toAuthorizationTenantId,
  toIdentityBranchId,
  toIdentityWorkspaceId
} from './authorization-id-translators.js';
import type {
  IdentityAuthorizationFactResolutionRequest,
  IdentityAuthorizationFactResolutionResult,
  IdentityAuthorizationFactResolver
} from './identity-authorization-fact-resolver.js';
import { IdentityAuthorizationResolutionInvariantError } from './identity-authorization-resolution-invariant-error.js';
import type { PrincipalIdentityResolutionPort } from './principal-identity-resolution-port.js';

function uniqueRoleIds(roleIds: readonly RoleId[]): readonly RoleId[] {
  return [...new Set(roleIds)];
}

function indexRolesById(roles: readonly Role[]): ReadonlyMap<RoleId, Role> {
  const rolesById = new Map<RoleId, Role>();
  const duplicateRoleIds = new Set<RoleId>();

  for (const role of roles) {
    if (rolesById.has(role.id)) {
      duplicateRoleIds.add(role.id);
      continue;
    }

    rolesById.set(role.id, role);
  }

  for (const duplicateRoleId of duplicateRoleIds) {
    rolesById.delete(duplicateRoleId);
  }

  return rolesById;
}

function uniqueBranchIds(branchIds: readonly BranchId[]): readonly BranchId[] {
  return [...new Set(branchIds)];
}

function indexBranchesById(branches: readonly Branch[]): ReadonlyMap<BranchId, Branch> {
  const branchesById = new Map<BranchId, Branch>();
  const duplicateBranchIds = new Set<BranchId>();

  for (const branch of branches) {
    if (branchesById.has(branch.id)) {
      duplicateBranchIds.add(branch.id);
      continue;
    }

    branchesById.set(branch.id, branch);
  }

  for (const duplicateBranchId of duplicateBranchIds) {
    branchesById.delete(duplicateBranchId);
  }

  return branchesById;
}

export class DefaultIdentityAuthorizationFactResolver implements IdentityAuthorizationFactResolver {
  constructor(
    private readonly principalIdentityResolution: PrincipalIdentityResolutionPort,
    private readonly identityAuthorizationReads: IdentityAuthorizationReadPort
  ) {}

  async resolve(
    request: IdentityAuthorizationFactResolutionRequest
  ): Promise<IdentityAuthorizationFactResolutionResult> {
    const workspace = await this.identityAuthorizationReads.findWorkspaceById(
      toIdentityWorkspaceId(request.workspaceId)
    );

    if (workspace === undefined) {
      return {
        resolved: false,
        reason: 'WORKSPACE_NOT_FOUND'
      };
    }

    const organization = await this.identityAuthorizationReads.findOrganizationById(
      workspace.organizationId
    );

    if (organization === undefined) {
      return {
        resolved: false,
        reason: 'ORGANIZATION_NOT_FOUND'
      };
    }

    const tenantId = toAuthorizationTenantId(organization.id);

    if (tenantId !== request.tenantId) {
      return {
        resolved: false,
        reason: 'TENANT_ASSERTION_MISMATCH'
      };
    }

    if (request.branchId !== undefined) {
      const identityBranchId = toIdentityBranchId(request.branchId);
      const branches = await this.identityAuthorizationReads.findBranchesByIds([identityBranchId]);
      const branch = branches.find((candidate) => candidate.id === identityBranchId);

      if (branch === undefined) {
        return {
          resolved: false,
          reason: 'BRANCH_NOT_FOUND'
        };
      }

      if (!branchBelongsToOrganization(branch, organization)) {
        return {
          resolved: false,
          reason: 'BRANCH_ORGANIZATION_MISMATCH'
        };
      }
    }

    const organizationState = organization.status === 'ACTIVE' ? 'ACTIVE' : 'INACTIVE';

    const identityId = await this.principalIdentityResolution.resolveIdentityId(
      request.principalId
    );

    if (identityId === undefined) {
      return {
        resolved: true,
        facts: {
          tenantId,
          identityState: 'MISSING',
          membershipState: 'MISSING',
          organizationState,
          roleAssignmentState: 'NONE',
          roleGrants: [],
          branchAccess: []
        }
      };
    }

    const identity = await this.identityAuthorizationReads.findIdentityById(identityId);

    if (identity === undefined) {
      throw new IdentityAuthorizationResolutionInvariantError(
        'PRINCIPAL_IDENTITY_MAPPING_BROKEN',
        'Principal identity mapping references an identity that does not exist.'
      );
    }

    const subjectId = toAuthorizationSubjectId(identity.id);
    const identityState = identity.status === 'ACTIVE' ? 'ACTIVE' : 'INACTIVE';

    const membership = await this.identityAuthorizationReads.findMembership(
      identity.id,
      organization.id
    );

    if (membership === undefined) {
      return {
        resolved: true,
        facts: {
          subjectId,
          tenantId,
          identityState,
          membershipState: 'MISSING',
          organizationState,
          roleAssignmentState: 'NONE',
          roleGrants: [],
          branchAccess: []
        }
      };
    }

    const membershipState = membership.status === 'ACTIVE' ? 'ACTIVE' : 'INACTIVE';

    const roleAssignments = await this.identityAuthorizationReads.listRoleAssignmentsForMembership(
      membership.id
    );

    const roleIds = uniqueRoleIds(roleAssignments.map((assignment) => assignment.roleId));
    const roles =
      roleIds.length === 0 ? [] : await this.identityAuthorizationReads.findRolesByIds(roleIds);
    const rolesById = indexRolesById(roles);

    const roleGrantsByRoleId = new Map<RoleId, AuthorizationRoleGrant>();

    for (const assignment of roleAssignments) {
      const role = rolesById.get(assignment.roleId);

      if (role === undefined) {
        continue;
      }

      if (!isActiveRoleAssignment(assignment, role, membership)) {
        continue;
      }

      if (roleGrantsByRoleId.has(role.id)) {
        continue;
      }

      roleGrantsByRoleId.set(role.id, {
        roleId: role.id,
        permissions: role.permissions.map((permission) => ({
          permissionKey: permission.permissionKey,
          scope: permission.scope
        }))
      });
    }

    const roleGrants = [...roleGrantsByRoleId.values()];

    const branchAccessRecords = await this.identityAuthorizationReads.listBranchAccessForMembership(
      membership.id
    );

    const branchIds = uniqueBranchIds(
      branchAccessRecords.map((branchAccess) => branchAccess.branchId)
    );

    const branches =
      branchIds.length === 0
        ? []
        : await this.identityAuthorizationReads.findBranchesByIds(branchIds);

    const branchesById = indexBranchesById(branches);
    const effectiveBranchAccessByBranchId = new Map<BranchId, AuthorizationBranchAccess>();

    for (const branchAccess of branchAccessRecords) {
      const branch = branchesById.get(branchAccess.branchId);

      if (branch === undefined) {
        continue;
      }

      if (!canMembershipAccessBranch(membership, branchAccess, branch)) {
        continue;
      }

      if (effectiveBranchAccessByBranchId.has(branch.id)) {
        continue;
      }

      effectiveBranchAccessByBranchId.set(branch.id, {
        branchId: toAuthorizationBranchId(branch.id)
      });
    }

    const branchAccess = [...effectiveBranchAccessByBranchId.values()];

    return {
      resolved: true,
      facts: {
        subjectId,
        tenantId,
        identityState,
        membershipState,
        organizationState,
        roleAssignmentState: roleGrants.length > 0 ? 'ACTIVE' : 'NONE',
        roleGrants,
        branchAccess
      }
    };
  }
}
