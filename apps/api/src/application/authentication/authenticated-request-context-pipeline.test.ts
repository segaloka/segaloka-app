import { describe, expect, it, vi } from 'vitest';

import {
  asCanonicalPrincipalId,
  type BranchId,
  type RequestId,
  type TenantId,
  type VerifiedExternalIdentity,
  type WorkspaceId
} from '@segaloka/auth';

import type {
  AuthenticationPrincipalResolver,
  AuthenticationPrincipalResolutionResult
} from './authentication-principal-resolver.js';
import {
  DefaultAuthenticatedRequestContextPipeline,
  type AuthenticatedRequestContextPipelineInput
} from './authenticated-request-context-pipeline.js';
import type {
  RequestContextAssembler,
  RequestContextAssemblyInput
} from './request-context-assembler.js';

function asRequestId(value: string): RequestId {
  return value as RequestId;
}

function asTenantId(value: string): TenantId {
  return value as TenantId;
}

function asWorkspaceId(value: string): WorkspaceId {
  return value as WorkspaceId;
}

function asBranchId(value: string): BranchId {
  return value as BranchId;
}

function createInput(
  overrides: Partial<AuthenticatedRequestContextPipelineInput> = {}
): AuthenticatedRequestContextPipelineInput {
  return {
    externalIdentity: {
      issuer: 'https://issuer.example/tenant-a',
      subject: 'external-subject-01'
    },
    requestId: asRequestId('request-01'),
    tenantId: asTenantId('tenant-01'),
    workspaceId: asWorkspaceId('workspace-01'),
    branchId: asBranchId('branch-01'),
    locale: 'id',
    riskLevel: 'LOW',
    ...overrides
  };
}

function createInputWithoutScope(
  overrides: Partial<AuthenticatedRequestContextPipelineInput> = {}
): AuthenticatedRequestContextPipelineInput {
  return {
    externalIdentity: {
      issuer: 'https://issuer.example/tenant-a',
      subject: 'external-subject-01'
    },
    requestId: asRequestId('request-01'),
    locale: 'id',
    riskLevel: 'LOW',
    ...overrides
  };
}

function createDependencies(
  principalResolution: AuthenticationPrincipalResolutionResult
): {
  readonly principalResolver: AuthenticationPrincipalResolver;
  readonly contextAssembler: RequestContextAssembler;
  readonly resolve: ReturnType<typeof vi.fn>;
  readonly assemble: ReturnType<typeof vi.fn>;
} {
  const resolve = vi.fn().mockResolvedValue(principalResolution);

  const assemble = vi.fn((input: RequestContextAssemblyInput) => ({
    requestId: input.requestId,
    ...(input.principalId === undefined ? {} : { principalId: input.principalId }),
    ...(input.tenantId === undefined ? {} : { tenantId: input.tenantId }),
    ...(input.workspaceId === undefined ? {} : { workspaceId: input.workspaceId }),
    ...(input.branchId === undefined ? {} : { branchId: input.branchId }),
    locale: input.locale,
    riskLevel: input.riskLevel
  }));

  return {
    principalResolver: {
      resolve
    },
    contextAssembler: {
      assemble
    },
    resolve,
    assemble
  };
}

describe('DefaultAuthenticatedRequestContextPipeline', () => {
  const principalId = asCanonicalPrincipalId(
    '550e8400-e29b-41d4-a716-446655440000'
  );

  it('resolves the canonical principal before assembling request context', async () => {
    const dependencies = createDependencies({
      resolved: true,
      principalId
    });

    const pipeline = new DefaultAuthenticatedRequestContextPipeline(dependencies);
    const input = createInput();

    await expect(pipeline.execute(input)).resolves.toEqual({
      completed: true,
      context: {
        requestId: input.requestId,
        principalId,
        tenantId: input.tenantId,
        workspaceId: input.workspaceId,
        branchId: input.branchId,
        locale: 'id',
        riskLevel: 'LOW'
      }
    });

    expect(dependencies.resolve).toHaveBeenCalledTimes(1);
    expect(dependencies.resolve).toHaveBeenCalledWith(input.externalIdentity);

    expect(dependencies.assemble).toHaveBeenCalledTimes(1);
    expect(dependencies.assemble).toHaveBeenCalledWith({
      requestId: input.requestId,
      principalId,
      tenantId: input.tenantId,
      workspaceId: input.workspaceId,
      branchId: input.branchId,
      locale: input.locale,
      riskLevel: input.riskLevel
    });

    const resolveCallOrder = dependencies.resolve.mock.invocationCallOrder[0];
    const assembleCallOrder = dependencies.assemble.mock.invocationCallOrder[0];

    expect(resolveCallOrder).toBeDefined();
    expect(assembleCallOrder).toBeDefined();

    if (
      resolveCallOrder === undefined ||
      assembleCallOrder === undefined
    ) {
      throw new Error('Expected resolver and assembler invocation order.');
    }

    expect(resolveCallOrder).toBeLessThan(assembleCallOrder);
  });

  it('fails closed and does not assemble context when principal binding is missing', async () => {
    const dependencies = createDependencies({
      resolved: false,
      reason: 'PRINCIPAL_BINDING_NOT_FOUND'
    });

    const pipeline = new DefaultAuthenticatedRequestContextPipeline(dependencies);

    await expect(pipeline.execute(createInput())).resolves.toEqual({
      completed: false,
      reason: 'PRINCIPAL_BINDING_NOT_FOUND'
    });

    expect(dependencies.resolve).toHaveBeenCalledTimes(1);
    expect(dependencies.assemble).not.toHaveBeenCalled();
  });

  it('passes the verified external identity to the resolver without transforming it', async () => {
    const dependencies = createDependencies({
      resolved: true,
      principalId
    });

    const pipeline = new DefaultAuthenticatedRequestContextPipeline(dependencies);

    const externalIdentity: VerifiedExternalIdentity = {
      issuer: ' HTTPS://Issuer.Example/Tenant-A ',
      subject: ' Subject-Case '
    };

    await pipeline.execute(
      createInput({
        externalIdentity
      })
    );

    expect(dependencies.resolve).toHaveBeenCalledWith(externalIdentity);
  });

  it('preserves request scope assertions without treating them as identity resolution inputs', async () => {
    const dependencies = createDependencies({
      resolved: true,
      principalId
    });

    const pipeline = new DefaultAuthenticatedRequestContextPipeline(dependencies);

    const input = createInput({
      tenantId: asTenantId('tenant-request-assertion'),
      workspaceId: asWorkspaceId('workspace-request-assertion'),
      branchId: asBranchId('branch-request-assertion')
    });

    await pipeline.execute(input);

    expect(dependencies.resolve).toHaveBeenCalledWith(input.externalIdentity);

    expect(dependencies.assemble).toHaveBeenCalledWith({
      requestId: input.requestId,
      principalId,
      tenantId: input.tenantId,
      workspaceId: input.workspaceId,
      branchId: input.branchId,
      locale: input.locale,
      riskLevel: input.riskLevel
    });
  });

  it('omits absent optional request scope assertions', async () => {
    const dependencies = createDependencies({
      resolved: true,
      principalId
    });

    const pipeline = new DefaultAuthenticatedRequestContextPipeline(dependencies);

    const input = createInputWithoutScope();

    await expect(pipeline.execute(input)).resolves.toEqual({
      completed: true,
      context: {
        requestId: input.requestId,
        principalId,
        locale: input.locale,
        riskLevel: input.riskLevel
      }
    });

    expect(dependencies.assemble).toHaveBeenCalledWith({
      requestId: input.requestId,
      principalId,
      locale: input.locale,
      riskLevel: input.riskLevel
    });
  });

  it('preserves locale and risk level through context assembly', async () => {
    const dependencies = createDependencies({
      resolved: true,
      principalId
    });

    const pipeline = new DefaultAuthenticatedRequestContextPipeline(dependencies);

    const input = createInput({
      locale: 'ar',
      riskLevel: 'CRITICAL'
    });

    await pipeline.execute(input);

    expect(dependencies.assemble).toHaveBeenCalledWith(
      expect.objectContaining({
        locale: 'ar',
        riskLevel: 'CRITICAL'
      })
    );
  });
});
