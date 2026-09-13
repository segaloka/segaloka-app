import type {
  PrincipalBindingResolutionPort,
  PrincipalId,
  VerifiedExternalIdentity
} from '@segaloka/auth';

export const AUTHENTICATION_PRINCIPAL_RESOLUTION_FAILURE_REASONS = [
  'PRINCIPAL_BINDING_NOT_FOUND'
] as const;

export type AuthenticationPrincipalResolutionFailureReason =
  (typeof AUTHENTICATION_PRINCIPAL_RESOLUTION_FAILURE_REASONS)[number];

export interface AuthenticationPrincipalResolutionSuccess {
  readonly resolved: true;
  readonly principalId: PrincipalId;
}

export interface AuthenticationPrincipalResolutionFailure {
  readonly resolved: false;
  readonly reason: AuthenticationPrincipalResolutionFailureReason;
}

export type AuthenticationPrincipalResolutionResult =
  | AuthenticationPrincipalResolutionSuccess
  | AuthenticationPrincipalResolutionFailure;

export interface AuthenticationPrincipalResolver {
  resolve(
    externalIdentity: VerifiedExternalIdentity
  ): Promise<AuthenticationPrincipalResolutionResult>;
}

export class DefaultAuthenticationPrincipalResolver implements AuthenticationPrincipalResolver {
  public constructor(private readonly principalBindingResolution: PrincipalBindingResolutionPort) {}

  public async resolve(
    externalIdentity: VerifiedExternalIdentity
  ): Promise<AuthenticationPrincipalResolutionResult> {
    const principalId = await this.principalBindingResolution.resolvePrincipalId(externalIdentity);

    if (principalId === undefined) {
      return {
        resolved: false,
        reason: 'PRINCIPAL_BINDING_NOT_FOUND'
      };
    }

    return {
      resolved: true,
      principalId
    };
  }
}
