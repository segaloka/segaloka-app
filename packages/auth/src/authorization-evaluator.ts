import type {
  AuthorizationScope,
  PermissionDefinition,
  PermissionRegistry
} from '@segaloka/platform-registry';

import { getPermission, isScopeAllowedForPermission } from '@segaloka/platform-registry';

import { allowAuthorization, denyAuthorization } from './authorization-decision.js';

import { assertValidAuthorizationEvaluationInput } from './authorization-evaluation-invariant.js';

import type { AuthorizationDecision, AuthorizationDenyReason } from './authorization-contract.js';

import type {
  AuthorizationEvaluationInput,
  AuthorizationPermissionGrant
} from './authorization-evaluation.js';

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
        input.resource.ownerSubjectId === input.subjectId
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

function scopeFailureReason(scope: AuthorizationScope): AuthorizationDenyReason {
  switch (scope) {
    case 'BRANCH':
      return 'BRANCH_ACCESS_REQUIRED';

    case 'OWN':
      return 'RESOURCE_OWNERSHIP_REQUIRED';

    case 'ASSIGNED':
      return 'RESOURCE_ASSIGNMENT_REQUIRED';

    case 'RELATIONSHIP':
      return 'RELATIONSHIP_REQUIRED';

    case 'GLOBAL':
    case 'TENANT':
    case 'PUBLIC':
      return 'SCOPE_NOT_SATISFIED';
  }
}

function filterRegistryAllowedGrants(
  permission: PermissionDefinition,
  grants: readonly AuthorizationPermissionGrant[]
): readonly AuthorizationPermissionGrant[] {
  return grants.filter((grant) => isScopeAllowedForPermission(permission, grant.scope));
}

function selectScopeFailureReason(
  grants: readonly AuthorizationPermissionGrant[]
): AuthorizationDenyReason {
  const reasons = grants.map((grant) => scopeFailureReason(grant.scope));

  const precedence: readonly AuthorizationDenyReason[] = [
    'BRANCH_ACCESS_REQUIRED',
    'RESOURCE_OWNERSHIP_REQUIRED',
    'RESOURCE_ASSIGNMENT_REQUIRED',
    'RELATIONSHIP_REQUIRED',
    'SCOPE_NOT_SATISFIED'
  ];

  return precedence.find((reason) => reasons.includes(reason)) ?? 'SCOPE_NOT_SATISFIED';
}

export function evaluateAuthorization(
  input: AuthorizationEvaluationInput,
  registry: PermissionRegistry
): AuthorizationDecision {
  assertValidAuthorizationEvaluationInput(input);

  if (input.context.principalId === undefined) {
    return denyAuthorization(input.permissionKey, 'UNAUTHENTICATED');
  }

  const permission = getPermission(registry, input.permissionKey);

  if (permission === undefined) {
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

  const matchingGrants = findPermissionGrants(input);

  if (matchingGrants.length === 0) {
    return denyAuthorization(input.permissionKey, 'PERMISSION_NOT_GRANTED');
  }

  const validGrants = filterRegistryAllowedGrants(permission, matchingGrants);

  if (validGrants.length === 0) {
    return denyAuthorization(input.permissionKey, 'SCOPE_NOT_SATISFIED');
  }

  const satisfiedGrant = validGrants.find((grant) => isScopeSatisfied(input, grant.scope));

  if (satisfiedGrant === undefined) {
    return denyAuthorization(input.permissionKey, selectScopeFailureReason(validGrants));
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
