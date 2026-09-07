import type { Membership } from './membership.js';
import type { Role } from './role.js';
import type { RoleAssignment } from './role-assignment.js';

export function roleBelongsToMembershipOrganization(role: Role, membership: Membership): boolean {
  return role.organizationId === membership.organizationId;
}

export function roleAssignmentBelongsToMembership(
  assignment: RoleAssignment,
  membership: Membership
): boolean {
  return assignment.membershipId === membership.id;
}

export function roleAssignmentTargetsRole(assignment: RoleAssignment, role: Role): boolean {
  return assignment.roleId === role.id;
}

export function isActiveRoleAssignment(
  assignment: RoleAssignment,
  role: Role,
  membership: Membership
): boolean {
  return (
    assignment.status === 'ACTIVE' &&
    role.status === 'ACTIVE' &&
    membership.status === 'ACTIVE' &&
    assignment.membershipId === membership.id &&
    assignment.roleId === role.id &&
    role.organizationId === membership.organizationId
  );
}
