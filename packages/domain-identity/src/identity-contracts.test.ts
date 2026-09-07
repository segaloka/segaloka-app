import { describe, expect, it } from 'vitest';

import {
  BRANCH_STATUSES,
  IDENTITY_STATUSES,
  MEMBERSHIP_STATUSES,
  ORGANIZATION_STATUSES,
  ORGANIZATION_TYPES
} from './index.js';

describe('Identity domain contracts', () => {
  it('defines supported identity statuses', () => {
    expect(IDENTITY_STATUSES).toEqual(['ACTIVE', 'SUSPENDED', 'DISABLED']);
  });

  it('defines supported organization types', () => {
    expect(ORGANIZATION_TYPES).toEqual(['PLATFORM', 'TRAVEL', 'VENDOR']);
  });

  it('defines supported organization statuses', () => {
    expect(ORGANIZATION_STATUSES).toEqual(['ACTIVE', 'SUSPENDED', 'TERMINATED']);
  });

  it('defines supported membership statuses', () => {
    expect(MEMBERSHIP_STATUSES).toEqual(['ACTIVE', 'SUSPENDED', 'REVOKED']);
  });

  it('defines supported branch statuses', () => {
    expect(BRANCH_STATUSES).toEqual(['ACTIVE', 'SUSPENDED', 'CLOSED']);
  });
});
