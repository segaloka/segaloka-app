import type {
  AuthorizationSubjectId,
  BranchId as AuthorizationBranchId,
  TenantId,
  WorkspaceId as AuthorizationWorkspaceId
} from '@segaloka/auth';

import type {
  BranchId as IdentityBranchId,
  IdentityId,
  OrganizationId,
  WorkspaceId as IdentityWorkspaceId
} from '@segaloka/domain-identity';

export function toIdentityWorkspaceId(workspaceId: AuthorizationWorkspaceId): IdentityWorkspaceId {
  return workspaceId;
}

export function toIdentityBranchId(branchId: AuthorizationBranchId): IdentityBranchId {
  return branchId;
}

export function toAuthorizationBranchId(branchId: IdentityBranchId): AuthorizationBranchId {
  return branchId;
}

export function toAuthorizationTenantId(organizationId: OrganizationId): TenantId {
  return organizationId as unknown as TenantId;
}

export function toAuthorizationSubjectId(identityId: IdentityId): AuthorizationSubjectId {
  return identityId as unknown as AuthorizationSubjectId;
}
