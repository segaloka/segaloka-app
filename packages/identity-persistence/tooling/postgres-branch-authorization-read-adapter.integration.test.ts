import { randomUUID } from 'node:crypto';

import { describe, expect, it } from 'vitest';

import { createDatabaseConnection, databaseSchema } from '@segaloka/database';
import { BRANCH_STATUSES } from '@segaloka/domain-identity';
import { asOpaqueId } from '@segaloka/shared-kernel';
import { inArray } from 'drizzle-orm';

import { PostgresIdentityAuthorizationReadAdapter } from '../src/postgres-identity-authorization-read-adapter.js';

const integrationEnabled = process.env.SEGALOKA_DATABASE_INTEGRATION === '1';

const describeIntegration = integrationEnabled ? describe : describe.skip;

function loadIntegrationDatabaseUrl(): string {
  const databaseUrl = process.env.DATABASE_URL;

  if (databaseUrl === undefined || databaseUrl.trim().length === 0) {
    throw new Error('DATABASE_URL is required for identity persistence integration tests.');
  }

  return databaseUrl;
}

describeIntegration('PostgresIdentityAuthorizationReadAdapter branch integration', () => {
  it('returns an empty list for empty branch ids without requiring persisted rows', async () => {
    const connection = createDatabaseConnection({
      url: loadIntegrationDatabaseUrl()
    });

    const adapter = new PostgresIdentityAuthorizationReadAdapter(connection);

    try {
      await expect(adapter.findBranchesByIds([])).resolves.toEqual([]);
    } finally {
      await connection.close();
    }
  });

  it('batches branch ids, preserves every supported status, omits missing ids, deduplicates requested ids, orders by id, and returns frozen domain objects', async () => {
    const organizationAId = randomUUID();
    const organizationBId = randomUUID();

    const branchIds = BRANCH_STATUSES.map(() => randomUUID());
    const isolatedBranchId = randomUUID();
    const missingBranchId = randomUUID();

    const allPersistedBranchIds = [...branchIds, isolatedBranchId];

    const connection = createDatabaseConnection({
      url: loadIntegrationDatabaseUrl()
    });

    const adapter = new PostgresIdentityAuthorizationReadAdapter(connection);

    try {
      await connection.db.insert(databaseSchema.organizations).values([
        {
          id: organizationAId,
          type: 'TRAVEL',
          status: 'ACTIVE'
        },
        {
          id: organizationBId,
          type: 'VENDOR',
          status: 'ACTIVE'
        }
      ]);

      await connection.db.insert(databaseSchema.branches).values([
        {
          id: branchIds[0]!,
          organizationId: organizationAId,
          status: BRANCH_STATUSES[0]
        },
        {
          id: branchIds[1]!,
          organizationId: organizationAId,
          status: BRANCH_STATUSES[1]
        },
        {
          id: branchIds[2]!,
          organizationId: organizationBId,
          status: BRANCH_STATUSES[2]
        },
        {
          id: isolatedBranchId,
          organizationId: organizationBId,
          status: 'ACTIVE'
        }
      ]);

      const requestedIds = [
        branchIds[2]!,
        branchIds[0]!,
        missingBranchId,
        branchIds[1]!,
        branchIds[0]!,
        branchIds[2]!
      ].map((id) => asOpaqueId<'BranchId'>(id));

      const result = await adapter.findBranchesByIds(requestedIds);

      const expected = [
        {
          id: branchIds[0]!,
          organizationId: organizationAId,
          status: BRANCH_STATUSES[0]
        },
        {
          id: branchIds[1]!,
          organizationId: organizationAId,
          status: BRANCH_STATUSES[1]
        },
        {
          id: branchIds[2]!,
          organizationId: organizationBId,
          status: BRANCH_STATUSES[2]
        }
      ].sort((left, right) => left.id.localeCompare(right.id));

      expect(result).toEqual(expected);

      expect(result).toHaveLength(BRANCH_STATUSES.length);

      expect(result.map((branch) => branch.id)).toEqual(
        [...result.map((branch) => branch.id)].sort((left, right) => left.localeCompare(right))
      );

      expect(new Set(result.map((branch) => branch.id)).size).toBe(result.length);

      expect(result.some((branch) => branch.id === missingBranchId)).toBe(false);

      expect(result.some((branch) => branch.id === isolatedBranchId)).toBe(false);

      expect(new Set(result.map((branch) => branch.status))).toEqual(new Set(BRANCH_STATUSES));

      for (const branch of result) {
        expect(Object.isFrozen(branch)).toBe(true);
      }

      const branchFromOrganizationA = result.filter(
        (branch) => branch.organizationId === organizationAId
      );

      const branchFromOrganizationB = result.filter(
        (branch) => branch.organizationId === organizationBId
      );

      expect(branchFromOrganizationA).toHaveLength(2);
      expect(branchFromOrganizationB).toHaveLength(1);
    } finally {
      try {
        await connection.db
          .delete(databaseSchema.branches)
          .where(inArray(databaseSchema.branches.id, allPersistedBranchIds));

        await connection.db
          .delete(databaseSchema.organizations)
          .where(inArray(databaseSchema.organizations.id, [organizationAId, organizationBId]));

        const remainingBranches = await connection.db
          .select({
            id: databaseSchema.branches.id
          })
          .from(databaseSchema.branches)
          .where(inArray(databaseSchema.branches.id, allPersistedBranchIds));

        expect(remainingBranches).toEqual([]);
      } finally {
        await connection.close();
      }
    }
  });
});
