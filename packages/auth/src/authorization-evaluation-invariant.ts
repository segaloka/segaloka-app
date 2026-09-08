import { validateAuthorizationEvaluationInput } from './authorization-evaluation-validation.js';

import type { AuthorizationEvaluationValidationError } from './authorization-evaluation-validation.js';

import type { AuthorizationEvaluationInput } from './authorization-evaluation.js';

export class AuthorizationEvaluationInvariantError extends Error {
  readonly errors: readonly AuthorizationEvaluationValidationError[];

  constructor(errors: readonly AuthorizationEvaluationValidationError[]) {
    super(`Authorization evaluation input violated ${errors.length} invariant(s).`);

    this.name = 'AuthorizationEvaluationInvariantError';

    this.errors = Object.freeze(
      errors.map((error) =>
        Object.freeze({
          code: error.code
        })
      )
    );
  }
}

export function assertValidAuthorizationEvaluationInput(input: AuthorizationEvaluationInput): void {
  const validation = validateAuthorizationEvaluationInput(input);

  if (!validation.valid) {
    throw new AuthorizationEvaluationInvariantError(validation.errors);
  }
}
