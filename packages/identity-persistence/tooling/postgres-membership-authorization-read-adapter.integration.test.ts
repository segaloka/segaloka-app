import { randomUUID } from 'node:crypto';

import { describe, expect, it } from 'vitest';

import { createDatabaseConnection, databaseSchema } from '@segaloka/database';
import { MEMBERSHIP_STATUSES } from '@segaloka/domain-identity';
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

describeIntegration('PostgresIdentityAuthorizationReadAdapter membership integration', () => {
  it('isolates membership lookup by both identity and organization', async () => {
    const identityId = randomUUID();
    const organizationAId = randomUUID();
    const organizationBId = randomUUID();

    const membershipAId = randomUUID();
    const membershipBId = randomUUID();

    const missingOrganizationId = randomUUID();

    const connection = createDatabaseConnection({
      url: loadIntegrationDatabaseUrl()
    });

    const adapter = new PostgresIdentityAuthorizationReadAdapter(connection);

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
          type: 'VENDOR',
          status: 'ACTIVE'
        },
        {
          id: missingOrganizationId,
          type: 'PLATFORM',
          status: 'ACTIVE'
        }
      ]);

      await connection.db.insert(databaseSchema.memberships).values([
        {
          id: membershipAId,
          identityId,
          organizationId: organizationAId,
          status: 'ACTIVE'
        },
        {
          id: membershipBId,
          identityId,
          organizationId: organizationBId,
          status: 'SUSPENDED'
        }
      ]);

      const membershipA = await adapter.findMembership(
        asOpaqueId<'IdentityId'>(identityId),
        asOpaqueId<'OrganizationId'>(organizationAId)
      );

      expect(membershipA).toEqual({
        id: membershipAId,
        identityId,
        organizationId: organizationAId,
        status: 'ACTIVE'
      });

      expect(Object.isFrozen(membershipA)).toBe(true);

      const membershipB = await adapter.findMembership(
        asOpaqueId<'IdentityId'>(identityId),
        asOpaqueId<'OrganizationId'>(organizationBId)
      );

      expect(membershipB).toEqual({
        id: membershipBId,
        identityId,
        organizationId: organizationBId,
        status: 'SUSPENDED'
      });

      expect(Object.isFrozen(membershipB)).toBe(true);

      await expect(
        adapter.findMembership(
          asOpaqueId<'IdentityId'>(identityId),
          asOpaqueId<'OrganizationId'>(missingOrganizationId)
        )
      ).resolves.toBeUndefined();
    } finally {
      try {
        await connection.db
          .delete(databaseSchema.memberships)
          .where(inArray(databaseSchema.memberships.id, [membershipAId, membershipBId]));

        await connection.db
          .delete(databaseSchema.organizations)
          .where(
            inArray(databaseSchema.organizations.id, [
              organizationAId,
              organizationBId,
              missingOrganizationId
            ])
          );

        await connection.db
          .delete(databaseSchema.identities)
          .where(inArray(databaseSchema.identities.id, [identityId]));

        const remainingMemberships = await connection.db
          .select({
            id: databaseSchema.memberships.id
          })
          .from(databaseSchema.memberships)
          .where(inArray(databaseSchema.memberships.id, [membershipAId, membershipBId]));

        expect(remainingMemberships).toEqual([]);
      } finally {
        await connection.close();
      }
    }
  });

  it('preserves every supported membership status without filtering authorization facts', async () => {
    const identityIds = MEMBERSHIP_STATUSES.map(() => randomUUID());

    const organizationIds = MEMBERSHIP_STATUSES.map(() => randomUUID());

    const membershipIds = MEMBERSHIP_STATUSES.map(() => randomUUID());

    const fixtures = MEMBERSHIP_STATUSES.map((status, index) => ({
      id: membershipIds[index]!,
      identityId: identityIds[index]!,
      organizationId: organizationIds[index]!,
      status
    }));

    const connection = createDatabaseConnection({
      url: loadIntegrationDatabaseUrl()
    });

    const adapter = new PostgresIdentityAuthorizationReadAdapter(connection);

    try {
      await connection.db.insert(databaseSchema.identities).values(
        identityIds.map((id) => ({
          id,
          status: 'ACTIVE'
        }))
      );

      await connection.db.insert(databaseSchema.organizations).values(
        organizationIds.map((id) => ({
          id,
          type: 'TRAVEL' as const,
          status: 'ACTIVE' as const
        }))
      );

      await connection.db.insert(databaseSchema.memberships).values(fixtures);

      for (const fixture of fixtures) {
        const membership = await adapter.findMembership(
          asOpaqueId<'IdentityId'>(fixture.identityId),
          asOpaqueId<'OrganizationId'>(fixture.organizationId)
        );

        expect(membership).toEqual({
          id: fixture.id,
          identityId: fixture.identityId,
          organizationId: fixture.organizationId,
          status: fixture.status
        });

        expect(Object.isFrozen(membership)).toBe(true);
      }
    } finally {
      try {
        await connection.db
          .delete(databaseSchema.memberships)
          .where(inArray(databaseSchema.memberships.id, membershipIds));

        await connection.db
          .delete(databaseSchema.organizations)
          .where(inArray(databaseSchema.organizations.id, organizationIds));

        await connection.db
          .delete(databaseSchema.identities)
          .where(inArray(databaseSchema.identities.id, identityIds));

        const remainingMemberships = await connection.db
          .select({
            id: databaseSchema.memberships.id
          })
          .from(databaseSchema.memberships)
          .where(inArray(databaseSchema.memberships.id, membershipIds));

        expect(remainingMemberships).toEqual([]);
      } finally {
        await connection.close();
      }
    }
  });
});
