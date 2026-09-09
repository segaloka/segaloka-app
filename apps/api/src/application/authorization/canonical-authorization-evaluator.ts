import { PERMISSION_REGISTRY } from '@segaloka/platform-registry';

import { RegistryAuthorizationEvaluator } from './registry-authorization-evaluator.js';

export function createCanonicalAuthorizationEvaluator(): RegistryAuthorizationEvaluator {
  return new RegistryAuthorizationEvaluator(PERMISSION_REGISTRY);
}
