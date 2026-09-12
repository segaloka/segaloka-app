import { describe, expect, it } from 'vitest';

import { PostgresPrincipalIdentityResolutionAdapter } from './index.js';

describe('@segaloka/auth-persistence public contract', () => {
  it('exports the PostgreSQL principal identity resolution adapter', () => {
    expect(PostgresPrincipalIdentityResolutionAdapter).toBeDefined();
    expect(typeof PostgresPrincipalIdentityResolutionAdapter).toBe('function');
  });
});
