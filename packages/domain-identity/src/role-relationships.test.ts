import { describe, expect, it } from 'vitest';

import { asOpaqueId } from '@segaloka/shared-kernel';

import {
  isActiveRoleAssignment,
  roleAssignmentBelongsToMembership,
  roleAssignmentTargetsRole,
  roleBelongsToMembershipOrganization
} from './role-relationships.js';

import type { Membership } from './membership.js';
import type { Role } from './role.js';
import type { RoleAssignment } from './role-assignment.js';

const membership: Membership = {
  id: asOpaqueId<'MembershipId'>('membership_01'),
  identityId: asOpaqueId<'IdentityId'>('identity_01'),
  organizationId: asOpaqueId<'OrganizationId'>('organization_01'),
  status: 'ACTIVE'
};

const role: Role = {
  id: asOpaqueId<'RoleId'>('role_01'),
  organizationId: membership.organizationId,
  name: 'Branch Manager',
  kind: 'SYSTEM',
  status: 'ACTIVE',
  permissions: [
    {
      permissionKey: 'booking.read',
      scope: 'BRANCH'
    }
  ]
};

const assignment: RoleAssignment = {
  id: asOpaqueId<'RoleAssignmentId'>('assignment_01'),
  membershipId: membership.id,
  roleId: role.id,
  status: 'ACTIVE'
};

describe('Role relationships', () => {
  it('matches role to membership organization', () => {
    expect(roleBelongsToMembershipOrganization(role, membership)).toBe(true);
  });

  it('matches assignment to membership', () => {
    expect(roleAssignmentBelongsToMembership(assignment, membership)).toBe(true);
  });

  it('matches assignment to role', () => {
    expect(roleAssignmentTargetsRole(assignment, role)).toBe(true);
  });

  it('recognizes an active role assignment', () => {
    expect(isActiveRoleAssignment(assignment, role, membership)).toBe(true);
  });

  it('rejects role from another organization', () => {
    const foreignRole: Role = {
      ...role,
      organizationId: asOpaqueId<'OrganizationId'>('organization_02')
    };

    expect(isActiveRoleAssignment(assignment, foreignRole, membership)).toBe(false);
  });

  it('rejects revoked assignment', () => {
    const revokedAssignment: RoleAssignment = {
      ...assignment,
      status: 'REVOKED'
    };

    expect(isActiveRoleAssignment(revokedAssignment, role, membership)).toBe(false);
  });

  it('rejects archived role', () => {
    const archivedRole: Role = {
      ...role,
      status: 'ARCHIVED'
    };

    expect(isActiveRoleAssignment(assignment, archivedRole, membership)).toBe(false);
  });

  it('rejects suspended membership', () => {
    const suspendedMembership: Membership = {
      ...membership,
      status: 'SUSPENDED'
    };

    expect(isActiveRoleAssignment(assignment, role, suspendedMembership)).toBe(false);
  });
});
