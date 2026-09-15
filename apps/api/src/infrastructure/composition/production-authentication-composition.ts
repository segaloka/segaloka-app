import { PostgresPrincipalBindingResolutionAdapter } from '@segaloka/auth-persistence';
import type { DatabaseConnection } from '@segaloka/database';

import { DefaultAuthenticatedRequestContextPipeline } from '../../application/authentication/authenticated-request-context-pipeline.js';
import { DefaultAuthenticationPrincipalResolver } from '../../application/authentication/authentication-principal-resolver.js';
import { DefaultRequestContextAssembler } from '../../application/authentication/request-context-assembler.js';

export interface ProductionAuthenticationCompositionDependencies {
  readonly database: DatabaseConnection;
}

export function createProductionAuthenticationPrincipalResolver(
  dependencies: ProductionAuthenticationCompositionDependencies
): DefaultAuthenticationPrincipalResolver {
  const principalBindingResolution = new PostgresPrincipalBindingResolutionAdapter(
    dependencies.database
  );

  return new DefaultAuthenticationPrincipalResolver(principalBindingResolution);
}

export function createProductionRequestContextAssembler(): DefaultRequestContextAssembler {
  return new DefaultRequestContextAssembler();
}

export function createProductionAuthenticatedRequestContextPipeline(
  dependencies: ProductionAuthenticationCompositionDependencies
): DefaultAuthenticatedRequestContextPipeline {
  const principalResolver = createProductionAuthenticationPrincipalResolver(dependencies);
  const contextAssembler = createProductionRequestContextAssembler();

  return new DefaultAuthenticatedRequestContextPipeline({
    principalResolver,
    contextAssembler
  });
}
