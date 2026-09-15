import type {
  AuthorizationDecision,
  AuthorizationRequest,
  AuthorizationResourceContext
} from '@segaloka/auth';
import type { PermissionKey } from '@segaloka/platform-registry';

import type {
  AuthenticatedRequestContextPipeline,
  AuthenticatedRequestContextPipelineInput
} from './authenticated-request-context-pipeline.js';
import type { AuthenticationPrincipalResolutionFailureReason } from './authentication-principal-resolver.js';
import type {
  AuthorizationOrchestrationFailureReason,
  AuthorizationOrchestrationResult
} from '../authorization/authorization-orchestration.js';

export interface AuthenticatedAuthorizationPipelineInput
  extends AuthenticatedRequestContextPipelineInput {
  readonly permissionKey: PermissionKey;
  readonly resource?: AuthorizationResourceContext;
}

export interface AuthenticatedAuthorizationPipelineSuccess {
  readonly completed: true;
  readonly context: Extract<
    Awaited<ReturnType<AuthenticatedRequestContextPipeline['execute']>>,
    { readonly completed: true }
  >['context'];
  readonly decision: AuthorizationDecision;
}

export interface AuthenticatedAuthorizationPipelineAuthenticationFailure {
  readonly completed: false;
  readonly stage: 'AUTHENTICATION';
  readonly reason: AuthenticationPrincipalResolutionFailureReason;
}

export interface AuthenticatedAuthorizationPipelineAuthorizationFailure {
  readonly completed: false;
  readonly stage: 'AUTHORIZATION';
  readonly reason: AuthorizationOrchestrationFailureReason;
}

export type AuthenticatedAuthorizationPipelineResult =
  | AuthenticatedAuthorizationPipelineSuccess
  | AuthenticatedAuthorizationPipelineAuthenticationFailure
  | AuthenticatedAuthorizationPipelineAuthorizationFailure;

export interface AuthenticatedAuthorizationPipeline {
  execute(
    input: AuthenticatedAuthorizationPipelineInput
  ): Promise<AuthenticatedAuthorizationPipelineResult>;
}

export interface AuthorizationOrchestrator {
  authorize(authorizationRequest: AuthorizationRequest): Promise<AuthorizationOrchestrationResult>;
}

export interface DefaultAuthenticatedAuthorizationPipelineDependencies {
  readonly authenticationPipeline: AuthenticatedRequestContextPipeline;
  readonly authorizationOrchestrator: AuthorizationOrchestrator;
}

export class DefaultAuthenticatedAuthorizationPipeline
  implements AuthenticatedAuthorizationPipeline
{
  public constructor(
    private readonly dependencies: DefaultAuthenticatedAuthorizationPipelineDependencies
  ) {}

  public async execute(
    input: AuthenticatedAuthorizationPipelineInput
  ): Promise<AuthenticatedAuthorizationPipelineResult> {
    const authenticationResult = await this.dependencies.authenticationPipeline.execute({
      externalIdentity: input.externalIdentity,
      requestId: input.requestId,
      ...(input.tenantId === undefined ? {} : { tenantId: input.tenantId }),
      ...(input.workspaceId === undefined ? {} : { workspaceId: input.workspaceId }),
      ...(input.branchId === undefined ? {} : { branchId: input.branchId }),
      locale: input.locale,
      riskLevel: input.riskLevel
    });

    if (!authenticationResult.completed) {
      return {
        completed: false,
        stage: 'AUTHENTICATION',
        reason: authenticationResult.reason
      };
    }

    const authorizationRequest: AuthorizationRequest = {
      context: authenticationResult.context,
      permissionKey: input.permissionKey,
      ...(input.resource === undefined ? {} : { resource: input.resource })
    };

    const authorizationResult =
      await this.dependencies.authorizationOrchestrator.authorize(authorizationRequest);

    if (!authorizationResult.completed) {
      return {
        completed: false,
        stage: 'AUTHORIZATION',
        reason: authorizationResult.reason
      };
    }

    return {
      completed: true,
      context: authenticationResult.context,
      decision: authorizationResult.decision
    };
  }
}
