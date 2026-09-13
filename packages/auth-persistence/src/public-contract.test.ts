import { describe, expect, it } from 'vitest';

import * as publicApi from './index.js';

describe('@segaloka/auth-persistence public contract', () => {
  it('exports only the production persistence adapters', () => {
    expect(Object.keys(publicApi).sort()).toEqual([
      'PostgresPrincipalBindingResolutionAdapter',
      'PostgresPrincipalIdentityResolutionAdapter'
    ]);
  });
});
