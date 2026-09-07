export const APPLICATION_ERROR_CODES = [
  'VALIDATION_ERROR',
  'NOT_FOUND',
  'CONFLICT',
  'UNAUTHORIZED',
  'FORBIDDEN',
  'ENTITLEMENT_REQUIRED',
  'CAPABILITY_RESTRICTED',
  'BUSINESS_RULE_VIOLATION',
  'DEPENDENCY_FAILURE',
  'RATE_LIMITED',
  'INTERNAL_ERROR'
] as const;

export type ApplicationErrorCode = (typeof APPLICATION_ERROR_CODES)[number];

export interface ApplicationError {
  readonly code: ApplicationErrorCode;
  readonly message: string;
  readonly details?: Readonly<Record<string, unknown>>;
}

export function createApplicationError(
  code: ApplicationErrorCode,
  message: string,
  details?: Readonly<Record<string, unknown>>
): ApplicationError {
  return details === undefined
    ? {
        code,
        message
      }
    : {
        code,
        message,
        details
      };
}
