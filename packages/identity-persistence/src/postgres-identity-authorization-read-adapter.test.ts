import { describe, expect, it } from 'vitest';

import type { DatabaseConnection } from '@segaloka/database';

import { PostgresIdentityAuthorizationReadAdapter } from './postgres-identity-authorization-read-adapter.js';

function createUnusableConnection(): DatabaseConnection {
  return Object.freeze({
    client: {} as DatabaseConnection['client'],
    db: {} as DatabaseConnection['db'],
    close: () => Promise.resolve()
  });
}

describe('PostgresIdentityAuthorizationReadAdapter unit behavior', () => {
  it('returns an empty branch collection without touching the database', async () => {
    const adapter = new PostgresIdentityAuthorizationReadAdapter(createUnusableConnection());

    await expect(adapter.findBranchesByIds([])).resolves.toEqual([]);
  });

  it('returns an empty role collection without touching the database', async () => {
    const adapter = new PostgresIdentityAuthorizationReadAdapter(createUnusableConnection());

    await expect(adapter.findRolesByIds([])).resolves.toEqual([]);
  });
});
