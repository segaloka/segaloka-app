import { describe, expect, it, vi } from 'vitest';

import type { DatabaseConnection } from '@segaloka/database';

import {
  PostgresPackagePublicationReadAdapter,
  type PackagePublicationOwnership
} from './postgres-package-publication-read-adapter.js';

const packageId = '11111111-1111-4111-8111-111111111111';
const organizationId = '22222222-2222-4222-8222-222222222222';
const travelId = '33333333-3333-4333-8333-333333333333';

function createSubject(rows: PackagePublicationOwnership[] = []) {
  const query = vi.fn<
    (
      strings: TemplateStringsArray,
      ...values: readonly unknown[]
    ) => Promise<PackagePublicationOwnership[]>
  >(() => Promise.resolve(rows));

  // Test-only tagged-query double. No database connection is opened.
  const database = {
    client: query
  } as unknown as DatabaseConnection;

  return {
    query,
    adapter: new PostgresPackagePublicationReadAdapter(database)
  };
}

describe('PostgresPackagePublicationReadAdapter', () => {
  it('returns persisted package ownership', async () => {
    const ownership = { packageId, travelId, organizationId };
    const { adapter, query } = createSubject([ownership]);

    expect(await adapter.findOwnedPackage(packageId, organizationId)).toEqual(ownership);
    expect(query).toHaveBeenCalledTimes(1);
  });

  it('binds package and organization IDs instead of interpolating SQL text', async () => {
    const { adapter, query } = createSubject();

    await adapter.findOwnedPackage(packageId, organizationId);

    const call = query.mock.calls[0];
    expect(call).toBeDefined();

    const sql = call![0].join('?');

    expect(sql).toMatch(/inner join public\.marketplace_travels/);
    expect(sql).toMatch(/t\.id = p\.travel_id/);
    expect(sql).toMatch(/p\.id = \?::uuid/);
    expect(sql).toMatch(/t\.organization_id = \?::uuid/);
    expect(sql).toMatch(/limit 1/);
    expect(sql).not.toContain(packageId);
    expect(sql).not.toContain(organizationId);
    expect(call!.slice(1)).toEqual([packageId, organizationId]);
  });

  it('returns null when the scoped query finds no package', async () => {
    const { adapter } = createSubject();

    expect(await adapter.findOwnedPackage(packageId, organizationId)).toBeNull();
  });

  it.each([
    ['', organizationId],
    ['invalid-package', organizationId],
    [packageId, ''],
    [packageId, 'invalid-organization'],
    ["' OR true --", organizationId]
  ])('rejects invalid IDs without querying: %s / %s', async (id, tenant) => {
    const { adapter, query } = createSubject();

    expect(await adapter.findOwnedPackage(id, tenant)).toBeNull();
    expect(query).not.toHaveBeenCalled();
  });

  it('propagates infrastructure errors instead of treating them as missing data', async () => {
    const { adapter, query } = createSubject();
    const failure = new Error('database unavailable');
    query.mockRejectedValueOnce(failure);

    await expect(adapter.findOwnedPackage(packageId, organizationId)).rejects.toBe(failure);
  });
});
