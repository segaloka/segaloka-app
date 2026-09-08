import type { AuthorizationDecision } from '@segaloka/auth';

import { IDENTITY_AUTHORIZATION_FACT_RESOLUTION_FAILURE_REASONS } from './identity-authorization-fact-resolver.js';

export const AUTHORIZATION_ORCHESTRATION_FAILURE_REASONS = [
  'PRINCIPAL_REQUIRED',
  'WORKSPACE_REQUIRED',
  'TENANT_REQUIRED',
  ...IDENTITY_AUTHORIZATION_FACT_RESOLUTION_FAILURE_REASONS
] as const;

export type AuthorizationOrchestrationFailureReason =
  (typeof AUTHORIZATION_ORCHESTRATION_FAILURE_REASONS)[number];

export interface AuthorizationOrchestrationSuccess {
  readonly completed: true;
  readonly decision: AuthorizationDecision;
}

export interface AuthorizationOrchestrationFailure {
  readonly completed: false;
  readonly reason: AuthorizationOrchestrationFailureReason;
}

export type AuthorizationOrchestrationResult =
  | AuthorizationOrchestrationSuccess
  | AuthorizationOrchestrationFailure;
