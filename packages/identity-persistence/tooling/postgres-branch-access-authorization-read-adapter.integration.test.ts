import { randomUUID } from 'node:crypto';

import { describe, expect, it } from 'vitest';

import { createDatabaseConnection, databaseSchema } from '@segaloka/database';
import { BRANCH_ACCESS_STATUSES } from '@segaloka/domain-identity';
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

describeIntegration('PostgresIdentityAuthorizationReadAdapter branch access integration', () => {
  it('returns an empty list when the membership has no branch access', async () => {
    const missingMembershipId = randomUUID();

    const connection = createDatabaseConnection({
      url: loadIntegrationDatabaseUrl()
    });

    const adapter = new PostgresIdentityAuthorizationReadAdapter(connection);

    try {
      await expect(
        adapter.listBranchAccessForMembership(asOpaqueId<'MembershipId'>(missingMembershipId))
      ).resolves.toEqual([]);
    } finally {
      await connection.close();
    }
  });

  it('isolates by membership, preserves every supported status, orders by id, and returns frozen domain objects', async () => {
    const identityAId = randomUUID();
    const identityBId = randomUUID();

    const organizationId = randomUUID();

    const membershipAId = randomUUID();
    const membershipBId = randomUUID();

    const branchIds = BRANCH_ACCESS_STATUSES.map(() => randomUUID());
    const isolatedBranchId = randomUUID();

    const branchAccessIds = [
      '00000000-0000-4000-8000-000000000030',
      '00000000-0000-4000-8000-000000000010',
      '00000000-0000-4000-8000-000000000020'
    ] as const;

    const isolatedBranchAccessId = '00000000-0000-4000-8000-000000000040';

    const allBranchIds = [...branchIds, isolatedBranchId];
    const allBranchAccessIds = [...branchAccessIds, isolatedBranchAccessId];

    const connection = createDatabaseConnection({
      url: loadIntegrationDatabaseUrl()
    });

    const adapter = new PostgresIdentityAuthorizationReadAdapter(connection);

    try {
      await connection.db.insert(databaseSchema.identities).values([
        {
          id: identityAId,
          status: 'ACTIVE'
        },
        {
          id: identityBId,
          status: 'ACTIVE'
        }
      ]);

      await connection.db.insert(databaseSchema.organizations).values({
        id: organizationId,
        type: 'TRAVEL',
        status: 'ACTIVE'
      });

      await connection.db.insert(databaseSchema.memberships).values([
        {
          id: membershipAId,
          identityId: identityAId,
          organizationId,
          status: 'ACTIVE'
        },
        {
          id: membershipBId,
          identityId: identityBId,
          organizationId,
          status: 'ACTIVE'
        }
      ]);

      await connection.db.insert(databaseSchema.branches).values(
        allBranchIds.map((id) => ({
          id,
          organizationId,
          status: 'ACTIVE' as const
        }))
      );

      await connection.db.insert(databaseSchema.branchAccess).values([
        {
          id: branchAccessIds[0],
          organizationId,
          membershipId: membershipAId,
          branchId: branchIds[0]!,
          status: BRANCH_ACCESS_STATUSES[0]
        },
        {
          id: branchAccessIds[1],
          organizationId,
          membershipId: membershipAId,
          branchId: branchIds[1]!,
          status: BRANCH_ACCESS_STATUSES[1]
        },
        {
          id: branchAccessIds[2],
          organizationId,
          membershipId: membershipAId,
          branchId: branchIds[2]!,
          status: BRANCH_ACCESS_STATUSES[2]
        },
        {
          id: isolatedBranchAccessId,
          organizationId,
          membershipId: membershipBId,
          branchId: isolatedBranchId,
          status: 'ACTIVE'
        }
      ]);

      const result = await adapter.listBranchAccessForMembership(
        asOpaqueId<'MembershipId'>(membershipAId)
      );

      expect(result).toEqual([
        {
          id: branchAccessIds[1],
          membershipId: membershipAId,
          branchId: branchIds[1],
          status: BRANCH_ACCESS_STATUSES[1]
        },
        {
          id: branchAccessIds[2],
          membershipId: membershipAId,
          branchId: branchIds[2],
          status: BRANCH_ACCESS_STATUSES[2]
        },
        {
          id: branchAccessIds[0],
          membershipId: membershipAId,
          branchId: branchIds[0],
          status: BRANCH_ACCESS_STATUSES[0]
        }
      ]);

      expect(result.map((branchAccess) => branchAccess.status)).toEqual([
        'SUSPENDED',
        'REVOKED',
        'ACTIVE'
      ]);

      expect(result).toHaveLength(BRANCH_ACCESS_STATUSES.length);

      for (const branchAccess of result) {
        expect(Object.isFrozen(branchAccess)).toBe(true);
        expect(branchAccess.membershipId).toBe(membershipAId);
      }

      expect(result.some((branchAccess) => branchAccess.id === isolatedBranchAccessId)).toBe(false);

      const isolatedResult = await adapter.listBranchAccessForMembership(
        asOpaqueId<'MembershipId'>(membershipBId)
      );

      expect(isolatedResult).toEqual([
        {
          id: isolatedBranchAccessId,
          membershipId: membershipBId,
          branchId: isolatedBranchId,
          status: 'ACTIVE'
        }
      ]);

      expect(Object.isFrozen(isolatedResult[0])).toBe(true);
    } finally {
      try {
        await connection.db
          .delete(databaseSchema.branchAccess)
          .where(inArray(databaseSchema.branchAccess.id, allBranchAccessIds));

        await connection.db
          .delete(databaseSchema.branches)
          .where(inArray(databaseSchema.branches.id, allBranchIds));

        await connection.db
          .delete(databaseSchema.memberships)
          .where(inArray(databaseSchema.memberships.id, [membershipAId, membershipBId]));

        await connection.db
          .delete(databaseSchema.organizations)
          .where(inArray(databaseSchema.organizations.id, [organizationId]));

        await connection.db
          .delete(databaseSchema.identities)
          .where(inArray(databaseSchema.identities.id, [identityAId, identityBId]));

        const remainingBranchAccess = await connection.db
          .select({
            id: databaseSchema.branchAccess.id
          })
          .from(databaseSchema.branchAccess)
          .where(inArray(databaseSchema.branchAccess.id, allBranchAccessIds));

        expect(remainingBranchAccess).toEqual([]);
      } finally {
        await connection.close();
      }
    }
  });

  it('rejects cross-organization branch access through database composite foreign keys', async () => {
    const identityId = randomUUID();

    const organizationAId = randomUUID();
    const organizationBId = randomUUID();

    const membershipId = randomUUID();
    const branchId = randomUUID();
    const branchAccessId = randomUUID();

    const connection = createDatabaseConnection({
      url: loadIntegrationDatabaseUrl()
    });

    try {
      await connection.db.insert(databaseSchema.identities).values({
        id: identityId,
        status: 'ACTIVE'
      });

      await connection.db.insert(databaseSchema.organizations).values([
        {
          id: organizationAId,
          type: 'TRAVEL',
          status: 'ACTIVE'
        },
        {
          id: organizationBId,
          type: 'TRAVEL',
          status: 'ACTIVE'
        }
      ]);

      await connection.db.insert(databaseSchema.memberships).values({
        id: membershipId,
        identityId,
        organizationId: organizationAId,
        status: 'ACTIVE'
      });

      await connection.db.insert(databaseSchema.branches).values({
        id: branchId,
        organizationId: organizationBId,
        status: 'ACTIVE'
      });

      await expect(
        connection.db.insert(databaseSchema.branchAccess).values({
          id: branchAccessId,
          organizationId: organizationAId,
          membershipId,
          branchId,
          status: 'ACTIVE'
        })
      ).rejects.toThrow();

      const persistedCrossOrganizationAccess = await connection.db
        .select({
          id: databaseSchema.branchAccess.id
        })
        .from(databaseSchema.branchAccess)
        .where(inArray(databaseSchema.branchAccess.id, [branchAccessId]));

      expect(persistedCrossOrganizationAccess).toEqual([]);
    } finally {
      try {
        await connection.db
          .delete(databaseSchema.branchAccess)
          .where(inArray(databaseSchema.branchAccess.id, [branchAccessId]));

        await connection.db
          .delete(databaseSchema.branches)
          .where(inArray(databaseSchema.branches.id, [branchId]));

        await connection.db
          .delete(databaseSchema.memberships)
          .where(inArray(databaseSchema.memberships.id, [membershipId]));

        await connection.db
          .delete(databaseSchema.organizations)
          .where(inArray(databaseSchema.organizations.id, [organizationAId, organizationBId]));

        await connection.db
          .delete(databaseSchema.identities)
          .where(inArray(databaseSchema.identities.id, [identityId]));
      } finally {
        await connection.close();
      }
    }
  });
});
