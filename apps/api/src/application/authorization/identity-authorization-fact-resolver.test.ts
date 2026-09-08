import { describe, expect, it } from 'vitest';

import type {
  BranchId as AuthorizationBranchId,
  PrincipalId,
  TenantId,
  WorkspaceId as AuthorizationWorkspaceId
} from '@segaloka/auth';

import type {
  Branch,
  BranchAccess,
  BranchId,
  Identity,
  IdentityAuthorizationReadPort,
  IdentityId,
  Membership,
  Organization,
  OrganizationId,
  Role,
  RoleAssignment,
  RoleId,
  Workspace
} from '@segaloka/domain-identity';

import { DefaultIdentityAuthorizationFactResolver } from './default-identity-authorization-fact-resolver.js';
import { IdentityAuthorizationResolutionInvariantError } from './identity-authorization-resolution-invariant-error.js';
import type { PrincipalIdentityResolutionPort } from './principal-identity-resolution-port.js';

function asId<T>(value: string): T {
  return value as unknown as T;
}

const principalId = asId<PrincipalId>('principal_01');
const identityId = asId<IdentityId>('identity_01');
const organizationId = asId<OrganizationId>('organization_01');
const otherOrganizationId = asId<OrganizationId>('organization_02');
const workspaceId = asId<AuthorizationWorkspaceId>('workspace_01');
const tenantId = asId<TenantId>('organization_01');
const otherTenantId = asId<TenantId>('organization_02');
const branchId = asId<BranchId>('branch_01');

const baseIdentity: Identity = {
  id: identityId,
  status: 'ACTIVE'
};

const baseOrganization: Organization = {
  id: organizationId,
  type: 'TRAVEL',
  status: 'ACTIVE'
};

const baseWorkspace: Workspace = {
  id: asId<Workspace['id']>('workspace_01'),
  organizationId
};

const baseMembership: Membership = {
  id: asId<Membership['id']>('membership_01'),
  identityId,
  organizationId,
  status: 'ACTIVE'
};

const baseBranch: Branch = {
  id: branchId,
  organizationId,
  status: 'ACTIVE'
};

const baseRole: Role = {
  id: asId<RoleId>('role_01'),
  organizationId,
  name: 'Travel Admin',
  kind: 'CUSTOM',
  status: 'ACTIVE',
  permissions: [
    {
      permissionKey: 'booking.read',
      scope: 'TENANT'
    }
  ]
};

const baseRoleAssignment: RoleAssignment = {
  id: asId<RoleAssignment['id']>('role_assignment_01'),
  membershipId: baseMembership.id,
  roleId: baseRole.id,
  status: 'ACTIVE'
};

const baseBranchAccess: BranchAccess = {
  id: asId<BranchAccess['id']>('branch_access_01'),
  membershipId: baseMembership.id,
  branchId,
  status: 'ACTIVE'
};

class FakePrincipalIdentityResolutionPort implements PrincipalIdentityResolutionPort {
  identityId: IdentityId | undefined = identityId;
  readonly calls: PrincipalId[] = [];

  resolveIdentityId(inputPrincipalId: PrincipalId): Promise<IdentityId | undefined> {
    this.calls.push(inputPrincipalId);
    return Promise.resolve(this.identityId);
  }
}

class FakeIdentityAuthorizationReadPort implements IdentityAuthorizationReadPort {
  identity: Identity | undefined = baseIdentity;
  workspace: Workspace | undefined = baseWorkspace;
  organization: Organization | undefined = baseOrganization;
  membership: Membership | undefined = baseMembership;
  branchAccess: BranchAccess[] = [];
  branches: Branch[] = [];
  roleAssignments: RoleAssignment[] = [];
  roles: Role[] = [];

  readonly workspaceReads: Workspace['id'][] = [];
  readonly organizationReads: OrganizationId[] = [];
  readonly membershipReads: {
    identityId: IdentityId;
    organizationId: OrganizationId;
  }[] = [];

  findIdentityById(requestedIdentityId: IdentityId): Promise<Identity | undefined> {
    if (this.identity?.id !== requestedIdentityId) {
      return Promise.resolve(undefined);
    }

    return Promise.resolve(this.identity);
  }

  findWorkspaceById(requestedWorkspaceId: Workspace['id']): Promise<Workspace | undefined> {
    this.workspaceReads.push(requestedWorkspaceId);

    if (this.workspace?.id !== requestedWorkspaceId) {
      return Promise.resolve(undefined);
    }

    return Promise.resolve(this.workspace);
  }

  findOrganizationById(requestedOrganizationId: OrganizationId): Promise<Organization | undefined> {
    this.organizationReads.push(requestedOrganizationId);

    if (this.organization?.id !== requestedOrganizationId) {
      return Promise.resolve(undefined);
    }

    return Promise.resolve(this.organization);
  }

  findMembership(
    requestedIdentityId: IdentityId,
    requestedOrganizationId: OrganizationId
  ): Promise<Membership | undefined> {
    this.membershipReads.push({
      identityId: requestedIdentityId,
      organizationId: requestedOrganizationId
    });

    if (
      this.membership?.identityId !== requestedIdentityId ||
      this.membership.organizationId !== requestedOrganizationId
    ) {
      return Promise.resolve(undefined);
    }

    return Promise.resolve(this.membership);
  }

  listBranchAccessForMembership(membershipId: Membership['id']): Promise<readonly BranchAccess[]> {
    void membershipId;
    return Promise.resolve(this.branchAccess);
  }

  findBranchesByIds(branchIds: readonly BranchId[]): Promise<readonly Branch[]> {
    return Promise.resolve(this.branches.filter((branch) => branchIds.includes(branch.id)));
  }

  listRoleAssignmentsForMembership(
    membershipId: Membership['id']
  ): Promise<readonly RoleAssignment[]> {
    void membershipId;
    return Promise.resolve(this.roleAssignments);
  }

  findRolesByIds(roleIds: readonly RoleId[]): Promise<readonly Role[]> {
    return Promise.resolve(this.roles.filter((role) => roleIds.includes(role.id)));
  }
}

function createHarness() {
  const principalResolution = new FakePrincipalIdentityResolutionPort();
  const reads = new FakeIdentityAuthorizationReadPort();

  const resolver = new DefaultIdentityAuthorizationFactResolver(principalResolution, reads);

  return {
    principalResolution,
    reads,
    resolver
  };
}

function createRequest(overrides?: { tenantId?: TenantId; branchId?: AuthorizationBranchId }) {
  return {
    principalId,
    workspaceId,
    tenantId: overrides?.tenantId ?? tenantId,
    ...(overrides?.branchId === undefined
      ? {}
      : {
          branchId: overrides.branchId
        })
  };
}

describe('IdentityAuthorizationFactResolver behavior matrix', () => {
  describe('authoritative workspace and tenant resolution', () => {
    it('returns WORKSPACE_NOT_FOUND when the requested workspace does not exist', async () => {
      const { reads, resolver } = createHarness();
      reads.workspace = undefined;

      await expect(resolver.resolve(createRequest())).resolves.toEqual({
        resolved: false,
        reason: 'WORKSPACE_NOT_FOUND'
      });
    });

    it('returns ORGANIZATION_NOT_FOUND when the authoritative workspace references a missing organization', async () => {
      const { reads, resolver } = createHarness();
      reads.organization = undefined;

      await expect(resolver.resolve(createRequest())).resolves.toEqual({
        resolved: false,
        reason: 'ORGANIZATION_NOT_FOUND'
      });
    });

    it('returns TENANT_ASSERTION_MISMATCH when the requested tenant assertion does not match the workspace organization', async () => {
      const { resolver } = createHarness();

      await expect(
        resolver.resolve(
          createRequest({
            tenantId: otherTenantId
          })
        )
      ).resolves.toEqual({
        resolved: false,
        reason: 'TENANT_ASSERTION_MISMATCH'
      });
    });

    it('returns the tenant derived from the authoritative organization instead of echoing the request tenant', async () => {
      const { resolver } = createHarness();

      const result = await resolver.resolve(createRequest());

      expect(result.resolved).toBe(true);

      if (!result.resolved) {
        throw new Error('Expected successful fact resolution.');
      }

      expect(result.facts.tenantId).toBe(organizationId);
    });

    it('resolves an existing inactive organization as authorization facts instead of a context-resolution failure', async () => {
      const { reads, resolver } = createHarness();

      reads.organization = {
        ...baseOrganization,
        status: 'SUSPENDED'
      };

      const result = await resolver.resolve(createRequest());

      expect(result.resolved).toBe(true);

      if (!result.resolved) {
        throw new Error('Expected successful fact resolution.');
      }

      expect(result.facts.organizationState).toBe('INACTIVE');
    });
  });

  describe('requested branch context validation', () => {
    it('returns BRANCH_NOT_FOUND when a requested branch does not exist', async () => {
      const { resolver } = createHarness();

      await expect(
        resolver.resolve(
          createRequest({
            branchId: asId<AuthorizationBranchId>('branch_missing')
          })
        )
      ).resolves.toEqual({
        resolved: false,
        reason: 'BRANCH_NOT_FOUND'
      });
    });

    it('returns BRANCH_ORGANIZATION_MISMATCH when a requested branch belongs to another organization', async () => {
      const { reads, resolver } = createHarness();

      reads.branches = [
        {
          id: branchId,
          organizationId: otherOrganizationId,
          status: 'ACTIVE'
        }
      ];

      await expect(
        resolver.resolve(
          createRequest({
            branchId: asId<AuthorizationBranchId>('branch_01')
          })
        )
      ).resolves.toEqual({
        resolved: false,
        reason: 'BRANCH_ORGANIZATION_MISMATCH'
      });
    });

    it('allows context resolution when the requested branch belongs to the authoritative organization even when the membership has no branch access', async () => {
      const { reads, resolver } = createHarness();

      reads.branches = [baseBranch];

      const result = await resolver.resolve(
        createRequest({
          branchId: asId<AuthorizationBranchId>('branch_01')
        })
      );

      expect(result.resolved).toBe(true);

      if (!result.resolved) {
        throw new Error('Expected successful fact resolution.');
      }

      expect(result.facts.branchAccess).toEqual([]);
    });
  });

  describe('principal and identity resolution', () => {
    it('returns resolved MISSING identity facts when the authenticated principal has no identity mapping', async () => {
      const { principalResolution, resolver } = createHarness();
      principalResolution.identityId = undefined;

      const result = await resolver.resolve(createRequest());

      expect(result).toEqual({
        resolved: true,
        facts: {
          tenantId,
          identityState: 'MISSING',
          membershipState: 'MISSING',
          organizationState: 'ACTIVE',
          roleAssignmentState: 'NONE',
          roleGrants: [],
          branchAccess: []
        }
      });
    });

    it('treats a missing identity row after a successful principal-to-identity mapping as an invariant failure', async () => {
      const { reads, resolver } = createHarness();
      reads.identity = undefined;

      await expect(resolver.resolve(createRequest())).rejects.toMatchObject({
        name: 'IdentityAuthorizationResolutionInvariantError',
        code: 'PRINCIPAL_IDENTITY_MAPPING_BROKEN'
      });

      await expect(resolver.resolve(createRequest())).rejects.toBeInstanceOf(
        IdentityAuthorizationResolutionInvariantError
      );
    });

    it('returns subjectId translated from the authoritative identity when the identity exists', async () => {
      const { resolver } = createHarness();

      const result = await resolver.resolve(createRequest());

      expect(result.resolved).toBe(true);

      if (!result.resolved) {
        throw new Error('Expected successful fact resolution.');
      }

      expect(result.facts.subjectId).toBe(identityId);
    });

    it('maps an active identity to ACTIVE', async () => {
      const { resolver } = createHarness();

      const result = await resolver.resolve(createRequest());

      expect(result.resolved).toBe(true);

      if (!result.resolved) {
        throw new Error('Expected successful fact resolution.');
      }

      expect(result.facts.identityState).toBe('ACTIVE');
    });

    it.each(['SUSPENDED', 'DISABLED'] as const)('maps %s identity to INACTIVE', async (status) => {
      const { reads, resolver } = createHarness();

      reads.identity = {
        ...baseIdentity,
        status
      };

      const result = await resolver.resolve(createRequest());

      expect(result.resolved).toBe(true);

      if (!result.resolved) {
        throw new Error('Expected successful fact resolution.');
      }

      expect(result.facts.identityState).toBe('INACTIVE');
    });
  });

  describe('membership resolution', () => {
    it('returns MISSING membership facts when no membership exists for the identity and authoritative organization', async () => {
      const { reads, resolver } = createHarness();
      reads.membership = undefined;

      const result = await resolver.resolve(createRequest());

      expect(result.resolved).toBe(true);

      if (!result.resolved) {
        throw new Error('Expected successful fact resolution.');
      }

      expect(result.facts.membershipState).toBe('MISSING');
      expect(result.facts.roleAssignmentState).toBe('NONE');
      expect(result.facts.roleGrants).toEqual([]);
      expect(result.facts.branchAccess).toEqual([]);
    });

    it('maps an active membership to ACTIVE', async () => {
      const { resolver } = createHarness();

      const result = await resolver.resolve(createRequest());

      expect(result.resolved).toBe(true);

      if (!result.resolved) {
        throw new Error('Expected successful fact resolution.');
      }

      expect(result.facts.membershipState).toBe('ACTIVE');
    });

    it.each(['SUSPENDED', 'REVOKED'] as const)('maps %s membership to INACTIVE', async (status) => {
      const { reads, resolver } = createHarness();

      reads.membership = {
        ...baseMembership,
        status
      };

      const result = await resolver.resolve(createRequest());

      expect(result.resolved).toBe(true);

      if (!result.resolved) {
        throw new Error('Expected successful fact resolution.');
      }

      expect(result.facts.membershipState).toBe('INACTIVE');
    });

    it('does not produce effective role grants for an inactive membership', async () => {
      const { reads, resolver } = createHarness();

      reads.membership = {
        ...baseMembership,
        status: 'SUSPENDED'
      };
      reads.roleAssignments = [baseRoleAssignment];
      reads.roles = [baseRole];

      const result = await resolver.resolve(createRequest());

      expect(result.resolved).toBe(true);

      if (!result.resolved) {
        throw new Error('Expected successful fact resolution.');
      }

      expect(result.facts.roleAssignmentState).toBe('NONE');
      expect(result.facts.roleGrants).toEqual([]);
    });

    it('does not produce effective branch access for an inactive membership', async () => {
      const { reads, resolver } = createHarness();

      reads.membership = {
        ...baseMembership,
        status: 'SUSPENDED'
      };
      reads.branchAccess = [baseBranchAccess];
      reads.branches = [baseBranch];

      const result = await resolver.resolve(createRequest());

      expect(result.resolved).toBe(true);

      if (!result.resolved) {
        throw new Error('Expected successful fact resolution.');
      }

      expect(result.facts.branchAccess).toEqual([]);
    });
  });

  describe('effective role grants', () => {
    it('returns NONE role assignment state and no grants when the membership has no effective active role assignments', async () => {
      const { resolver } = createHarness();

      const result = await resolver.resolve(createRequest());

      expect(result.resolved).toBe(true);

      if (!result.resolved) {
        throw new Error('Expected successful fact resolution.');
      }

      expect(result.facts.roleAssignmentState).toBe('NONE');
      expect(result.facts.roleGrants).toEqual([]);
    });

    it('returns ACTIVE role assignment state when at least one active assignment targets an active role in the membership organization', async () => {
      const { reads, resolver } = createHarness();

      reads.roleAssignments = [baseRoleAssignment];
      reads.roles = [baseRole];

      const result = await resolver.resolve(createRequest());

      expect(result.resolved).toBe(true);

      if (!result.resolved) {
        throw new Error('Expected successful fact resolution.');
      }

      expect(result.facts.roleAssignmentState).toBe('ACTIVE');
      expect(result.facts.roleGrants).toHaveLength(1);
    });

    it('constructs grants only from active assignments that target active roles in the membership organization', async () => {
      const { reads, resolver } = createHarness();

      reads.roleAssignments = [baseRoleAssignment];
      reads.roles = [baseRole];

      const result = await resolver.resolve(createRequest());

      expect(result.resolved).toBe(true);

      if (!result.resolved) {
        throw new Error('Expected successful fact resolution.');
      }

      expect(result.facts.roleGrants).toEqual([
        {
          roleId: baseRole.id,
          permissions: [
            {
              permissionKey: 'booking.read',
              scope: 'TENANT'
            }
          ]
        }
      ]);
    });

    it('keeps an effective role assignment even when the active role has no permissions', async () => {
      const { reads, resolver } = createHarness();

      reads.roleAssignments = [baseRoleAssignment];
      reads.roles = [
        {
          ...baseRole,
          permissions: []
        }
      ];

      const result = await resolver.resolve(createRequest());

      expect(result.resolved).toBe(true);

      if (!result.resolved) {
        throw new Error('Expected successful fact resolution.');
      }

      expect(result.facts.roleAssignmentState).toBe('ACTIVE');
      expect(result.facts.roleGrants).toEqual([
        {
          roleId: baseRole.id,
          permissions: []
        }
      ]);
    });

    it('ignores active assignments that target archived roles', async () => {
      const { reads, resolver } = createHarness();

      reads.roleAssignments = [baseRoleAssignment];
      reads.roles = [
        {
          ...baseRole,
          status: 'ARCHIVED'
        }
      ];

      const result = await resolver.resolve(createRequest());

      expect(result.resolved).toBe(true);

      if (!result.resolved) {
        throw new Error('Expected successful fact resolution.');
      }

      expect(result.facts.roleAssignmentState).toBe('NONE');
      expect(result.facts.roleGrants).toEqual([]);
    });

    it('ignores assignments that do not belong to the resolved membership', async () => {
      const { reads, resolver } = createHarness();

      reads.roleAssignments = [
        {
          ...baseRoleAssignment,
          membershipId: asId<Membership['id']>('membership_other')
        }
      ];
      reads.roles = [baseRole];

      const result = await resolver.resolve(createRequest());

      expect(result.resolved).toBe(true);

      if (!result.resolved) {
        throw new Error('Expected successful fact resolution.');
      }

      expect(result.facts.roleGrants).toEqual([]);
    });

    it('ignores roles that do not belong to the membership organization', async () => {
      const { reads, resolver } = createHarness();

      reads.roleAssignments = [baseRoleAssignment];
      reads.roles = [
        {
          ...baseRole,
          organizationId: otherOrganizationId
        }
      ];

      const result = await resolver.resolve(createRequest());

      expect(result.resolved).toBe(true);

      if (!result.resolved) {
        throw new Error('Expected successful fact resolution.');
      }

      expect(result.facts.roleGrants).toEqual([]);
    });

    it('grants no role authority when duplicate authoritative role IDs are returned', async () => {
      const { reads, resolver } = createHarness();

      reads.roleAssignments = [
        baseRoleAssignment,
        {
          ...baseRoleAssignment,
          id: asId<RoleAssignment['id']>('role_assignment_02')
        }
      ];
      reads.roles = [baseRole, { ...baseRole }];

      const result = await resolver.resolve(createRequest());

      expect(result.resolved).toBe(true);

      if (!result.resolved) {
        throw new Error('Expected successful fact resolution.');
      }

      expect(result.facts.roleAssignmentState).toBe('NONE');
      expect(result.facts.roleGrants).toEqual([]);
    });

    it('does not increase authority when an assignment references a role that is missing from the batch read', async () => {
      const { reads, resolver } = createHarness();

      reads.roleAssignments = [baseRoleAssignment];
      reads.roles = [];

      const result = await resolver.resolve(createRequest());

      expect(result.resolved).toBe(true);

      if (!result.resolved) {
        throw new Error('Expected successful fact resolution.');
      }

      expect(result.facts.roleAssignmentState).toBe('NONE');
      expect(result.facts.roleGrants).toEqual([]);
    });
  });

  describe('effective branch access', () => {
    it('includes only active branch access whose branch is active and belongs to the membership organization', async () => {
      const { reads, resolver } = createHarness();

      reads.branchAccess = [baseBranchAccess];
      reads.branches = [baseBranch];

      const result = await resolver.resolve(createRequest());

      expect(result.resolved).toBe(true);

      if (!result.resolved) {
        throw new Error('Expected successful fact resolution.');
      }

      expect(result.facts.branchAccess).toEqual([
        {
          branchId: asId<AuthorizationBranchId>('branch_01')
        }
      ]);
    });

    it.each(['SUSPENDED', 'REVOKED'] as const)('ignores %s branch access', async (status) => {
      const { reads, resolver } = createHarness();

      reads.branchAccess = [
        {
          ...baseBranchAccess,
          status
        }
      ];
      reads.branches = [baseBranch];

      const result = await resolver.resolve(createRequest());

      expect(result.resolved).toBe(true);

      if (!result.resolved) {
        throw new Error('Expected successful fact resolution.');
      }

      expect(result.facts.branchAccess).toEqual([]);
    });

    it.each(['SUSPENDED', 'CLOSED'] as const)('ignores access to %s branches', async (status) => {
      const { reads, resolver } = createHarness();

      reads.branchAccess = [baseBranchAccess];
      reads.branches = [
        {
          ...baseBranch,
          status
        }
      ];

      const result = await resolver.resolve(createRequest());

      expect(result.resolved).toBe(true);

      if (!result.resolved) {
        throw new Error('Expected successful fact resolution.');
      }

      expect(result.facts.branchAccess).toEqual([]);
    });

    it('ignores branch access that belongs to another membership', async () => {
      const { reads, resolver } = createHarness();

      reads.branchAccess = [
        {
          ...baseBranchAccess,
          membershipId: asId<Membership['id']>('membership_other')
        }
      ];
      reads.branches = [baseBranch];

      const result = await resolver.resolve(createRequest());

      expect(result.resolved).toBe(true);

      if (!result.resolved) {
        throw new Error('Expected successful fact resolution.');
      }

      expect(result.facts.branchAccess).toEqual([]);
    });

    it('ignores branches that belong to another organization', async () => {
      const { reads, resolver } = createHarness();

      reads.branchAccess = [baseBranchAccess];
      reads.branches = [
        {
          ...baseBranch,
          organizationId: otherOrganizationId
        }
      ];

      const result = await resolver.resolve(createRequest());

      expect(result.resolved).toBe(true);

      if (!result.resolved) {
        throw new Error('Expected successful fact resolution.');
      }

      expect(result.facts.branchAccess).toEqual([]);
    });

    it('grants no branch authority when duplicate authoritative branch IDs are returned', async () => {
      const { reads, resolver } = createHarness();

      reads.branchAccess = [
        baseBranchAccess,
        {
          ...baseBranchAccess,
          id: asId<BranchAccess['id']>('branch_access_02')
        }
      ];
      reads.branches = [baseBranch, { ...baseBranch }];

      const result = await resolver.resolve(createRequest());

      expect(result.resolved).toBe(true);

      if (!result.resolved) {
        throw new Error('Expected successful fact resolution.');
      }

      expect(result.facts.branchAccess).toEqual([]);
    });

    it('does not increase authority when branch access references a branch that is missing from the batch read', async () => {
      const { reads, resolver } = createHarness();

      reads.branchAccess = [baseBranchAccess];
      reads.branches = [];

      const result = await resolver.resolve(createRequest());

      expect(result.resolved).toBe(true);

      if (!result.resolved) {
        throw new Error('Expected successful fact resolution.');
      }

      expect(result.facts.branchAccess).toEqual([]);
    });
  });

  describe('fail-closed authority invariants', () => {
    it('never derives IdentityId by casting PrincipalId', async () => {
      const { principalResolution, reads, resolver } = createHarness();

      const mappedIdentityId = asId<IdentityId>('identity_authoritative');

      principalResolution.identityId = mappedIdentityId;
      reads.identity = {
        id: mappedIdentityId,
        status: 'ACTIVE'
      };
      reads.membership = {
        ...baseMembership,
        identityId: mappedIdentityId
      };

      const result = await resolver.resolve(createRequest());

      expect(principalResolution.calls).toEqual([principalId]);
      expect(reads.membershipReads).toContainEqual({
        identityId: mappedIdentityId,
        organizationId
      });

      expect(result.resolved).toBe(true);

      if (!result.resolved) {
        throw new Error('Expected successful fact resolution.');
      }

      expect(result.facts.subjectId).toBe(mappedIdentityId);
      expect(result.facts.subjectId).not.toBe(principalId);
    });

    it('never uses the request tenant assertion as the authoritative organization selector', async () => {
      const { reads, resolver } = createHarness();

      await resolver.resolve(
        createRequest({
          tenantId: otherTenantId
        })
      );

      expect(reads.organizationReads).toEqual([organizationId]);
      expect(reads.organizationReads).not.toContain(otherOrganizationId);
    });

    it('never treats the requested branch as proof of branch access', async () => {
      const { reads, resolver } = createHarness();

      reads.branches = [baseBranch];
      reads.branchAccess = [];

      const result = await resolver.resolve(
        createRequest({
          branchId: asId<AuthorizationBranchId>('branch_01')
        })
      );

      expect(result.resolved).toBe(true);

      if (!result.resolved) {
        throw new Error('Expected successful fact resolution.');
      }

      expect(result.facts.branchAccess).toEqual([]);
    });

    it('never creates role grants from missing authoritative role records', async () => {
      const { reads, resolver } = createHarness();

      reads.roleAssignments = [baseRoleAssignment];
      reads.roles = [];

      const result = await resolver.resolve(createRequest());

      expect(result.resolved).toBe(true);

      if (!result.resolved) {
        throw new Error('Expected successful fact resolution.');
      }

      expect(result.facts.roleGrants).toEqual([]);
      expect(result.facts.roleAssignmentState).toBe('NONE');
    });

    it('never creates branch access from missing authoritative branch records', async () => {
      const { reads, resolver } = createHarness();

      reads.branchAccess = [baseBranchAccess];
      reads.branches = [];

      const result = await resolver.resolve(createRequest());

      expect(result.resolved).toBe(true);

      if (!result.resolved) {
        throw new Error('Expected successful fact resolution.');
      }

      expect(result.facts.branchAccess).toEqual([]);
    });
  });
});
