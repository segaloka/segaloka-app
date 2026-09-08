import type { AuthorizationRequest } from '@segaloka/auth';

import { composeAuthorizationEvaluationInput } from './authorization-evaluation-input-composer.js';

import type { AuthorizationEvaluator } from './authorization-evaluator.js';
import type { AuthorizationPolicyFactResolver } from './authorization-policy-fact-resolver.js';
import type { AuthorizationOrchestrationResult } from './authorization-orchestration.js';
import type { IdentityAuthorizationFactResolver } from './identity-authorization-fact-resolver.js';

export interface DefaultAuthorizationOrchestratorDependencies {
  readonly identityFactResolver: IdentityAuthorizationFactResolver;
  readonly policyFactResolver: AuthorizationPolicyFactResolver;
  readonly evaluator: AuthorizationEvaluator;
}

export class DefaultAuthorizationOrchestrator {
  constructor(private readonly dependencies: DefaultAuthorizationOrchestratorDependencies) {}

  async authorize(
    authorizationRequest: AuthorizationRequest
  ): Promise<AuthorizationOrchestrationResult> {
    const { principalId, workspaceId, tenantId, branchId } = authorizationRequest.context;

    if (principalId === undefined) {
      return {
        completed: false,
        reason: 'PRINCIPAL_REQUIRED'
      };
    }

    if (workspaceId === undefined) {
      return {
        completed: false,
        reason: 'WORKSPACE_REQUIRED'
      };
    }

    if (tenantId === undefined) {
      return {
        completed: false,
        reason: 'TENANT_REQUIRED'
      };
    }

    const identityResolution = await this.dependencies.identityFactResolver.resolve({
      principalId,
      workspaceId,
      tenantId,
      ...(branchId === undefined ? {} : { branchId })
    });

    if (!identityResolution.resolved) {
      return {
        completed: false,
        reason: identityResolution.reason
      };
    }

    const identityFacts = identityResolution.facts;

    const policyFacts = await this.dependencies.policyFactResolver.resolve({
      authorizationRequest,
      ...(identityFacts.subjectId === undefined ? {} : { subjectId: identityFacts.subjectId }),
      tenantId: identityFacts.tenantId
    });

    const evaluationInput = composeAuthorizationEvaluationInput({
      authorizationRequest,
      identityFacts,
      policyFacts
    });

    const decision = this.dependencies.evaluator.evaluate(evaluationInput);

    return {
      completed: true,
      decision
    };
  }
}
