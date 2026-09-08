import type { AuthorizationEvaluationInput, AuthorizationRequest } from '@segaloka/auth';

import type { AuthorizationPolicyFacts } from './authorization-policy-fact-resolver.js';
import type { IdentityAuthorizationFacts } from './identity-authorization-fact-resolver.js';

export interface AuthorizationEvaluationInputCompositionRequest {
  readonly authorizationRequest: AuthorizationRequest;
  readonly identityFacts: IdentityAuthorizationFacts;
  readonly policyFacts: AuthorizationPolicyFacts;
}

export function composeAuthorizationEvaluationInput(
  request: AuthorizationEvaluationInputCompositionRequest
): AuthorizationEvaluationInput {
  const { authorizationRequest, identityFacts, policyFacts } = request;

  return {
    context: authorizationRequest.context,
    permissionKey: authorizationRequest.permissionKey,
    ...(identityFacts.subjectId === undefined ? {} : { subjectId: identityFacts.subjectId }),
    tenantId: identityFacts.tenantId,
    identityState: identityFacts.identityState,
    membershipState: identityFacts.membershipState,
    organizationState: identityFacts.organizationState,
    roleAssignmentState: identityFacts.roleAssignmentState,
    roleGrants: identityFacts.roleGrants,
    branchAccess: identityFacts.branchAccess,
    ...(authorizationRequest.resource === undefined
      ? {}
      : { resource: authorizationRequest.resource }),
    entitlementState: policyFacts.entitlementState,
    capabilityState: policyFacts.capabilityState,
    relationshipState: policyFacts.relationshipState,
    riskPolicyState: policyFacts.riskPolicyState
  };
}
