import type {
  AuthorizationPolicyState,
  AuthorizationRequest,
  AuthorizationSubjectId,
  TenantId
} from '@segaloka/auth';

export interface AuthorizationPolicyFacts {
  readonly entitlementState: AuthorizationPolicyState;
  readonly capabilityState: AuthorizationPolicyState;
  readonly relationshipState: AuthorizationPolicyState;
  readonly resourcePolicyState: AuthorizationPolicyState;
  readonly riskPolicyState: AuthorizationPolicyState;
}

export interface AuthorizationPolicyFactResolutionRequest {
  readonly authorizationRequest: AuthorizationRequest;
  readonly subjectId?: AuthorizationSubjectId;
  readonly tenantId: TenantId;
}

export interface AuthorizationPolicyFactResolver {
  resolve(request: AuthorizationPolicyFactResolutionRequest): Promise<AuthorizationPolicyFacts>;
}
