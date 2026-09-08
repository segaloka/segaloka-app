import { describe, expect, it } from 'vitest';

import { AUTHORIZATION_ORCHESTRATION_FAILURE_REASONS } from './authorization-orchestration.js';

import { IDENTITY_AUTHORIZATION_FACT_RESOLUTION_FAILURE_REASONS } from './identity-authorization-fact-resolver.js';

describe('authorization orchestration contract', () => {
  it('requires authenticated workspace context before identity resolution', () => {
    expect(AUTHORIZATION_ORCHESTRATION_FAILURE_REASONS).toContain('PRINCIPAL_REQUIRED');
    expect(AUTHORIZATION_ORCHESTRATION_FAILURE_REASONS).toContain('WORKSPACE_REQUIRED');
    expect(AUTHORIZATION_ORCHESTRATION_FAILURE_REASONS).toContain('TENANT_REQUIRED');
  });

  it('preserves every identity authorization resolution failure reason', () => {
    for (const reason of IDENTITY_AUTHORIZATION_FACT_RESOLUTION_FAILURE_REASONS) {
      expect(AUTHORIZATION_ORCHESTRATION_FAILURE_REASONS).toContain(reason);
    }
  });

  it('contains unique failure reason codes', () => {
    expect(new Set(AUTHORIZATION_ORCHESTRATION_FAILURE_REASONS).size).toBe(
      AUTHORIZATION_ORCHESTRATION_FAILURE_REASONS.length
    );
  });

  it('does not mix evaluator deny reasons into orchestration failures', () => {
    expect(AUTHORIZATION_ORCHESTRATION_FAILURE_REASONS).not.toContain('UNAUTHENTICATED');
    expect(AUTHORIZATION_ORCHESTRATION_FAILURE_REASONS).not.toContain('TENANT_MISMATCH');
    expect(AUTHORIZATION_ORCHESTRATION_FAILURE_REASONS).not.toContain('PERMISSION_NOT_GRANTED');
  });
});
