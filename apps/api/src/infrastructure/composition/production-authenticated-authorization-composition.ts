import type { DatabaseConnection } from '@segaloka/database';

import { DefaultAuthenticatedAuthorizationPipeline } from '../../application/authentication/authenticated-authorization-pipeline.js';
import type { AuthorizationPolicyFactResolver } from '../../application/authorization/authorization-policy-fact-resolver.js';

import { createProductionAuthenticatedRequestContextPipeline } from './production-authentication-composition.js';
import { createProductionAuthorizationOrchestrator } from './production-authorization-composition.js';

export interface ProductionAuthenticatedAuthorizationCompositionDependencies {
  readonly database: DatabaseConnection;
  readonly policyFactResolver: AuthorizationPolicyFactResolver;
}

export function createProductionAuthenticatedAuthorizationPipeline(
  dependencies: ProductionAuthenticatedAuthorizationCompositionDependencies
): DefaultAuthenticatedAuthorizationPipeline {
  const authenticationPipeline = createProductionAuthenticatedRequestContextPipeline({
    database: dependencies.database
  });

  const authorizationOrchestrator = createProductionAuthorizationOrchestrator({
    database: dependencies.database,
    policyFactResolver: dependencies.policyFactResolver
  });

  return new DefaultAuthenticatedAuthorizationPipeline({
    authenticationPipeline,
    authorizationOrchestrator
  });
}
