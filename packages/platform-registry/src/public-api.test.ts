import { describe, expect, it } from 'vitest';

import * as publicApi from './index.js';

describe('platform registry public API', () => {
  it('exports the exact runtime authorization surface', () => {
    expect(Object.keys(publicApi).sort()).toEqual(
      [
        'AUTHORIZATION_SCOPES',
        'PERMISSION_CATALOG',
        'PERMISSION_REGISTRY',
        'PERMISSION_VISIBILITIES',
        'canAssignPermissionToTenant',
        'createPermissionRegistry',
        'definePermission',
        'getPermission',
        'isAuthorizationScope',
        'isPermissionKey',
        'isPermissionVisibility',
        'isScopeAllowedForPermission',
        'requirePermission'
      ].sort()
    );
  });

  it('exposes the canonical permission catalog and registry by identity', async () => {
    const catalogModule = await import('./permission-catalog.js');

    expect(publicApi.PERMISSION_CATALOG).toBe(catalogModule.PERMISSION_CATALOG);
    expect(publicApi.PERMISSION_REGISTRY).toBe(catalogModule.PERMISSION_REGISTRY);
  });
});
