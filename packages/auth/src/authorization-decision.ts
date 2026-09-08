import type { AuthorizationScope, PermissionKey } from '@segaloka/platform-registry';

import { AUTHORIZATION_DENY_REASONS } from './authorization-contract.js';

import type {
  AuthorizationAllowDecision,
  AuthorizationDecision,
  AuthorizationDenyDecision,
  AuthorizationDenyReason
} from './authorization-contract.js';

export function allowAuthorization(
  permissionKey: PermissionKey,
  satisfiedScope: AuthorizationScope
): AuthorizationAllowDecision {
  return Object.freeze({
    allowed: true,
    permissionKey,
    satisfiedScope
  });
}

export function denyAuthorization(
  permissionKey: PermissionKey,
  reason: AuthorizationDenyReason
): AuthorizationDenyDecision {
  if (!AUTHORIZATION_DENY_REASONS.includes(reason)) {
    throw new Error(`Unknown authorization deny reason "${String(reason)}".`);
  }

  return Object.freeze({
    allowed: false,
    permissionKey,
    reason
  });
}

export function isAuthorizationAllowed(
  decision: AuthorizationDecision
): decision is AuthorizationAllowDecision {
  return decision.allowed;
}

export function isAuthorizationDenied(
  decision: AuthorizationDecision
): decision is AuthorizationDenyDecision {
  return !decision.allowed;
}
