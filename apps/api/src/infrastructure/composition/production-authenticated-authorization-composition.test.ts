import type { DatabaseConnection } from '@segaloka/database';
import { describe, expect, it, vi } from 'vitest';

import { DefaultAuthenticatedAuthorizationPipeline } from '../../application/authentication/authenticated-authorization-pipeline.js';
import type {
  AuthorizationPolicyFactResolver,
  AuthorizationPolicyFacts,
  AuthorizationPolicyFactResolutionRequest
} from '../../application/authorization/authorization-policy-fact-resolver.js';

import { createProductionAuthenticatedAuthorizationPipeline } from './production-authenticated-authorization-composition.js';

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

describe('production authenticated authorization composition', () => {
  it('creates the production authenticated authorization pipeline', () => {
    const pipeline = createProductionAuthenticatedAuthorizationPipeline({
      database: createDatabaseConnectionStub(),
      policyFactResolver: createPolicyFactResolver().resolver
    });

    expect(pipeline).toBeInstanceOf(DefaultAuthenticatedAuthorizationPipeline);
  });

  it('does not take ownership of the injected database connection lifecycle', () => {
    const database = createDatabaseConnectionStub();

    createProductionAuthenticatedAuthorizationPipeline({
      database,
      policyFactResolver: createPolicyFactResolver().resolver
    });

    expect(database.close).not.toHaveBeenCalled();
  });

  it('accepts policy resolution as an explicit dependency without resolving policy during composition', () => {
    const policy = createPolicyFactResolver();

    const pipeline = createProductionAuthenticatedAuthorizationPipeline({
      database: createDatabaseConnectionStub(),
      policyFactResolver: policy.resolver
    });

    expect(pipeline).toBeInstanceOf(DefaultAuthenticatedAuthorizationPipeline);
    expect(policy.resolve).not.toHaveBeenCalled();
  });

  it('creates independent authenticated authorization pipeline instances', () => {
    const database = createDatabaseConnectionStub();
    const policyFactResolver = createPolicyFactResolver().resolver;

    const firstPipeline = createProductionAuthenticatedAuthorizationPipeline({
      database,
      policyFactResolver
    });

    const secondPipeline = createProductionAuthenticatedAuthorizationPipeline({
      database,
      policyFactResolver
    });

    expect(firstPipeline).toBeInstanceOf(DefaultAuthenticatedAuthorizationPipeline);
    expect(secondPipeline).toBeInstanceOf(DefaultAuthenticatedAuthorizationPipeline);
    expect(firstPipeline).not.toBe(secondPipeline);
  });
});
