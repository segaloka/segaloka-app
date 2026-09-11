import { databaseSchema, type DatabaseConnection } from '@segaloka/database';
import {
  BRANCH_ACCESS_STATUSES,
  BRANCH_STATUSES,
  IDENTITY_STATUSES,
  MEMBERSHIP_STATUSES,
  ORGANIZATION_STATUSES,
  ORGANIZATION_TYPES,
  ROLE_ASSIGNMENT_STATUSES,
  ROLE_KINDS,
  ROLE_STATUSES,
  type Branch,
  type BranchAccess,
  type BranchAccessStatus,
  type BranchId,
  type BranchStatus,
  type Identity,
  type IdentityAuthorizationReadPort,
  type IdentityId,
  type IdentityStatus,
  type Membership,
  type MembershipStatus,
  type Organization,
  type OrganizationId,
  type OrganizationStatus,
  type OrganizationType,
  type Role,
  type RoleAssignment,
  type RoleAssignmentStatus,
  type RoleId,
  type RoleKind,
  type RolePermission,
  type RoleStatus,
  type Workspace,
  type WorkspaceId
} from '@segaloka/domain-identity';
import { isAuthorizationScope, isPermissionKey } from '@segaloka/platform-registry';
import { asOpaqueId } from '@segaloka/shared-kernel';
import { and, asc, eq, inArray } from 'drizzle-orm';

import { IdentityAuthorizationPersistenceError } from './persistence-error.js';

function isIdentityStatus(value: string): value is IdentityStatus {
  return IDENTITY_STATUSES.some((status) => status === value);
}

function isOrganizationType(value: string): value is OrganizationType {
  return ORGANIZATION_TYPES.some((type) => type === value);
}

function isOrganizationStatus(value: string): value is OrganizationStatus {
  return ORGANIZATION_STATUSES.some((status) => status === value);
}

function isMembershipStatus(value: string): value is MembershipStatus {
  return MEMBERSHIP_STATUSES.some((status) => status === value);
}

function isBranchAccessStatus(value: string): value is BranchAccessStatus {
  return BRANCH_ACCESS_STATUSES.some((status) => status === value);
}

function isBranchStatus(value: string): value is BranchStatus {
  return BRANCH_STATUSES.some((status) => status === value);
}

function isRoleAssignmentStatus(value: string): value is RoleAssignmentStatus {
  return ROLE_ASSIGNMENT_STATUSES.some((status) => status === value);
}

function isRoleKind(value: string): value is RoleKind {
  return ROLE_KINDS.some((kind) => kind === value);
}

function isRoleStatus(value: string): value is RoleStatus {
  return ROLE_STATUSES.some((status) => status === value);
}

function mapIdentity(row: { readonly id: string; readonly status: string }): Identity {
  if (!isIdentityStatus(row.status)) {
    throw new IdentityAuthorizationPersistenceError(
      'INVALID_IDENTITY_STATUS',
      `Persisted identity status is invalid: ${row.status}`
    );
  }

  return Object.freeze({
    id: asOpaqueId<'IdentityId'>(row.id),
    status: row.status
  });
}

function mapWorkspace(row: { readonly id: string; readonly organizationId: string }): Workspace {
  return Object.freeze({
    id: asOpaqueId<'WorkspaceId'>(row.id),
    organizationId: asOpaqueId<'OrganizationId'>(row.organizationId)
  });
}

function mapOrganization(row: {
  readonly id: string;
  readonly type: string;
  readonly status: string;
}): Organization {
  if (!isOrganizationType(row.type)) {
    throw new IdentityAuthorizationPersistenceError(
      'INVALID_ORGANIZATION_TYPE',
      `Persisted organization type is invalid: ${row.type}`
    );
  }

  if (!isOrganizationStatus(row.status)) {
    throw new IdentityAuthorizationPersistenceError(
      'INVALID_ORGANIZATION_STATUS',
      `Persisted organization status is invalid: ${row.status}`
    );
  }

  return Object.freeze({
    id: asOpaqueId<'OrganizationId'>(row.id),
    type: row.type,
    status: row.status
  });
}

function mapMembership(row: {
  readonly id: string;
  readonly identityId: string;
  readonly organizationId: string;
  readonly status: string;
}): Membership {
  if (!isMembershipStatus(row.status)) {
    throw new IdentityAuthorizationPersistenceError(
      'INVALID_MEMBERSHIP_STATUS',
      `Persisted membership status is invalid: ${row.status}`
    );
  }

  return Object.freeze({
    id: asOpaqueId<'MembershipId'>(row.id),
    identityId: asOpaqueId<'IdentityId'>(row.identityId),
    organizationId: asOpaqueId<'OrganizationId'>(row.organizationId),
    status: row.status
  });
}

function mapBranchAccess(row: {
  readonly id: string;
  readonly membershipId: string;
  readonly branchId: string;
  readonly status: string;
}): BranchAccess {
  if (!isBranchAccessStatus(row.status)) {
    throw new IdentityAuthorizationPersistenceError(
      'INVALID_BRANCH_ACCESS_STATUS',
      `Persisted branch access status is invalid: ${row.status}`
    );
  }

  return Object.freeze({
    id: asOpaqueId<'BranchAccessId'>(row.id),
    membershipId: asOpaqueId<'MembershipId'>(row.membershipId),
    branchId: asOpaqueId<'BranchId'>(row.branchId),
    status: row.status
  });
}

function mapBranch(row: {
  readonly id: string;
  readonly organizationId: string;
  readonly status: string;
}): Branch {
  if (!isBranchStatus(row.status)) {
    throw new IdentityAuthorizationPersistenceError(
      'INVALID_BRANCH_STATUS',
      `Persisted branch status is invalid: ${row.status}`
    );
  }

  return Object.freeze({
    id: asOpaqueId<'BranchId'>(row.id),
    organizationId: asOpaqueId<'OrganizationId'>(row.organizationId),
    status: row.status
  });
}

function mapRoleAssignment(row: {
  readonly id: string;
  readonly membershipId: string;
  readonly roleId: string;
  readonly status: string;
}): RoleAssignment {
  if (!isRoleAssignmentStatus(row.status)) {
    throw new IdentityAuthorizationPersistenceError(
      'INVALID_ROLE_ASSIGNMENT_STATUS',
      `Persisted role assignment status is invalid: ${row.status}`
    );
  }

  return Object.freeze({
    id: asOpaqueId<'RoleAssignmentId'>(row.id),
    membershipId: asOpaqueId<'MembershipId'>(row.membershipId),
    roleId: asOpaqueId<'RoleId'>(row.roleId),
    status: row.status
  });
}

function mapRolePermission(row: {
  readonly permissionKey: string;
  readonly scope: string;
}): RolePermission {
  if (!isPermissionKey(row.permissionKey)) {
    throw new IdentityAuthorizationPersistenceError(
      'INVALID_PERMISSION_KEY',
      `Persisted permission key is invalid: ${row.permissionKey}`
    );
  }

  if (!isAuthorizationScope(row.scope)) {
    throw new IdentityAuthorizationPersistenceError(
      'INVALID_PERMISSION_SCOPE',
      `Persisted permission scope is invalid: ${row.scope}`
    );
  }

  return Object.freeze({
    permissionKey: row.permissionKey,
    scope: row.scope
  });
}

function mapRole(
  row: {
    readonly id: string;
    readonly organizationId: string;
    readonly name: string;
    readonly kind: string;
    readonly status: string;
  },
  permissions: readonly RolePermission[]
): Role {
  if (!isRoleKind(row.kind)) {
    throw new IdentityAuthorizationPersistenceError(
      'INVALID_ROLE_KIND',
      `Persisted role kind is invalid: ${row.kind}`
    );
  }

  if (!isRoleStatus(row.status)) {
    throw new IdentityAuthorizationPersistenceError(
      'INVALID_ROLE_STATUS',
      `Persisted role status is invalid: ${row.status}`
    );
  }

  return Object.freeze({
    id: asOpaqueId<'RoleId'>(row.id),
    organizationId: asOpaqueId<'OrganizationId'>(row.organizationId),
    name: row.name,
    kind: row.kind,
    status: row.status,
    permissions: Object.freeze([...permissions])
  });
}

export class PostgresIdentityAuthorizationReadAdapter implements IdentityAuthorizationReadPort {
  constructor(private readonly connection: DatabaseConnection) {}

  async findIdentityById(identityId: IdentityId): Promise<Identity | undefined> {
    const rows = await this.connection.db
      .select({
        id: databaseSchema.identities.id,
        status: databaseSchema.identities.status
      })
      .from(databaseSchema.identities)
      .where(eq(databaseSchema.identities.id, identityId))
      .limit(1);

    const row = rows[0];

    if (row === undefined) {
      return undefined;
    }

    return mapIdentity(row);
  }

  async findWorkspaceById(workspaceId: WorkspaceId): Promise<Workspace | undefined> {
    const rows = await this.connection.db
      .select({
        id: databaseSchema.workspaces.id,
        organizationId: databaseSchema.workspaces.organizationId
      })
      .from(databaseSchema.workspaces)
      .where(eq(databaseSchema.workspaces.id, workspaceId))
      .limit(1);

    const row = rows[0];

    if (row === undefined) {
      return undefined;
    }

    return mapWorkspace(row);
  }

  async findOrganizationById(organizationId: OrganizationId): Promise<Organization | undefined> {
    const rows = await this.connection.db
      .select({
        id: databaseSchema.organizations.id,
        type: databaseSchema.organizations.type,
        status: databaseSchema.organizations.status
      })
      .from(databaseSchema.organizations)
      .where(eq(databaseSchema.organizations.id, organizationId))
      .limit(1);

    const row = rows[0];

    if (row === undefined) {
      return undefined;
    }

    return mapOrganization(row);
  }

  async findMembership(
    identityId: IdentityId,
    organizationId: OrganizationId
  ): Promise<Membership | undefined> {
    const rows = await this.connection.db
      .select({
        id: databaseSchema.memberships.id,
        identityId: databaseSchema.memberships.identityId,
        organizationId: databaseSchema.memberships.organizationId,
        status: databaseSchema.memberships.status
      })
      .from(databaseSchema.memberships)
      .where(
        and(
          eq(databaseSchema.memberships.identityId, identityId),
          eq(databaseSchema.memberships.organizationId, organizationId)
        )
      )
      .limit(1);

    const row = rows[0];

    if (row === undefined) {
      return undefined;
    }

    return mapMembership(row);
  }

  async listBranchAccessForMembership(
    membershipId: Membership['id']
  ): Promise<readonly BranchAccess[]> {
    const rows = await this.connection.db
      .select({
        id: databaseSchema.branchAccess.id,
        membershipId: databaseSchema.branchAccess.membershipId,
        branchId: databaseSchema.branchAccess.branchId,
        status: databaseSchema.branchAccess.status
      })
      .from(databaseSchema.branchAccess)
      .where(eq(databaseSchema.branchAccess.membershipId, membershipId))
      .orderBy(asc(databaseSchema.branchAccess.id));

    return rows.map(mapBranchAccess);
  }

  async findBranchesByIds(branchIds: readonly BranchId[]): Promise<readonly Branch[]> {
    if (branchIds.length === 0) {
      return [];
    }

    const rows = await this.connection.db
      .select({
        id: databaseSchema.branches.id,
        organizationId: databaseSchema.branches.organizationId,
        status: databaseSchema.branches.status
      })
      .from(databaseSchema.branches)
      .where(inArray(databaseSchema.branches.id, branchIds))
      .orderBy(asc(databaseSchema.branches.id));

    return rows.map(mapBranch);
  }

  async listRoleAssignmentsForMembership(
    membershipId: Membership['id']
  ): Promise<readonly RoleAssignment[]> {
    const rows = await this.connection.db
      .select({
        id: databaseSchema.roleAssignments.id,
        membershipId: databaseSchema.roleAssignments.membershipId,
        roleId: databaseSchema.roleAssignments.roleId,
        status: databaseSchema.roleAssignments.status
      })
      .from(databaseSchema.roleAssignments)
      .where(eq(databaseSchema.roleAssignments.membershipId, membershipId))
      .orderBy(asc(databaseSchema.roleAssignments.id));

    return rows.map(mapRoleAssignment);
  }

  async findRolesByIds(roleIds: readonly RoleId[]): Promise<readonly Role[]> {
    if (roleIds.length === 0) {
      return [];
    }

    const roleRows = await this.connection.db
      .select({
        id: databaseSchema.roles.id,
        organizationId: databaseSchema.roles.organizationId,
        name: databaseSchema.roles.name,
        kind: databaseSchema.roles.kind,
        status: databaseSchema.roles.status
      })
      .from(databaseSchema.roles)
      .where(inArray(databaseSchema.roles.id, roleIds))
      .orderBy(asc(databaseSchema.roles.id));

    if (roleRows.length === 0) {
      return [];
    }

    const returnedRoleIds = roleRows.map((row) => row.id);

    const permissionRows = await this.connection.db
      .select({
        roleId: databaseSchema.rolePermissions.roleId,
        permissionKey: databaseSchema.rolePermissions.permissionKey,
        scope: databaseSchema.rolePermissions.scope
      })
      .from(databaseSchema.rolePermissions)
      .where(inArray(databaseSchema.rolePermissions.roleId, returnedRoleIds))
      .orderBy(
        asc(databaseSchema.rolePermissions.roleId),
        asc(databaseSchema.rolePermissions.permissionKey)
      );

    const permissionsByRoleId = new Map<string, RolePermission[]>();

    for (const row of permissionRows) {
      const permission = mapRolePermission(row);
      const existingPermissions = permissionsByRoleId.get(row.roleId);

      if (existingPermissions === undefined) {
        permissionsByRoleId.set(row.roleId, [permission]);
        continue;
      }

      existingPermissions.push(permission);
    }

    return roleRows.map((row) => mapRole(row, permissionsByRoleId.get(row.id) ?? []));
  }
}
