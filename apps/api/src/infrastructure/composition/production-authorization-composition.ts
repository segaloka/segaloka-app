import { PostgresPrincipalIdentityResolutionAdapter } from '@segaloka/auth-persistence';
import type { DatabaseConnection } from '@segaloka/database';
import { PostgresIdentityAuthorizationReadAdapter } from '@segaloka/identity-persistence';

import type { AuthorizationPolicyFactResolver } from '../../application/authorization/authorization-policy-fact-resolver.js';
import { createCanonicalAuthorizationEvaluator } from '../../application/authorization/canonical-authorization-evaluator.js';
import { DefaultAuthorizationOrchestrator } from '../../application/authorization/default-authorization-orchestrator.js';
import { DefaultIdentityAuthorizationFactResolver } from '../../application/authorization/default-identity-authorization-fact-resolver.js';

export interface ProductionAuthorizationCompositionDependencies {
  readonly database: DatabaseConnection;
  readonly policyFactResolver: AuthorizationPolicyFactResolver;
}

export function createProductionAuthorizationOrchestrator(
  dependencies: ProductionAuthorizationCompositionDependencies
): DefaultAuthorizationOrchestrator {
  const principalIdentityResolution = new PostgresPrincipalIdentityResolutionAdapter(
    dependencies.database
  );

  const identityAuthorizationReads = new PostgresIdentityAuthorizationReadAdapter(
    dependencies.database
  );

  const identityFactResolver = new DefaultIdentityAuthorizationFactResolver(
    principalIdentityResolution,
    identityAuthorizationReads
  );

  const evaluator = createCanonicalAuthorizationEvaluator();

  return new DefaultAuthorizationOrchestrator({
    identityFactResolver,
    policyFactResolver: dependencies.policyFactResolver,
    evaluator
  });
}
