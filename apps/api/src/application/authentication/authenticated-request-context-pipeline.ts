import type {
  BranchId,
  RequestContext,
  RequestId,
  RiskLevel,
  SupportedLocale,
  TenantId,
  VerifiedExternalIdentity,
  WorkspaceId
} from '@segaloka/auth';

import type {
  AuthenticationPrincipalResolutionFailureReason,
  AuthenticationPrincipalResolver
} from './authentication-principal-resolver.js';
import type { RequestContextAssembler } from './request-context-assembler.js';

export interface AuthenticatedRequestContextPipelineInput {
  readonly externalIdentity: VerifiedExternalIdentity;
  readonly requestId: RequestId;
  readonly tenantId?: TenantId;
  readonly workspaceId?: WorkspaceId;
  readonly branchId?: BranchId;
  readonly locale: SupportedLocale;
  readonly riskLevel: RiskLevel;
}

export interface AuthenticatedRequestContextPipelineSuccess {
  readonly completed: true;
  readonly context: RequestContext & {
    readonly principalId: NonNullable<RequestContext['principalId']>;
  };
}

export interface AuthenticatedRequestContextPipelineFailure {
  readonly completed: false;
  readonly reason: AuthenticationPrincipalResolutionFailureReason;
}

export type AuthenticatedRequestContextPipelineResult =
  | AuthenticatedRequestContextPipelineSuccess
  | AuthenticatedRequestContextPipelineFailure;

export interface AuthenticatedRequestContextPipeline {
  execute(
    input: AuthenticatedRequestContextPipelineInput
  ): Promise<AuthenticatedRequestContextPipelineResult>;
}

export interface DefaultAuthenticatedRequestContextPipelineDependencies {
  readonly principalResolver: AuthenticationPrincipalResolver;
  readonly contextAssembler: RequestContextAssembler;
}

export class DefaultAuthenticatedRequestContextPipeline
  implements AuthenticatedRequestContextPipeline
{
  public constructor(
    private readonly dependencies: DefaultAuthenticatedRequestContextPipelineDependencies
  ) {}

  public async execute(
    input: AuthenticatedRequestContextPipelineInput
  ): Promise<AuthenticatedRequestContextPipelineResult> {
    const principalResolution = await this.dependencies.principalResolver.resolve(
      input.externalIdentity
    );

    if (!principalResolution.resolved) {
      return {
        completed: false,
        reason: principalResolution.reason
      };
    }

    const context = this.dependencies.contextAssembler.assemble({
      requestId: input.requestId,
      principalId: principalResolution.principalId,
      ...(input.tenantId === undefined ? {} : { tenantId: input.tenantId }),
      ...(input.workspaceId === undefined ? {} : { workspaceId: input.workspaceId }),
      ...(input.branchId === undefined ? {} : { branchId: input.branchId }),
      locale: input.locale,
      riskLevel: input.riskLevel
    });

    return {
      completed: true,
      context: {
        ...context,
        principalId: principalResolution.principalId
      }
    };
  }
}
