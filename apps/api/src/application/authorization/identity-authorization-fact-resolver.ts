import type {
  AuthorizationBranchAccess,
  AuthorizationIdentityState,
  AuthorizationMembershipState,
  AuthorizationOrganizationState,
  AuthorizationRoleAssignmentState,
  AuthorizationRoleGrant,
  AuthorizationSubjectId,
  BranchId,
  PrincipalId,
  TenantId,
  WorkspaceId
} from '@segaloka/auth';

export const IDENTITY_AUTHORIZATION_FACT_RESOLUTION_FAILURE_REASONS = [
  'WORKSPACE_NOT_FOUND',
  'ORGANIZATION_NOT_FOUND',
  'TENANT_ASSERTION_MISMATCH',
  'BRANCH_NOT_FOUND',
  'BRANCH_ORGANIZATION_MISMATCH'
] as const;

export type IdentityAuthorizationFactResolutionFailureReason =
  (typeof IDENTITY_AUTHORIZATION_FACT_RESOLUTION_FAILURE_REASONS)[number];

export interface IdentityAuthorizationFactResolutionRequest {
  readonly principalId: PrincipalId;
  readonly workspaceId: WorkspaceId;
  readonly tenantId: TenantId;
  readonly branchId?: BranchId;
}

export interface IdentityAuthorizationFacts {
  readonly subjectId?: AuthorizationSubjectId;
  readonly tenantId: TenantId;
  readonly identityState: AuthorizationIdentityState;
  readonly membershipState: AuthorizationMembershipState;
  readonly organizationState: AuthorizationOrganizationState;
  readonly roleAssignmentState: AuthorizationRoleAssignmentState;
  readonly roleGrants: readonly AuthorizationRoleGrant[];
  readonly branchAccess: readonly AuthorizationBranchAccess[];
}

export interface IdentityAuthorizationFactResolutionSuccess {
  readonly resolved: true;
  readonly facts: IdentityAuthorizationFacts;
}

export interface IdentityAuthorizationFactResolutionFailure {
  readonly resolved: false;
  readonly reason: IdentityAuthorizationFactResolutionFailureReason;
}

export type IdentityAuthorizationFactResolutionResult =
  | IdentityAuthorizationFactResolutionSuccess
  | IdentityAuthorizationFactResolutionFailure;

export interface IdentityAuthorizationFactResolver {
  resolve(
    request: IdentityAuthorizationFactResolutionRequest
  ): Promise<IdentityAuthorizationFactResolutionResult>;
}
