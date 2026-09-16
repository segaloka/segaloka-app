import type {
  BranchId,
  RequestId,
  RiskLevel,
  SupportedLocale,
  TenantId,
  WorkspaceId
} from '@segaloka/auth';

import type {
  AuthenticatedRequestContextPipeline,
  AuthenticatedRequestContextPipelineSuccess
} from './authenticated-request-context-pipeline.js';
import type {
  ExternalIdentityVerificationFailureReason,
  ExternalIdentityVerifier
} from './external-identity-verifier.js';
import type { AuthenticationPrincipalResolutionFailureReason } from './authentication-principal-resolver.js';

export interface CredentialAuthenticationPipelineInput {
  readonly credential: string;
  readonly requestId: RequestId;
  readonly tenantId?: TenantId;
  readonly workspaceId?: WorkspaceId;
  readonly branchId?: BranchId;
  readonly locale: SupportedLocale;
  readonly riskLevel: RiskLevel;
}

export interface CredentialAuthenticationPipelineSuccess {
  readonly completed: true;
  readonly context: AuthenticatedRequestContextPipelineSuccess['context'];
}

export interface CredentialAuthenticationPipelineCredentialVerificationFailure {
  readonly completed: false;
  readonly stage: 'CREDENTIAL_VERIFICATION';
  readonly reason: ExternalIdentityVerificationFailureReason;
}

export interface CredentialAuthenticationPipelinePrincipalResolutionFailure {
  readonly completed: false;
  readonly stage: 'PRINCIPAL_RESOLUTION';
  readonly reason: AuthenticationPrincipalResolutionFailureReason;
}

export type CredentialAuthenticationPipelineFailure =
  | CredentialAuthenticationPipelineCredentialVerificationFailure
  | CredentialAuthenticationPipelinePrincipalResolutionFailure;

export type CredentialAuthenticationPipelineResult =
  | CredentialAuthenticationPipelineSuccess
  | CredentialAuthenticationPipelineFailure;

export interface CredentialAuthenticationPipeline {
  execute(
    input: CredentialAuthenticationPipelineInput
  ): Promise<CredentialAuthenticationPipelineResult>;
}

export interface DefaultCredentialAuthenticationPipelineDependencies {
  readonly externalIdentityVerifier: ExternalIdentityVerifier;
  readonly authenticatedRequestContextPipeline: AuthenticatedRequestContextPipeline;
}

export class DefaultCredentialAuthenticationPipeline implements CredentialAuthenticationPipeline {
  public constructor(
    private readonly dependencies: DefaultCredentialAuthenticationPipelineDependencies
  ) {}

  public async execute(
    input: CredentialAuthenticationPipelineInput
  ): Promise<CredentialAuthenticationPipelineResult> {
    const verification = await this.dependencies.externalIdentityVerifier.verify(input.credential);

    if (!verification.verified) {
      return {
        completed: false,
        stage: 'CREDENTIAL_VERIFICATION',
        reason: verification.reason
      };
    }

    const authentication = await this.dependencies.authenticatedRequestContextPipeline.execute({
      externalIdentity: verification.externalIdentity,
      requestId: input.requestId,
      ...(input.tenantId === undefined ? {} : { tenantId: input.tenantId }),
      ...(input.workspaceId === undefined ? {} : { workspaceId: input.workspaceId }),
      ...(input.branchId === undefined ? {} : { branchId: input.branchId }),
      locale: input.locale,
      riskLevel: input.riskLevel
    });

    if (!authentication.completed) {
      return {
        completed: false,
        stage: 'PRINCIPAL_RESOLUTION',
        reason: authentication.reason
      };
    }

    return {
      completed: true,
      context: authentication.context
    };
  }
}
