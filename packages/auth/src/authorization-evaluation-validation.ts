import type { AuthorizationEvaluationInput } from './authorization-evaluation.js';

export const AUTHORIZATION_EVALUATION_ERROR_CODES = [
  'ROLE_GRANTS_WITHOUT_ACTIVE_ASSIGNMENT',
  'ACTIVE_ASSIGNMENT_WITHOUT_ROLE_GRANTS',
  'ANONYMOUS_IDENTITY_PRESENT',
  'ANONYMOUS_SUBJECT_PRESENT',
  'ANONYMOUS_MEMBERSHIP_PRESENT',
  'ANONYMOUS_ROLE_ASSIGNMENT_PRESENT',
  'ANONYMOUS_ROLE_GRANTS_PRESENT',
  'ANONYMOUS_BRANCH_ACCESS_PRESENT',
  'MISSING_IDENTITY_WITH_SUBJECT',
  'MISSING_IDENTITY_WITH_MEMBERSHIP',
  'MISSING_IDENTITY_WITH_ROLE_ASSIGNMENT',
  'MISSING_IDENTITY_WITH_ROLE_GRANTS',
  'MISSING_IDENTITY_WITH_BRANCH_ACCESS',
  'MISSING_MEMBERSHIP_WITH_ROLE_ASSIGNMENT',
  'MISSING_MEMBERSHIP_WITH_ROLE_GRANTS',
  'MISSING_MEMBERSHIP_WITH_BRANCH_ACCESS'
] as const;

export type AuthorizationEvaluationErrorCode =
  (typeof AUTHORIZATION_EVALUATION_ERROR_CODES)[number];

export interface AuthorizationEvaluationValidationError {
  readonly code: AuthorizationEvaluationErrorCode;
}

export interface AuthorizationEvaluationValidationResult {
  readonly valid: boolean;
  readonly errors: readonly AuthorizationEvaluationValidationError[];
}

export function validateAuthorizationEvaluationInput(
  input: AuthorizationEvaluationInput
): AuthorizationEvaluationValidationResult {
  const errors: AuthorizationEvaluationValidationError[] = [];

  if (input.roleAssignmentState === 'NONE' && input.roleGrants.length > 0) {
    errors.push({
      code: 'ROLE_GRANTS_WITHOUT_ACTIVE_ASSIGNMENT'
    });
  }

  if (input.roleAssignmentState === 'ACTIVE' && input.roleGrants.length === 0) {
    errors.push({
      code: 'ACTIVE_ASSIGNMENT_WITHOUT_ROLE_GRANTS'
    });
  }

  if (input.context.principalId === undefined) {
    if (input.identityState !== 'MISSING') {
      errors.push({
        code: 'ANONYMOUS_IDENTITY_PRESENT'
      });
    }

    if (input.subjectId !== undefined) {
      errors.push({
        code: 'ANONYMOUS_SUBJECT_PRESENT'
      });
    }

    if (input.membershipState !== 'MISSING') {
      errors.push({
        code: 'ANONYMOUS_MEMBERSHIP_PRESENT'
      });
    }

    if (input.roleAssignmentState !== 'NONE') {
      errors.push({
        code: 'ANONYMOUS_ROLE_ASSIGNMENT_PRESENT'
      });
    }

    if (input.roleGrants.length > 0) {
      errors.push({
        code: 'ANONYMOUS_ROLE_GRANTS_PRESENT'
      });
    }

    if (input.branchAccess.length > 0) {
      errors.push({
        code: 'ANONYMOUS_BRANCH_ACCESS_PRESENT'
      });
    }
  }

  if (input.identityState === 'MISSING') {
    if (input.subjectId !== undefined) {
      errors.push({
        code: 'MISSING_IDENTITY_WITH_SUBJECT'
      });
    }

    if (input.membershipState !== 'MISSING') {
      errors.push({
        code: 'MISSING_IDENTITY_WITH_MEMBERSHIP'
      });
    }

    if (input.roleAssignmentState !== 'NONE') {
      errors.push({
        code: 'MISSING_IDENTITY_WITH_ROLE_ASSIGNMENT'
      });
    }

    if (input.roleGrants.length > 0) {
      errors.push({
        code: 'MISSING_IDENTITY_WITH_ROLE_GRANTS'
      });
    }

    if (input.branchAccess.length > 0) {
      errors.push({
        code: 'MISSING_IDENTITY_WITH_BRANCH_ACCESS'
      });
    }
  }

  if (input.membershipState === 'MISSING') {
    if (input.roleAssignmentState !== 'NONE') {
      errors.push({
        code: 'MISSING_MEMBERSHIP_WITH_ROLE_ASSIGNMENT'
      });
    }

    if (input.roleGrants.length > 0) {
      errors.push({
        code: 'MISSING_MEMBERSHIP_WITH_ROLE_GRANTS'
      });
    }

    if (input.branchAccess.length > 0) {
      errors.push({
        code: 'MISSING_MEMBERSHIP_WITH_BRANCH_ACCESS'
      });
    }
  }

  return Object.freeze({
    valid: errors.length === 0,
    errors: Object.freeze(errors)
  });
}
