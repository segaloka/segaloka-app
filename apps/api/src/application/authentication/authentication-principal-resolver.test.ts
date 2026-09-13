import { describe, expect, it, vi } from 'vitest';

import {
  asCanonicalPrincipalId,
  type PrincipalBindingResolutionPort,
  type VerifiedExternalIdentity
} from '@segaloka/auth';

import {
  AUTHENTICATION_PRINCIPAL_RESOLUTION_FAILURE_REASONS,
  DefaultAuthenticationPrincipalResolver,
  type AuthenticationPrincipalResolutionResult
} from './authentication-principal-resolver.js';

function createBindingResolution(
  principalId: ReturnType<typeof asCanonicalPrincipalId> | undefined
): {
  readonly port: PrincipalBindingResolutionPort;
  readonly resolvePrincipalId: ReturnType<typeof vi.fn>;
} {
  const resolvePrincipalId = vi.fn().mockResolvedValue(principalId);

  return {
    port: {
      resolvePrincipalId
    },
    resolvePrincipalId
  };
}

describe('DefaultAuthenticationPrincipalResolver', () => {
  const externalIdentity: VerifiedExternalIdentity = {
    issuer: 'https://issuer.example/tenant-a',
    subject: 'external-subject-01'
  };

  it('defines only the application-level missing binding failure', () => {
    expect(AUTHENTICATION_PRINCIPAL_RESOLUTION_FAILURE_REASONS).toEqual([
      'PRINCIPAL_BINDING_NOT_FOUND'
    ]);
  });

  it('resolves the canonical principal from an already verified external identity', async () => {
    const principalId = asCanonicalPrincipalId('550e8400-e29b-41d4-a716-446655440000');

    const bindingResolution = createBindingResolution(principalId);

    const resolver = new DefaultAuthenticationPrincipalResolver(bindingResolution.port);

    await expect(resolver.resolve(externalIdentity)).resolves.toEqual({
      resolved: true,
      principalId
    } satisfies AuthenticationPrincipalResolutionResult);

    expect(bindingResolution.resolvePrincipalId).toHaveBeenCalledTimes(1);
    expect(bindingResolution.resolvePrincipalId).toHaveBeenCalledWith(externalIdentity);
  });

  it('fails closed when the verified external identity has no active principal binding', async () => {
    const bindingResolution = createBindingResolution(undefined);

    const resolver = new DefaultAuthenticationPrincipalResolver(bindingResolution.port);

    await expect(resolver.resolve(externalIdentity)).resolves.toEqual({
      resolved: false,
      reason: 'PRINCIPAL_BINDING_NOT_FOUND'
    } satisfies AuthenticationPrincipalResolutionResult);

    expect(bindingResolution.resolvePrincipalId).toHaveBeenCalledTimes(1);
    expect(bindingResolution.resolvePrincipalId).toHaveBeenCalledWith(externalIdentity);
  });

  it('does not transform issuer or subject before binding resolution', async () => {
    const principalId = asCanonicalPrincipalId('550e8400-e29b-41d4-a716-446655440001');

    const bindingResolution = createBindingResolution(principalId);

    const resolver = new DefaultAuthenticationPrincipalResolver(bindingResolution.port);

    const exactExternalIdentity: VerifiedExternalIdentity = {
      issuer: ' HTTPS://Issuer.Example/Tenant-A ',
      subject: ' Subject-Case '
    };

    await resolver.resolve(exactExternalIdentity);

    expect(bindingResolution.resolvePrincipalId).toHaveBeenCalledWith(exactExternalIdentity);
  });
});
