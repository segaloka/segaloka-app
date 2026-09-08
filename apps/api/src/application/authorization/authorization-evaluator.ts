import type { AuthorizationDecision, AuthorizationEvaluationInput } from '@segaloka/auth';

export interface AuthorizationEvaluator {
  evaluate(input: AuthorizationEvaluationInput): AuthorizationDecision;
}
