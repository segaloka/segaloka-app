import { randomUUID } from 'node:crypto';

import { describe, expect, it } from 'vitest';

import { createDatabaseConnection, databaseSchema } from '@segaloka/database';
import { ROLE_ASSIGNMENT_STATUSES } from '@segaloka/domain-identity';
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

describeIntegration('PostgresIdentityAuthorizationReadAdapter role assignment integration', () => {
  it('returns an empty list when the membership has no role assignments', async () => {
    const missingMembershipId = randomUUID();

    const connection = createDatabaseConnection({
      url: loadIntegrationDatabaseUrl()
    });

    const adapter = new PostgresIdentityAuthorizationReadAdapter(connection);

    try {
      await expect(
        adapter.listRoleAssignmentsForMembership(asOpaqueId<'MembershipId'>(missingMembershipId))
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

    const roleIds = ROLE_ASSIGNMENT_STATUSES.map(() => randomUUID());
    const isolatedRoleId = randomUUID();

    const roleAssignmentIds = [
      '10000000-0000-4000-8000-000000000030',
      '10000000-0000-4000-8000-000000000010',
      '10000000-0000-4000-8000-000000000020'
    ] as const;

    const isolatedRoleAssignmentId = '10000000-0000-4000-8000-000000000040';

    const allRoleIds = [...roleIds, isolatedRoleId];
    const allRoleAssignmentIds = [...roleAssignmentIds, isolatedRoleAssignmentId];

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

      await connection.db.insert(databaseSchema.roles).values(
        allRoleIds.map((id, index) => ({
          id,
          organizationId,
          name: `Integration Role ${index + 1}`,
          kind: 'CUSTOM' as const,
          status: 'ACTIVE' as const
        }))
      );

      await connection.db.insert(databaseSchema.roleAssignments).values([
        {
          id: roleAssignmentIds[0],
          organizationId,
          membershipId: membershipAId,
          roleId: roleIds[0]!,
          status: ROLE_ASSIGNMENT_STATUSES[0]
        },
        {
          id: roleAssignmentIds[1],
          organizationId,
          membershipId: membershipAId,
          roleId: roleIds[1]!,
          status: ROLE_ASSIGNMENT_STATUSES[1]
        },
        {
          id: roleAssignmentIds[2],
          organizationId,
          membershipId: membershipAId,
          roleId: roleIds[2]!,
          status: ROLE_ASSIGNMENT_STATUSES[2]
        },
        {
          id: isolatedRoleAssignmentId,
          organizationId,
          membershipId: membershipBId,
          roleId: isolatedRoleId,
          status: 'ACTIVE'
        }
      ]);

      const result = await adapter.listRoleAssignmentsForMembership(
        asOpaqueId<'MembershipId'>(membershipAId)
      );

      expect(result).toEqual([
        {
          id: roleAssignmentIds[1],
          membershipId: membershipAId,
          roleId: roleIds[1],
          status: ROLE_ASSIGNMENT_STATUSES[1]
        },
        {
          id: roleAssignmentIds[2],
          membershipId: membershipAId,
          roleId: roleIds[2],
          status: ROLE_ASSIGNMENT_STATUSES[2]
        },
        {
          id: roleAssignmentIds[0],
          membershipId: membershipAId,
          roleId: roleIds[0],
          status: ROLE_ASSIGNMENT_STATUSES[0]
        }
      ]);

      expect(result.map((assignment) => assignment.status)).toEqual([
        'SUSPENDED',
        'REVOKED',
        'ACTIVE'
      ]);

      expect(result).toHaveLength(ROLE_ASSIGNMENT_STATUSES.length);

      for (const assignment of result) {
        expect(Object.isFrozen(assignment)).toBe(true);
        expect(assignment.membershipId).toBe(membershipAId);
      }

      expect(result.some((assignment) => assignment.id === isolatedRoleAssignmentId)).toBe(false);

      const isolatedResult = await adapter.listRoleAssignmentsForMembership(
        asOpaqueId<'MembershipId'>(membershipBId)
      );

      expect(isolatedResult).toEqual([
        {
          id: isolatedRoleAssignmentId,
          membershipId: membershipBId,
          roleId: isolatedRoleId,
          status: 'ACTIVE'
        }
      ]);

      expect(Object.isFrozen(isolatedResult[0])).toBe(true);
    } finally {
      try {
        await connection.db
          .delete(databaseSchema.roleAssignments)
          .where(inArray(databaseSchema.roleAssignments.id, allRoleAssignmentIds));

        await connection.db
          .delete(databaseSchema.roles)
          .where(inArray(databaseSchema.roles.id, allRoleIds));

        await connection.db
          .delete(databaseSchema.memberships)
          .where(inArray(databaseSchema.memberships.id, [membershipAId, membershipBId]));

        await connection.db
          .delete(databaseSchema.organizations)
          .where(inArray(databaseSchema.organizations.id, [organizationId]));

        await connection.db
          .delete(databaseSchema.identities)
          .where(inArray(databaseSchema.identities.id, [identityAId, identityBId]));

        const remainingAssignments = await connection.db
          .select({
            id: databaseSchema.roleAssignments.id
          })
          .from(databaseSchema.roleAssignments)
          .where(inArray(databaseSchema.roleAssignments.id, allRoleAssignmentIds));

        expect(remainingAssignments).toEqual([]);
      } finally {
        await connection.close();
      }
    }
  });

  it('rejects cross-organization role assignments through database composite foreign keys', async () => {
    const identityId = randomUUID();

    const organizationAId = randomUUID();
    const organizationBId = randomUUID();

    const membershipId = randomUUID();
    const roleId = randomUUID();
    const roleAssignmentId = randomUUID();

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

      await connection.db.insert(databaseSchema.roles).values({
        id: roleId,
        organizationId: organizationBId,
        name: 'Cross Organization Role',
        kind: 'CUSTOM',
        status: 'ACTIVE'
      });

      await expect(
        connection.db.insert(databaseSchema.roleAssignments).values({
          id: roleAssignmentId,
          organizationId: organizationAId,
          membershipId,
          roleId,
          status: 'ACTIVE'
        })
      ).rejects.toThrow();

      const persistedCrossOrganizationAssignment = await connection.db
        .select({
          id: databaseSchema.roleAssignments.id
        })
        .from(databaseSchema.roleAssignments)
        .where(inArray(databaseSchema.roleAssignments.id, [roleAssignmentId]));

      expect(persistedCrossOrganizationAssignment).toEqual([]);
    } finally {
      try {
        await connection.db
          .delete(databaseSchema.roleAssignments)
          .where(inArray(databaseSchema.roleAssignments.id, [roleAssignmentId]));

        await connection.db
          .delete(databaseSchema.roles)
          .where(inArray(databaseSchema.roles.id, [roleId]));

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
