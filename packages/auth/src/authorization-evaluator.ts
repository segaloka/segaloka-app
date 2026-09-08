import type { AuthorizationScope, PermissionRegistry } from '@segaloka/platform-registry';

import { getPermission } from '@segaloka/platform-registry';

import { allowAuthorization, denyAuthorization } from './authorization-decision.js';

import type { AuthorizationDecision } from './authorization-contract.js';

import type {
  AuthorizationEvaluationInput,
  AuthorizationPermissionGrant
} from './authorization-evaluation.js';

function isSameValue(left: string | undefined, right: string | undefined): boolean {
  return left === right;
}

function findPermissionGrants(
  input: AuthorizationEvaluationInput
): readonly AuthorizationPermissionGrant[] {
  return input.roleGrants.flatMap((roleGrant) =>
    roleGrant.permissions.filter((permission) => permission.permissionKey === input.permissionKey)
  );
}

function hasBranchAccess(input: AuthorizationEvaluationInput, branchId: string): boolean {
  return input.branchAccess.some((access) => access.branchId === branchId);
}

function isScopeSatisfied(input: AuthorizationEvaluationInput, scope: AuthorizationScope): boolean {
  switch (scope) {
    case 'GLOBAL':
      return true;

    case 'TENANT':
      return input.resource?.tenantId === undefined || input.resource.tenantId === input.tenantId;

    case 'BRANCH': {
      const branchId = input.resource?.branchId ?? input.context.branchId;

      return branchId !== undefined && hasBranchAccess(input, branchId);
    }

    case 'OWN':
      return (
        input.subjectId !== undefined &&
        input.resource?.ownerSubjectId !== undefined &&
        isSameValue(input.subjectId, input.resource.ownerSubjectId)
      );

    case 'ASSIGNED':
      return (
        input.subjectId !== undefined &&
        input.resource?.assignedSubjectIds?.some((subjectId) => subjectId === input.subjectId) ===
          true
      );

    case 'RELATIONSHIP':
      return input.relationshipState === 'SATISFIED';

    case 'PUBLIC':
      return false;
  }
}

export function evaluateAuthorization(
  input: AuthorizationEvaluationInput,
  registry: PermissionRegistry
): AuthorizationDecision {
  if (input.context.principalId === undefined) {
    return denyAuthorization(input.permissionKey, 'UNAUTHENTICATED');
  }

  if (getPermission(registry, input.permissionKey) === undefined) {
    return denyAuthorization(input.permissionKey, 'UNKNOWN_PERMISSION');
  }

  if (input.membershipState === 'MISSING') {
    return denyAuthorization(input.permissionKey, 'MEMBERSHIP_REQUIRED');
  }

  if (input.membershipState === 'INACTIVE') {
    return denyAuthorization(input.permissionKey, 'MEMBERSHIP_INACTIVE');
  }

  if (input.organizationState === 'INACTIVE') {
    return denyAuthorization(input.permissionKey, 'ORGANIZATION_INACTIVE');
  }

  if (input.context.tenantId !== undefined && input.context.tenantId !== input.tenantId) {
    return denyAuthorization(input.permissionKey, 'TENANT_MISMATCH');
  }

  if (input.resource?.tenantId !== undefined && input.resource.tenantId !== input.tenantId) {
    return denyAuthorization(input.permissionKey, 'TENANT_MISMATCH');
  }

  if (input.roleAssignmentState === 'NONE') {
    return denyAuthorization(input.permissionKey, 'NO_ACTIVE_ROLE_ASSIGNMENT');
  }

  const permissionGrants = findPermissionGrants(input);

  if (permissionGrants.length === 0) {
    return denyAuthorization(input.permissionKey, 'PERMISSION_NOT_GRANTED');
  }

  const satisfiedGrant = permissionGrants.find((grant) => isScopeSatisfied(input, grant.scope));

  if (satisfiedGrant === undefined) {
    return denyAuthorization(input.permissionKey, 'SCOPE_NOT_SATISFIED');
  }

  if (input.entitlementState === 'UNSATISFIED') {
    return denyAuthorization(input.permissionKey, 'ENTITLEMENT_REQUIRED');
  }

  if (input.capabilityState === 'UNSATISFIED') {
    return denyAuthorization(input.permissionKey, 'CAPABILITY_RESTRICTED');
  }

  if (input.riskPolicyState === 'UNSATISFIED') {
    return denyAuthorization(input.permissionKey, 'RISK_POLICY_DENIED');
  }

  return allowAuthorization(input.permissionKey, satisfiedGrant.scope);
}
