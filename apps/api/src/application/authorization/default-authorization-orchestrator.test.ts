import { describe, expect, it, vi } from 'vitest';

import type {
  AuthorizationDecision,
  AuthorizationEvaluationInput,
  AuthorizationRequest,
  AuthorizationSubjectId,
  BranchId,
  PrincipalId,
  RequestContext,
  RequestId,
  TenantId,
  WorkspaceId
} from '@segaloka/auth';

import type { AuthorizationEvaluator } from './authorization-evaluator.js';
import type {
  AuthorizationPolicyFactResolver,
  AuthorizationPolicyFacts
} from './authorization-policy-fact-resolver.js';
import { DefaultAuthorizationOrchestrator } from './default-authorization-orchestrator.js';
import type {
  IdentityAuthorizationFactResolutionResult,
  IdentityAuthorizationFactResolver,
  IdentityAuthorizationFacts
} from './identity-authorization-fact-resolver.js';

function asId<T>(value: string): T {
  return value as T;
}

function createAuthorizationRequest(): AuthorizationRequest {
  return {
    context: {
      requestId: asId<RequestId>('request_01'),
      principalId: asId<PrincipalId>('principal_01'),
      workspaceId: asId<WorkspaceId>('workspace_01'),
      tenantId: asId<TenantId>('tenant_assertion_01'),
      branchId: asId<BranchId>('branch_context_01'),
      locale: 'id',
      riskLevel: 'LOW'
    },
    permissionKey: 'booking.read'
  };
}

function withoutPrincipalId(context: RequestContext): RequestContext {
  const contextWithoutPrincipal = { ...context };

  delete contextWithoutPrincipal.principalId;

  return contextWithoutPrincipal;
}

function withoutWorkspaceId(context: RequestContext): RequestContext {
  const contextWithoutWorkspace = { ...context };

  delete contextWithoutWorkspace.workspaceId;

  return contextWithoutWorkspace;
}

function withoutTenantId(context: RequestContext): RequestContext {
  const contextWithoutTenant = { ...context };

  delete contextWithoutTenant.tenantId;

  return contextWithoutTenant;
}

function withoutBranchId(context: RequestContext): RequestContext {
  const contextWithoutBranch = { ...context };

  delete contextWithoutBranch.branchId;

  return contextWithoutBranch;
}

function createIdentityFacts(): IdentityAuthorizationFacts {
  return {
    subjectId: asId<AuthorizationSubjectId>('subject_01'),
    tenantId: asId<TenantId>('authoritative_tenant_01'),
    identityState: 'ACTIVE',
    membershipState: 'ACTIVE',
    organizationState: 'ACTIVE',
    roleAssignmentState: 'ACTIVE',
    roleGrants: [
      {
        roleId: 'role_01',
        permissions: [
          {
            permissionKey: 'booking.read',
            scope: 'TENANT'
          }
        ]
      }
    ],
    branchAccess: []
  };
}

function createIdentityFactsWithoutSubject(): IdentityAuthorizationFacts {
  const identityFacts = { ...createIdentityFacts() };

  delete identityFacts.subjectId;

  return identityFacts;
}

function createPolicyFacts(): AuthorizationPolicyFacts {
  return {
    entitlementState: 'SATISFIED',
    capabilityState: 'SATISFIED',
    relationshipState: 'NOT_REQUIRED',
    resourcePolicyState: 'NOT_REQUIRED',
    riskPolicyState: 'SATISFIED'
  };
}

function createDependencies(options?: {
  identityResult?: IdentityAuthorizationFactResolutionResult;
  policyFacts?: AuthorizationPolicyFacts;
  decision?: AuthorizationDecision;
}) {
  const identityResult =
    options?.identityResult ??
    ({
      resolved: true,
      facts: createIdentityFacts()
    } satisfies IdentityAuthorizationFactResolutionResult);

  const policyFacts = options?.policyFacts ?? createPolicyFacts();

  const decision =
    options?.decision ??
    ({
      allowed: true,
      permissionKey: 'booking.read',
      satisfiedScope: 'TENANT'
    } satisfies AuthorizationDecision);

  const identityResolve = vi.fn<IdentityAuthorizationFactResolver['resolve']>(() =>
    Promise.resolve(identityResult)
  );

  const policyResolve = vi.fn<AuthorizationPolicyFactResolver['resolve']>(() =>
    Promise.resolve(policyFacts)
  );

  const evaluate = vi.fn<AuthorizationEvaluator['evaluate']>((): AuthorizationDecision => decision);

  const identityFactResolver: IdentityAuthorizationFactResolver = {
    resolve: identityResolve
  };

  const policyFactResolver: AuthorizationPolicyFactResolver = {
    resolve: policyResolve
  };

  const evaluator: AuthorizationEvaluator = {
    evaluate
  };

  return {
    identityFactResolver,
    policyFactResolver,
    evaluator,
    identityResolve,
    policyResolve,
    evaluate
  };
}

describe('DefaultAuthorizationOrchestrator', () => {
  it('fails before resolution when principalId is absent', async () => {
    const dependencies = createDependencies();
    const authorizationRequest = createAuthorizationRequest();

    const result = await new DefaultAuthorizationOrchestrator(dependencies).authorize({
      ...authorizationRequest,
      context: withoutPrincipalId(authorizationRequest.context)
    });

    expect(result).toEqual({
      completed: false,
      reason: 'PRINCIPAL_REQUIRED'
    });

    expect(dependencies.identityResolve).not.toHaveBeenCalled();
    expect(dependencies.policyResolve).not.toHaveBeenCalled();
    expect(dependencies.evaluate).not.toHaveBeenCalled();
  });

  it('fails before resolution when workspaceId is absent', async () => {
    const dependencies = createDependencies();
    const authorizationRequest = createAuthorizationRequest();

    const result = await new DefaultAuthorizationOrchestrator(dependencies).authorize({
      ...authorizationRequest,
      context: withoutWorkspaceId(authorizationRequest.context)
    });

    expect(result).toEqual({
      completed: false,
      reason: 'WORKSPACE_REQUIRED'
    });

    expect(dependencies.identityResolve).not.toHaveBeenCalled();
    expect(dependencies.policyResolve).not.toHaveBeenCalled();
    expect(dependencies.evaluate).not.toHaveBeenCalled();
  });

  it('fails before resolution when tenantId is absent', async () => {
    const dependencies = createDependencies();
    const authorizationRequest = createAuthorizationRequest();

    const result = await new DefaultAuthorizationOrchestrator(dependencies).authorize({
      ...authorizationRequest,
      context: withoutTenantId(authorizationRequest.context)
    });

    expect(result).toEqual({
      completed: false,
      reason: 'TENANT_REQUIRED'
    });

    expect(dependencies.identityResolve).not.toHaveBeenCalled();
    expect(dependencies.policyResolve).not.toHaveBeenCalled();
    expect(dependencies.evaluate).not.toHaveBeenCalled();
  });

  it('uses deterministic prerequisite failure precedence', async () => {
    const dependencies = createDependencies();
    const authorizationRequest = createAuthorizationRequest();

    const contextWithoutPrincipal = withoutPrincipalId(authorizationRequest.context);
    const contextWithoutWorkspace = withoutWorkspaceId(contextWithoutPrincipal);
    const contextWithoutTenant = withoutTenantId(contextWithoutWorkspace);

    const result = await new DefaultAuthorizationOrchestrator(dependencies).authorize({
      ...authorizationRequest,
      context: contextWithoutTenant
    });

    expect(result).toEqual({
      completed: false,
      reason: 'PRINCIPAL_REQUIRED'
    });

    expect(dependencies.identityResolve).not.toHaveBeenCalled();
    expect(dependencies.policyResolve).not.toHaveBeenCalled();
    expect(dependencies.evaluate).not.toHaveBeenCalled();
  });

  it('passes authenticated workspace assertions to identity resolution exactly', async () => {
    const dependencies = createDependencies();
    const authorizationRequest = createAuthorizationRequest();

    await new DefaultAuthorizationOrchestrator(dependencies).authorize(authorizationRequest);

    expect(dependencies.identityResolve).toHaveBeenCalledWith({
      principalId: authorizationRequest.context.principalId,
      workspaceId: authorizationRequest.context.workspaceId,
      tenantId: authorizationRequest.context.tenantId,
      branchId: authorizationRequest.context.branchId
    });
  });

  it('omits branchId from identity resolution when no branch assertion exists', async () => {
    const dependencies = createDependencies();
    const authorizationRequest = createAuthorizationRequest();

    const requestWithoutBranch: AuthorizationRequest = {
      ...authorizationRequest,
      context: withoutBranchId(authorizationRequest.context)
    };

    await new DefaultAuthorizationOrchestrator(dependencies).authorize(requestWithoutBranch);

    expect(dependencies.identityResolve).toHaveBeenCalledWith({
      principalId: requestWithoutBranch.context.principalId,
      workspaceId: requestWithoutBranch.context.workspaceId,
      tenantId: requestWithoutBranch.context.tenantId
    });

    const firstCall = dependencies.identityResolve.mock.calls[0];

    expect(firstCall).toBeDefined();
    expect(firstCall?.[0]).not.toHaveProperty('branchId');
  });

  it('propagates identity resolution failure without resolving policy or evaluating', async () => {
    const dependencies = createDependencies({
      identityResult: {
        resolved: false,
        reason: 'TENANT_ASSERTION_MISMATCH'
      }
    });

    const result = await new DefaultAuthorizationOrchestrator(dependencies).authorize(
      createAuthorizationRequest()
    );

    expect(result).toEqual({
      completed: false,
      reason: 'TENANT_ASSERTION_MISMATCH'
    });

    expect(dependencies.policyResolve).not.toHaveBeenCalled();
    expect(dependencies.evaluate).not.toHaveBeenCalled();
  });

  it('propagates identity resolver exceptions instead of converting them to ordinary denial', async () => {
    const dependencies = createDependencies();
    const resolutionError = new Error('identity resolution invariant failure');
    const identityResolve = vi.fn(() => Promise.reject(resolutionError));

    dependencies.identityFactResolver.resolve = identityResolve;

    await expect(
      new DefaultAuthorizationOrchestrator(dependencies).authorize(createAuthorizationRequest())
    ).rejects.toBe(resolutionError);

    expect(dependencies.policyResolve).not.toHaveBeenCalled();
    expect(dependencies.evaluate).not.toHaveBeenCalled();
  });

  it('resolves policy using authoritative tenant and resolved subject', async () => {
    const dependencies = createDependencies();
    const authorizationRequest = createAuthorizationRequest();
    const identityFacts = createIdentityFacts();

    await new DefaultAuthorizationOrchestrator(dependencies).authorize(authorizationRequest);

    expect(dependencies.policyResolve).toHaveBeenCalledWith({
      authorizationRequest,
      subjectId: identityFacts.subjectId,
      tenantId: identityFacts.tenantId
    });
  });

  it('omits subjectId from policy resolution when authoritative identity facts have no subject', async () => {
    const identityFacts = createIdentityFactsWithoutSubject();

    const dependencies = createDependencies({
      identityResult: {
        resolved: true,
        facts: identityFacts
      }
    });

    await new DefaultAuthorizationOrchestrator(dependencies).authorize(
      createAuthorizationRequest()
    );

    const firstCall = dependencies.policyResolve.mock.calls[0];

    expect(firstCall).toBeDefined();
    expect(firstCall?.[0]).toEqual({
      authorizationRequest: createAuthorizationRequest(),
      tenantId: identityFacts.tenantId
    });
    expect(firstCall?.[0]).not.toHaveProperty('subjectId');
  });

  it('propagates policy resolver exceptions without invoking the evaluator', async () => {
    const dependencies = createDependencies();
    const policyError = new Error('policy resolution failure');
    const policyResolve = vi.fn(() => Promise.reject(policyError));

    dependencies.policyFactResolver.resolve = policyResolve;

    await expect(
      new DefaultAuthorizationOrchestrator(dependencies).authorize(createAuthorizationRequest())
    ).rejects.toBe(policyError);

    expect(dependencies.evaluate).not.toHaveBeenCalled();
  });

  it('passes resolved facts through composition before evaluation', async () => {
    let evaluatedInput: AuthorizationEvaluationInput | undefined;

    const dependencies = createDependencies();

    const decision: AuthorizationDecision = {
      allowed: true,
      permissionKey: 'booking.read',
      satisfiedScope: 'TENANT'
    };

    const evaluate = vi.fn((input: AuthorizationEvaluationInput): AuthorizationDecision => {
      evaluatedInput = input;

      return decision;
    });

    dependencies.evaluator.evaluate = evaluate;

    const result = await new DefaultAuthorizationOrchestrator(dependencies).authorize(
      createAuthorizationRequest()
    );

    expect(evaluatedInput).toMatchObject({
      permissionKey: 'booking.read',
      tenantId: asId<TenantId>('authoritative_tenant_01'),
      identityState: 'ACTIVE',
      membershipState: 'ACTIVE',
      organizationState: 'ACTIVE',
      roleAssignmentState: 'ACTIVE',
      entitlementState: 'SATISFIED',
      capabilityState: 'SATISFIED',
      relationshipState: 'NOT_REQUIRED',
      resourcePolicyState: 'NOT_REQUIRED',
      riskPolicyState: 'SATISFIED'
    });

    expect(result).toEqual({
      completed: true,
      decision
    });
  });

  it('treats an evaluator deny as completed orchestration rather than orchestration failure', async () => {
    const decision: AuthorizationDecision = {
      allowed: false,
      permissionKey: 'booking.read',
      reason: 'PERMISSION_NOT_GRANTED'
    };

    const dependencies = createDependencies({
      decision
    });

    const result = await new DefaultAuthorizationOrchestrator(dependencies).authorize(
      createAuthorizationRequest()
    );

    expect(result).toEqual({
      completed: true,
      decision
    });

    expect(dependencies.evaluate).toHaveBeenCalledTimes(1);
  });
});
