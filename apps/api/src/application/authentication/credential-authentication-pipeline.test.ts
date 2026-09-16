import type {
  PrincipalId,
  RequestContext,
  RequestId,
  TenantId,
  VerifiedExternalIdentity,
  WorkspaceId
} from '@segaloka/auth';
import { describe, expect, expectTypeOf, it, vi } from 'vitest';

import type {
  AuthenticatedRequestContextPipeline,
  AuthenticatedRequestContextPipelineInput
} from './authenticated-request-context-pipeline.js';
import {
  DefaultCredentialAuthenticationPipeline,
  type CredentialAuthenticationPipelineResult
} from './credential-authentication-pipeline.js';
import type { ExternalIdentityVerifier } from './external-identity-verifier.js';

const requestId = 'request-a5-a10' as RequestId;
const principalId = 'principal-a5-a10' as PrincipalId;
const tenantId = 'tenant-a5-a10' as TenantId;
const workspaceId = 'workspace-a5-a10' as WorkspaceId;

const externalIdentity: VerifiedExternalIdentity = {
  issuer: 'https://identity.example.test',
  subject: 'external-subject-a5-a10'
};

const authenticatedContext: RequestContext & {
  readonly principalId: PrincipalId;
} = {
  requestId,
  principalId,
  tenantId,
  workspaceId,
  locale: 'id',
  riskLevel: 'LOW'
};

function createPipeline(dependencies: {
  readonly verify: ExternalIdentityVerifier['verify'];
  readonly authenticate: AuthenticatedRequestContextPipeline['execute'];
}): DefaultCredentialAuthenticationPipeline {
  return new DefaultCredentialAuthenticationPipeline({
    externalIdentityVerifier: {
      verify: dependencies.verify
    },
    authenticatedRequestContextPipeline: {
      execute: dependencies.authenticate
    }
  });
}

describe('DefaultCredentialAuthenticationPipeline', () => {
  it('verifies the opaque credential before authenticating the request context', async () => {
    const calls: string[] = [];

    const verify = vi.fn((credential: string) => {
      calls.push(`verify:${credential}`);

      return Promise.resolve({
        verified: true as const,
        externalIdentity
      });
    });

    const authenticate = vi.fn((input: AuthenticatedRequestContextPipelineInput) => {
      calls.push(`authenticate:${input.externalIdentity.subject}`);

      return Promise.resolve({
        completed: true as const,
        context: authenticatedContext
      });
    });

    const pipeline = createPipeline({
      verify,
      authenticate
    });

    const result = await pipeline.execute({
      credential: 'opaque-credential',
      requestId,
      locale: 'id',
      riskLevel: 'LOW'
    });

    expect(calls).toEqual([
      'verify:opaque-credential',
      'authenticate:external-subject-a5-a10'
    ]);
    expect(result).toEqual({
      completed: true,
      context: authenticatedContext
    });
  });

  it.each([
    'CREDENTIAL_MISSING',
    'CREDENTIAL_INVALID',
    'CREDENTIAL_EXPIRED'
  ] as const)(
    'fails closed at credential verification for %s',
    async (reason) => {
      const verify = vi.fn(() =>
        Promise.resolve({
          verified: false as const,
          reason
        })
      );

      const authenticate = vi.fn<
        AuthenticatedRequestContextPipeline['execute']
      >();

      const pipeline = createPipeline({
        verify,
        authenticate
      });

      const result = await pipeline.execute({
        credential: '',
        requestId,
        locale: 'en',
        riskLevel: 'MEDIUM'
      });

      expect(result).toEqual({
        completed: false,
        stage: 'CREDENTIAL_VERIFICATION',
        reason
      });
      expect(authenticate).not.toHaveBeenCalled();
    }
  );

  it('passes the exact verified identity and request assertions to the authenticated context pipeline', async () => {
    const verify = vi.fn(() =>
      Promise.resolve({
        verified: true as const,
        externalIdentity
      })
    );

    const authenticate = vi.fn<
      AuthenticatedRequestContextPipeline['execute']
    >(() =>
      Promise.resolve({
        completed: true as const,
        context: authenticatedContext
      })
    );

    const pipeline = createPipeline({
      verify,
      authenticate
    });

    await pipeline.execute({
      credential: 'opaque-credential',
      requestId,
      tenantId,
      workspaceId,
      locale: 'id',
      riskLevel: 'LOW'
    });

    expect(authenticate).toHaveBeenCalledTimes(1);
    expect(authenticate).toHaveBeenCalledWith({
      externalIdentity,
      requestId,
      tenantId,
      workspaceId,
      locale: 'id',
      riskLevel: 'LOW'
    });
  });

  it('omits absent optional scope assertions instead of manufacturing them', async () => {
    const verify = vi.fn(() =>
      Promise.resolve({
        verified: true as const,
        externalIdentity
      })
    );

    const authenticate = vi.fn<
      AuthenticatedRequestContextPipeline['execute']
    >(() =>
      Promise.resolve({
        completed: true as const,
        context: authenticatedContext
      })
    );

    const pipeline = createPipeline({
      verify,
      authenticate
    });

    await pipeline.execute({
      credential: 'opaque-credential',
      requestId,
      locale: 'ar',
      riskLevel: 'HIGH'
    });

    expect(authenticate).toHaveBeenCalledWith({
      externalIdentity,
      requestId,
      locale: 'ar',
      riskLevel: 'HIGH'
    });
  });

  it('maps principal resolution failure without changing its canonical reason', async () => {
    const verify = vi.fn(() =>
      Promise.resolve({
        verified: true as const,
        externalIdentity
      })
    );

    const authenticate = vi.fn(() =>
      Promise.resolve({
        completed: false as const,
        reason: 'PRINCIPAL_BINDING_NOT_FOUND' as const
      })
    );

    const pipeline = createPipeline({
      verify,
      authenticate
    });

    const result = await pipeline.execute({
      credential: 'opaque-credential',
      requestId,
      locale: 'id',
      riskLevel: 'CRITICAL'
    });

    expect(result).toEqual({
      completed: false,
      stage: 'PRINCIPAL_RESOLUTION',
      reason: 'PRINCIPAL_BINDING_NOT_FOUND'
    });
  });

  it('preserves the authenticated canonical request context on success', async () => {
    const verify = vi.fn(() =>
      Promise.resolve({
        verified: true as const,
        externalIdentity
      })
    );

    const authenticate = vi.fn(() =>
      Promise.resolve({
        completed: true as const,
        context: authenticatedContext
      })
    );

    const pipeline = createPipeline({
      verify,
      authenticate
    });

    const result = await pipeline.execute({
      credential: 'opaque-credential',
      requestId,
      tenantId,
      workspaceId,
      locale: 'id',
      riskLevel: 'LOW'
    });

    expect(result).toEqual({
      completed: true,
      context: authenticatedContext
    });

    if (result.completed) {
      expectTypeOf(result.context).toMatchTypeOf<
        RequestContext & {
          readonly principalId: PrincipalId;
        }
      >();
    }
  });

  it('propagates verifier exceptions instead of converting them into business failures', async () => {
    const expectedError = new Error('verification infrastructure unavailable');

    const verify = vi.fn(() => Promise.reject(expectedError));

    const authenticate = vi.fn<
      AuthenticatedRequestContextPipeline['execute']
    >();

    const pipeline = createPipeline({
      verify,
      authenticate
    });

    await expect(
      pipeline.execute({
        credential: 'opaque-credential',
        requestId,
        locale: 'id',
        riskLevel: 'LOW'
      })
    ).rejects.toBe(expectedError);

    expect(authenticate).not.toHaveBeenCalled();
  });

  it('propagates authenticated-context pipeline exceptions unchanged', async () => {
    const expectedError = new Error('principal resolution infrastructure unavailable');

    const verify = vi.fn(() =>
      Promise.resolve({
        verified: true as const,
        externalIdentity
      })
    );

    const authenticate = vi.fn(() => Promise.reject(expectedError));

    const pipeline = createPipeline({
      verify,
      authenticate
    });

    await expect(
      pipeline.execute({
        credential: 'opaque-credential',
        requestId,
        locale: 'id',
        riskLevel: 'LOW'
      })
    ).rejects.toBe(expectedError);
  });

  it('exposes a discriminated result union for callers', () => {
    const result = undefined as unknown as CredentialAuthenticationPipelineResult;

    expectTypeOf(result).toMatchTypeOf<
      | {
          readonly completed: true;
          readonly context: RequestContext & {
            readonly principalId: PrincipalId;
          };
        }
      | {
          readonly completed: false;
          readonly stage: 'CREDENTIAL_VERIFICATION' | 'PRINCIPAL_RESOLUTION';
        }
    >();
  });
});
