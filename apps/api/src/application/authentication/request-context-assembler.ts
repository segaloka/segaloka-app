import type {
  BranchId,
  PrincipalId,
  RequestContext,
  RequestId,
  RiskLevel,
  SupportedLocale,
  TenantId,
  WorkspaceId
} from '@segaloka/auth';

export interface RequestContextAssemblyInput {
  readonly requestId: RequestId;
  readonly principalId?: PrincipalId;
  readonly tenantId?: TenantId;
  readonly workspaceId?: WorkspaceId;
  readonly branchId?: BranchId;
  readonly locale: SupportedLocale;
  readonly riskLevel: RiskLevel;
}

export interface RequestContextAssembler {
  assemble(input: RequestContextAssemblyInput): RequestContext;
}

export class DefaultRequestContextAssembler implements RequestContextAssembler {
  public assemble(input: RequestContextAssemblyInput): RequestContext {
    return {
      requestId: input.requestId,
      ...(input.principalId === undefined
        ? {}
        : {
            principalId: input.principalId
          }),
      ...(input.tenantId === undefined
        ? {}
        : {
            tenantId: input.tenantId
          }),
      ...(input.workspaceId === undefined
        ? {}
        : {
            workspaceId: input.workspaceId
          }),
      ...(input.branchId === undefined
        ? {}
        : {
            branchId: input.branchId
          }),
      locale: input.locale,
      riskLevel: input.riskLevel
    };
  }
}
