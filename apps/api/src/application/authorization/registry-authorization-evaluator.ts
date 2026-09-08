import {
  evaluateAuthorization,
  type AuthorizationDecision,
  type AuthorizationEvaluationInput
} from '@segaloka/auth';

import type { PermissionRegistry } from '@segaloka/platform-registry';

import type { AuthorizationEvaluator } from './authorization-evaluator.js';

export class RegistryAuthorizationEvaluator implements AuthorizationEvaluator {
  constructor(private readonly registry: PermissionRegistry) {}

  evaluate(input: AuthorizationEvaluationInput): AuthorizationDecision {
    return evaluateAuthorization(input, this.registry);
  }
}
