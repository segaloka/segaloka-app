import { describe, expect, it, vi } from 'vitest';

import type { DatabaseConnection } from '@segaloka/database';

import type {
  AuthorizationPolicyFactResolver,
  AuthorizationPolicyFacts,
  AuthorizationPolicyFactResolutionRequest
} from '../../application/authorization/authorization-policy-fact-resolver.js';
import { DefaultAuthorizationOrchestrator } from '../../application/authorization/default-authorization-orchestrator.js';

import { createProductionAuthorizationOrchestrator } from './production-authorization-composition.js';

function createDatabaseConnectionStub(): DatabaseConnection {
  return {
    client: {} as DatabaseConnection['client'],
    db: {} as DatabaseConnection['db'],
    close: vi.fn(() => Promise.resolve())
  };
}

function createPolicyFactResolver(): {
  readonly resolver: AuthorizationPolicyFactResolver;
  readonly resolve: ReturnType<
    typeof vi.fn<
      (request: AuthorizationPolicyFactResolutionRequest) => Promise<AuthorizationPolicyFacts>
    >
  >;
} {
  const facts: AuthorizationPolicyFacts = {
    entitlementState: 'SATISFIED',
    capabilityState: 'SATISFIED',
    relationshipState: 'NOT_REQUIRED',
    resourcePolicyState: 'NOT_REQUIRED',
    riskPolicyState: 'SATISFIED'
  };

  const resolve = vi.fn((): Promise<AuthorizationPolicyFacts> => Promise.resolve(facts));

  return {
    resolver: {
      resolve
    },
    resolve
  };
}

describe('production authorization composition', () => {
  it('creates the production authorization orchestrator from injected infrastructure dependencies', () => {
    const database = createDatabaseConnectionStub();
    const policy = createPolicyFactResolver();

    const orchestrator = createProductionAuthorizationOrchestrator({
      database,
      policyFactResolver: policy.resolver
    });

    expect(orchestrator).toBeInstanceOf(DefaultAuthorizationOrchestrator);
  });

  it('does not take ownership of the injected database connection lifecycle', () => {
    const database = createDatabaseConnectionStub();

    createProductionAuthorizationOrchestrator({
      database,
      policyFactResolver: createPolicyFactResolver().resolver
    });

    expect(database.close).not.toHaveBeenCalled();
  });

  it('accepts policy resolution as an explicit production dependency instead of inventing fallback policy facts', () => {
    const policy = createPolicyFactResolver();

    const orchestrator = createProductionAuthorizationOrchestrator({
      database: createDatabaseConnectionStub(),
      policyFactResolver: policy.resolver
    });

    expect(orchestrator).toBeInstanceOf(DefaultAuthorizationOrchestrator);
    expect(policy.resolve).not.toHaveBeenCalled();
  });
});
