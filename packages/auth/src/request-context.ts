import type { OpaqueId } from '@segaloka/shared-kernel';

export type PrincipalId = OpaqueId<'PrincipalId'>;
export type TenantId = OpaqueId<'TenantId'>;
export type WorkspaceId = OpaqueId<'WorkspaceId'>;
export type BranchId = OpaqueId<'BranchId'>;
export type RequestId = OpaqueId<'RequestId'>;

export const SUPPORTED_LOCALES = ['id', 'en', 'ar'] as const;

export type SupportedLocale = (typeof SUPPORTED_LOCALES)[number];

export const RISK_LEVELS = ['LOW', 'MEDIUM', 'HIGH', 'CRITICAL'] as const;

export type RiskLevel = (typeof RISK_LEVELS)[number];

export interface RequestContext {
  readonly requestId: RequestId;
  readonly principalId?: PrincipalId;
  readonly tenantId?: TenantId;
  readonly workspaceId?: WorkspaceId;
  readonly branchId?: BranchId;
  readonly locale: SupportedLocale;
  readonly riskLevel: RiskLevel;
}

export function isAuthenticatedContext(context: RequestContext): context is RequestContext & {
  readonly principalId: PrincipalId;
} {
  return context.principalId !== undefined;
}
