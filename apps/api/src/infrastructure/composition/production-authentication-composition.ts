import { PostgresPrincipalBindingResolutionAdapter } from '@segaloka/auth-persistence';
import type { DatabaseConnection } from '@segaloka/database';

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
