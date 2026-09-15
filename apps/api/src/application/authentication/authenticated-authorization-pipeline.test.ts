import { describe, expect, it, vi } from 'vitest';

import type {
  AuthorizationDecision,
  AuthorizationResourceContext,
  BranchId,
  PrincipalId,
  RequestContext,
  RequestId,
  TenantId,
  VerifiedExternalIdentity,
  WorkspaceId
} from '@segaloka/auth';
import type { PermissionKey } from '@segaloka/platform-registry';

import type {
  AuthenticatedRequestContextPipeline,
  AuthenticatedRequestContextPipelineInput,
  AuthenticatedRequestContextPipelineResult
} from './authenticated-request-context-pipeline.js';
import {
  DefaultAuthenticatedAuthorizationPipeline,
  type AuthorizationOrchestrator
} from './authenticated-authorization-pipeline.js';
import type { AuthorizationOrchestrationResult } from '../authorization/authorization-orchestration.js';

function asId<T>(value: string): T {
  return value as T;
}

function createExternalIdentity(): VerifiedExternalIdentity {
  return {
    issuer: 'https://identity.example.test',
    subject: 'external-subject-01'
  };
}

function createInput(): AuthenticatedRequestContextPipelineInput & {
  readonly permissionKey: PermissionKey;
  readonly resource: AuthorizationResourceContext;
} {
  return {
    externalIdentity: createExternalIdentity(),
    requestId: asId<RequestId>('request_01'),
    tenantId: asId<TenantId>('tenant_assertion_01'),
    workspaceId: asId<WorkspaceId>('workspace_01'),
    branchId: asId<BranchId>('branch_assertion_01'),
    locale: 'id',
    riskLevel: 'LOW',
    permissionKey: 'booking.read',
    resource: {
      tenantId: asId<TenantId>('resource_tenant_01'),
      branchId: asId<BranchId>('resource_branch_01')
    }
  };
}

function createAuthenticatedContext(): RequestContext & {
  readonly principalId: PrincipalId;
} {
  return {
    requestId: asId<RequestId>('request_01'),
    principalId: asId<PrincipalId>('canonical_principal_01'),
    tenantId: asId<TenantId>('tenant_assertion_01'),
    workspaceId: asId<WorkspaceId>('workspace_01'),
    branchId: asId<BranchId>('branch_assertion_01'),
    locale: 'id',
    riskLevel: 'LOW'
  };
}

function createDependencies(options?: {
  authenticationResult?: AuthenticatedRequestContextPipelineResult;
  authorizationResult?: AuthorizationOrchestrationResult;
}) {
  const context = createAuthenticatedContext();

  const authenticationResult =
    options?.authenticationResult ??
    ({
      completed: true,
      context
    } satisfies AuthenticatedRequestContextPipelineResult);

  const authorizationResult =
    options?.authorizationResult ??
    ({
      completed: true,
      decision: {
        allowed: true,
        permissionKey: 'booking.read',
        satisfiedScope: 'TENANT'
      }
    } satisfies AuthorizationOrchestrationResult);

  const authenticationExecute = vi.fn<AuthenticatedRequestContextPipeline['execute']>(() =>
    Promise.resolve(authenticationResult)
  );

  const authorize = vi.fn<AuthorizationOrchestrator['authorize']>(() =>
    Promise.resolve(authorizationResult)
  );

  const authenticationPipeline: AuthenticatedRequestContextPipeline = {
    execute: authenticationExecute
  };

  const authorizationOrchestrator: AuthorizationOrchestrator = {
    authorize
  };

  return {
    context,
    authenticationPipeline,
    authorizationOrchestrator,
    authenticationExecute,
    authorize
  };
}

describe('DefaultAuthenticatedAuthorizationPipeline', () => {
  it('authenticates before authorizing with the canonical authenticated context', async () => {
    const dependencies = createDependencies();
    const input = createInput();

    const result = await new DefaultAuthenticatedAuthorizationPipeline(dependencies).execute(input);

    expect(dependencies.authenticationExecute).toHaveBeenCalledWith({
      externalIdentity: input.externalIdentity,
      requestId: input.requestId,
      tenantId: input.tenantId,
      workspaceId: input.workspaceId,
      branchId: input.branchId,
      locale: input.locale,
      riskLevel: input.riskLevel
    });

    expect(dependencies.authorize).toHaveBeenCalledWith({
      context: dependencies.context,
      permissionKey: input.permissionKey,
      resource: input.resource
    });

    expect(result).toEqual({
      completed: true,
      context: dependencies.context,
      decision: {
        allowed: true,
        permissionKey: 'booking.read',
        satisfiedScope: 'TENANT'
      }
    });

    expect(dependencies.authenticationExecute.mock.invocationCallOrder[0]).toBeDefined();
    expect(dependencies.authorize.mock.invocationCallOrder[0]).toBeDefined();

    expect(dependencies.authenticationExecute.mock.invocationCallOrder[0]!).toBeLessThan(
      dependencies.authorize.mock.invocationCallOrder[0]!
    );
  });

  it('fails at authentication and never invokes authorization when authentication fails', async () => {
    const dependencies = createDependencies({
      authenticationResult: {
        completed: false,
        reason: 'PRINCIPAL_BINDING_NOT_FOUND'
      }
    });

    const result = await new DefaultAuthenticatedAuthorizationPipeline(dependencies).execute(
      createInput()
    );

    expect(result).toEqual({
      completed: false,
      stage: 'AUTHENTICATION',
      reason: 'PRINCIPAL_BINDING_NOT_FOUND'
    });

    expect(dependencies.authorize).not.toHaveBeenCalled();
  });

  it('preserves authorization orchestration failure as a distinct authorization-stage failure', async () => {
    const dependencies = createDependencies({
      authorizationResult: {
        completed: false,
        reason: 'TENANT_ASSERTION_MISMATCH'
      }
    });

    const result = await new DefaultAuthenticatedAuthorizationPipeline(dependencies).execute(
      createInput()
    );

    expect(result).toEqual({
      completed: false,
      stage: 'AUTHORIZATION',
      reason: 'TENANT_ASSERTION_MISMATCH'
    });
  });

  it('treats an authorization deny decision as completed rather than pipeline failure', async () => {
    const decision: AuthorizationDecision = {
      allowed: false,
      permissionKey: 'booking.read',
      reason: 'PERMISSION_NOT_GRANTED'
    };

    const dependencies = createDependencies({
      authorizationResult: {
        completed: true,
        decision
      }
    });

    const result = await new DefaultAuthenticatedAuthorizationPipeline(dependencies).execute(
      createInput()
    );

    expect(result).toEqual({
      completed: true,
      context: dependencies.context,
      decision
    });
  });

  it('omits absent optional scope assertions and authorization resource', async () => {
    const dependencies = createDependencies();

    const input = {
      externalIdentity: createExternalIdentity(),
      requestId: asId<RequestId>('request_02'),
      locale: 'en' as const,
      riskLevel: 'MEDIUM' as const,
      permissionKey: 'booking.read' as PermissionKey
    };

    await new DefaultAuthenticatedAuthorizationPipeline(dependencies).execute(input);

    expect(dependencies.authenticationExecute).toHaveBeenCalledWith({
      externalIdentity: input.externalIdentity,
      requestId: input.requestId,
      locale: input.locale,
      riskLevel: input.riskLevel
    });

    const authenticationCall = dependencies.authenticationExecute.mock.calls[0];
    const authorizationCall = dependencies.authorize.mock.calls[0];

    expect(authenticationCall).toBeDefined();
    expect(authenticationCall?.[0]).not.toHaveProperty('tenantId');
    expect(authenticationCall?.[0]).not.toHaveProperty('workspaceId');
    expect(authenticationCall?.[0]).not.toHaveProperty('branchId');

    expect(authorizationCall).toBeDefined();
    expect(authorizationCall?.[0]).not.toHaveProperty('resource');
  });

  it('passes authorization intent only after authentication and preserves resource reference', async () => {
    const dependencies = createDependencies();
    const input = createInput();

    await new DefaultAuthenticatedAuthorizationPipeline(dependencies).execute(input);

    expect(dependencies.authenticationExecute.mock.calls[0]?.[0]).not.toHaveProperty(
      'permissionKey'
    );
    expect(dependencies.authenticationExecute.mock.calls[0]?.[0]).not.toHaveProperty('resource');

    const authorizationRequest = dependencies.authorize.mock.calls[0]?.[0];

    expect(authorizationRequest).toBeDefined();
    expect(authorizationRequest?.permissionKey).toBe(input.permissionKey);
    expect(authorizationRequest?.resource).toBe(input.resource);
  });

  it('propagates dependency exceptions instead of converting them into ordinary failures', async () => {
    const authenticationError = new Error('authentication infrastructure failure');

    const authenticationPipeline: AuthenticatedRequestContextPipeline = {
      execute: vi.fn(() => Promise.reject(authenticationError))
    };

    const authorize = vi.fn<AuthorizationOrchestrator['authorize']>();

    const authorizationOrchestrator: AuthorizationOrchestrator = {
      authorize
    };

    const pipeline = new DefaultAuthenticatedAuthorizationPipeline({
      authenticationPipeline,
      authorizationOrchestrator
    });

    await expect(pipeline.execute(createInput())).rejects.toBe(authenticationError);

    expect(authorize).not.toHaveBeenCalled();

    const authorizationError = new Error('authorization infrastructure failure');

    const secondDependencies = createDependencies();

    secondDependencies.authorizationOrchestrator.authorize = vi.fn(() =>
      Promise.reject(authorizationError)
    );

    const secondPipeline = new DefaultAuthenticatedAuthorizationPipeline({
      authenticationPipeline: secondDependencies.authenticationPipeline,
      authorizationOrchestrator: secondDependencies.authorizationOrchestrator
    });

    await expect(secondPipeline.execute(createInput())).rejects.toBe(authorizationError);
  });
});
