import { describe, expect, it } from 'vitest';

import { APPLICATION_ERROR_CODES, createApplicationError } from './application-error.js';

describe('ApplicationError', () => {
  it('exposes the supported application error codes', () => {
    expect(APPLICATION_ERROR_CODES).toContain('VALIDATION_ERROR');
    expect(APPLICATION_ERROR_CODES).toContain('NOT_FOUND');
    expect(APPLICATION_ERROR_CODES).toContain('FORBIDDEN');
    expect(APPLICATION_ERROR_CODES).toContain('BUSINESS_RULE_VIOLATION');
    expect(APPLICATION_ERROR_CODES).toContain('INTERNAL_ERROR');
  });

  it('creates an error without details', () => {
    expect(createApplicationError('NOT_FOUND', 'Travel was not found.')).toEqual({
      code: 'NOT_FOUND',
      message: 'Travel was not found.'
    });
  });

  it('creates an error with structured details', () => {
    expect(
      createApplicationError('VALIDATION_ERROR', 'Validation failed.', {
        field: 'email'
      })
    ).toEqual({
      code: 'VALIDATION_ERROR',
      message: 'Validation failed.',
      details: {
        field: 'email'
      }
    });
  });
});
