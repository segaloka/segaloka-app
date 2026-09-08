import type { OpaqueId } from '@segaloka/shared-kernel';

import type { AuthorizationScope, PermissionKey } from '@segaloka/platform-registry';

import type { BranchId, RequestContext, TenantId } from './request-context.js';

export type AuthorizationSubjectId = OpaqueId<'AuthorizationSubjectId'>;

export interface AuthorizationResourceContext {
  readonly tenantId?: TenantId;
  readonly branchId?: BranchId;
  readonly ownerSubjectId?: AuthorizationSubjectId;
  readonly assignedSubjectIds?: readonly AuthorizationSubjectId[];
}

export interface AuthorizationRequest {
  readonly context: RequestContext;
  readonly permissionKey: PermissionKey;
  readonly resource?: AuthorizationResourceContext;
}

export const AUTHORIZATION_DENY_REASONS = [
  'UNAUTHENTICATED',
  'UNKNOWN_PERMISSION',
  'IDENTITY_REQUIRED',
  'IDENTITY_INACTIVE',
  'MEMBERSHIP_REQUIRED',
  'MEMBERSHIP_INACTIVE',
  'ORGANIZATION_INACTIVE',
  'NO_ACTIVE_ROLE_ASSIGNMENT',
  'PERMISSION_NOT_GRANTED',
  'SCOPE_NOT_SATISFIED',
  'TENANT_MISMATCH',
  'BRANCH_ACCESS_REQUIRED',
  'RESOURCE_OWNERSHIP_REQUIRED',
  'RESOURCE_ASSIGNMENT_REQUIRED',
  'RELATIONSHIP_REQUIRED',
  'ENTITLEMENT_REQUIRED',
  'CAPABILITY_RESTRICTED',
  'RISK_POLICY_DENIED'
] as const;

export type AuthorizationDenyReason = (typeof AUTHORIZATION_DENY_REASONS)[number];

export interface AuthorizationAllowDecision {
  readonly allowed: true;
  readonly permissionKey: PermissionKey;
  readonly satisfiedScope: AuthorizationScope;
}

export interface AuthorizationDenyDecision {
  readonly allowed: false;
  readonly permissionKey: PermissionKey;
  readonly reason: AuthorizationDenyReason;
}

export type AuthorizationDecision = AuthorizationAllowDecision | AuthorizationDenyDecision;
