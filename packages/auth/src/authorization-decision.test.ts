import { describe, expect, it } from 'vitest';

import {
  allowAuthorization,
  denyAuthorization,
  isAuthorizationAllowed,
  isAuthorizationDenied
} from './authorization-decision.js';

describe('Authorization decision factories', () => {
  it('creates an immutable allow decision', () => {
    const decision = allowAuthorization('booking.read', 'BRANCH');

    expect(decision).toEqual({
      allowed: true,
      permissionKey: 'booking.read',
      satisfiedScope: 'BRANCH'
    });

    expect(Object.isFrozen(decision)).toBe(true);
  });

  it('creates an immutable deny decision', () => {
    const decision = denyAuthorization('booking.read', 'PERMISSION_NOT_GRANTED');

    expect(decision).toEqual({
      allowed: false,
      permissionKey: 'booking.read',
      reason: 'PERMISSION_NOT_GRANTED'
    });

    expect(Object.isFrozen(decision)).toBe(true);
  });

  it('detects allowed decisions', () => {
    const decision = allowAuthorization('booking.read', 'TENANT');

    expect(isAuthorizationAllowed(decision)).toBe(true);

    expect(isAuthorizationDenied(decision)).toBe(false);
  });

  it('detects denied decisions', () => {
    const decision = denyAuthorization('booking.read', 'TENANT_MISMATCH');

    expect(isAuthorizationAllowed(decision)).toBe(false);

    expect(isAuthorizationDenied(decision)).toBe(true);
  });

  it('rejects an unknown deny reason at runtime', () => {
    expect(() => denyAuthorization('booking.read', 'UNKNOWN_REASON' as never)).toThrow(
      'Unknown authorization deny reason "UNKNOWN_REASON".'
    );
  });
});
