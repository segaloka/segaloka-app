import type { AuthorizationScope, PermissionKey } from '@segaloka/platform-registry';

import type {
  AuthorizationResourceContext,
  AuthorizationSubjectId
} from './authorization-contract.js';

import type { BranchId, RequestContext, TenantId } from './request-context.js';

export const AUTHORIZATION_MEMBERSHIP_STATES = ['ACTIVE', 'INACTIVE'] as const;

export type AuthorizationMembershipState = (typeof AUTHORIZATION_MEMBERSHIP_STATES)[number];

export const AUTHORIZATION_ORGANIZATION_STATES = ['ACTIVE', 'INACTIVE'] as const;

export type AuthorizationOrganizationState = (typeof AUTHORIZATION_ORGANIZATION_STATES)[number];

export const AUTHORIZATION_POLICY_STATES = ['NOT_REQUIRED', 'SATISFIED', 'UNSATISFIED'] as const;

export type AuthorizationPolicyState = (typeof AUTHORIZATION_POLICY_STATES)[number];

export interface AuthorizationPermissionGrant {
  readonly permissionKey: PermissionKey;
  readonly scope: AuthorizationScope;
}

export interface AuthorizationRoleGrant {
  readonly roleId: string;
  readonly permissions: readonly AuthorizationPermissionGrant[];
}

export interface AuthorizationBranchAccess {
  readonly branchId: BranchId;
}

export interface AuthorizationEvaluationInput {
  readonly context: RequestContext;
  readonly subjectId: AuthorizationSubjectId;
  readonly tenantId: TenantId;
  readonly membershipState: AuthorizationMembershipState;
  readonly organizationState: AuthorizationOrganizationState;
  readonly roleGrants: readonly AuthorizationRoleGrant[];
  readonly branchAccess: readonly AuthorizationBranchAccess[];
  readonly resource?: AuthorizationResourceContext;
  readonly entitlementState: AuthorizationPolicyState;
  readonly capabilityState: AuthorizationPolicyState;
  readonly relationshipState: AuthorizationPolicyState;
}
