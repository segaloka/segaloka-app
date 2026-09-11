import { randomUUID } from 'node:crypto';

import { describe, expect, it } from 'vitest';

import { createDatabaseConnection, databaseSchema } from '@segaloka/database';
import {
  ORGANIZATION_STATUSES,
  ORGANIZATION_TYPES,
  type OrganizationStatus,
  type OrganizationType
} from '@segaloka/domain-identity';
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

describeIntegration('PostgresIdentityAuthorizationReadAdapter integration', () => {
  it('reads an existing identity, returns undefined for a missing identity, and cleans up its fixture', async () => {
    const existingId = randomUUID();
    const missingId = randomUUID();

    const connection = createDatabaseConnection({
      url: loadIntegrationDatabaseUrl()
    });

    const adapter = new PostgresIdentityAuthorizationReadAdapter(connection);

    try {
      await connection.db.insert(databaseSchema.identities).values({
        id: existingId,
        status: 'ACTIVE'
      });

      const existingIdentity = await adapter.findIdentityById(asOpaqueId<'IdentityId'>(existingId));

      expect(existingIdentity).toEqual({
        id: existingId,
        status: 'ACTIVE'
      });

      expect(Object.isFrozen(existingIdentity)).toBe(true);

      const missingIdentity = await adapter.findIdentityById(asOpaqueId<'IdentityId'>(missingId));

      expect(missingIdentity).toBeUndefined();
    } finally {
      await connection.db
        .delete(databaseSchema.identities)
        .where(inArray(databaseSchema.identities.id, [existingId, missingId]));

      const remainingRows = await connection.db
        .select({
          id: databaseSchema.identities.id
        })
        .from(databaseSchema.identities)
        .where(inArray(databaseSchema.identities.id, [existingId, missingId]));

      expect(remainingRows).toEqual([]);

      await connection.close();
    }
  });

  it('preserves all supported persisted identity statuses', async () => {
    const activeId = randomUUID();
    const suspendedId = randomUUID();
    const disabledId = randomUUID();

    const fixtureIds = [activeId, suspendedId, disabledId];

    const connection = createDatabaseConnection({
      url: loadIntegrationDatabaseUrl()
    });

    const adapter = new PostgresIdentityAuthorizationReadAdapter(connection);

    try {
      await connection.db.insert(databaseSchema.identities).values([
        {
          id: activeId,
          status: 'ACTIVE'
        },
        {
          id: suspendedId,
          status: 'SUSPENDED'
        },
        {
          id: disabledId,
          status: 'DISABLED'
        }
      ]);

      await expect(adapter.findIdentityById(asOpaqueId<'IdentityId'>(activeId))).resolves.toEqual({
        id: activeId,
        status: 'ACTIVE'
      });

      await expect(
        adapter.findIdentityById(asOpaqueId<'IdentityId'>(suspendedId))
      ).resolves.toEqual({
        id: suspendedId,
        status: 'SUSPENDED'
      });

      await expect(adapter.findIdentityById(asOpaqueId<'IdentityId'>(disabledId))).resolves.toEqual(
        {
          id: disabledId,
          status: 'DISABLED'
        }
      );
    } finally {
      await connection.db
        .delete(databaseSchema.identities)
        .where(inArray(databaseSchema.identities.id, fixtureIds));

      const remainingRows = await connection.db
        .select({
          id: databaseSchema.identities.id
        })
        .from(databaseSchema.identities)
        .where(inArray(databaseSchema.identities.id, fixtureIds));

      expect(remainingRows).toEqual([]);

      await connection.close();
    }
  });

  it('reads an existing workspace, preserves its organization relationship, and returns undefined for a missing workspace', async () => {
    const organizationId = randomUUID();
    const workspaceId = randomUUID();
    const missingWorkspaceId = randomUUID();

    const connection = createDatabaseConnection({
      url: loadIntegrationDatabaseUrl()
    });

    const adapter = new PostgresIdentityAuthorizationReadAdapter(connection);

    try {
      await connection.db.insert(databaseSchema.organizations).values({
        id: organizationId,
        type: 'TRAVEL',
        status: 'ACTIVE'
      });

      await connection.db.insert(databaseSchema.workspaces).values({
        id: workspaceId,
        organizationId
      });

      const workspace = await adapter.findWorkspaceById(asOpaqueId<'WorkspaceId'>(workspaceId));

      expect(workspace).toEqual({
        id: workspaceId,
        organizationId
      });

      expect(Object.isFrozen(workspace)).toBe(true);

      await expect(
        adapter.findWorkspaceById(asOpaqueId<'WorkspaceId'>(missingWorkspaceId))
      ).resolves.toBeUndefined();
    } finally {
      await connection.db
        .delete(databaseSchema.workspaces)
        .where(inArray(databaseSchema.workspaces.id, [workspaceId, missingWorkspaceId]));

      await connection.db
        .delete(databaseSchema.organizations)
        .where(inArray(databaseSchema.organizations.id, [organizationId]));

      const remainingWorkspaces = await connection.db
        .select({
          id: databaseSchema.workspaces.id
        })
        .from(databaseSchema.workspaces)
        .where(inArray(databaseSchema.workspaces.id, [workspaceId, missingWorkspaceId]));

      const remainingOrganizations = await connection.db
        .select({
          id: databaseSchema.organizations.id
        })
        .from(databaseSchema.organizations)
        .where(inArray(databaseSchema.organizations.id, [organizationId]));

      expect(remainingWorkspaces).toEqual([]);
      expect(remainingOrganizations).toEqual([]);

      await connection.close();
    }
  });

  it('maps every supported organization type and status without filtering authorization facts', async () => {
    const fixtures: {
      id: string;
      type: OrganizationType;
      status: OrganizationStatus;
    }[] = [];

    for (const type of ORGANIZATION_TYPES) {
      for (const status of ORGANIZATION_STATUSES) {
        fixtures.push({
          id: randomUUID(),
          type,
          status
        });
      }
    }

    const fixtureIds = fixtures.map((fixture) => fixture.id);

    const missingOrganizationId = randomUUID();

    const connection = createDatabaseConnection({
      url: loadIntegrationDatabaseUrl()
    });

    const adapter = new PostgresIdentityAuthorizationReadAdapter(connection);

    try {
      await connection.db.insert(databaseSchema.organizations).values(fixtures);

      for (const fixture of fixtures) {
        const organization = await adapter.findOrganizationById(
          asOpaqueId<'OrganizationId'>(fixture.id)
        );

        expect(organization).toEqual({
          id: fixture.id,
          type: fixture.type,
          status: fixture.status
        });

        expect(Object.isFrozen(organization)).toBe(true);
      }

      await expect(
        adapter.findOrganizationById(asOpaqueId<'OrganizationId'>(missingOrganizationId))
      ).resolves.toBeUndefined();
    } finally {
      await connection.db
        .delete(databaseSchema.organizations)
        .where(inArray(databaseSchema.organizations.id, [...fixtureIds, missingOrganizationId]));

      const remainingRows = await connection.db
        .select({
          id: databaseSchema.organizations.id
        })
        .from(databaseSchema.organizations)
        .where(inArray(databaseSchema.organizations.id, [...fixtureIds, missingOrganizationId]));

      expect(remainingRows).toEqual([]);

      await connection.close();
    }
  });
});
