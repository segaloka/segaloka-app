import { randomUUID } from 'node:crypto';

import { asCanonicalPrincipalId } from '@segaloka/auth';
import { createDatabaseConnection, databaseSchema } from '@segaloka/database';
import { inArray } from 'drizzle-orm';
import { describe, expect, it } from 'vitest';

import { PostgresPrincipalIdentityResolutionAdapter } from '../src/index.js';

const integrationEnabled = process.env.SEGALOKA_DATABASE_INTEGRATION === '1';

const describeIntegration = integrationEnabled ? describe : describe.skip;

function loadIntegrationDatabaseUrl(): string {
  const databaseUrl = process.env.DATABASE_URL;

  if (databaseUrl === undefined || databaseUrl.trim().length === 0) {
    throw new Error('DATABASE_URL is required for auth persistence integration tests.');
  }

  return databaseUrl;
}

describeIntegration('PostgresPrincipalIdentityResolutionAdapter integration', () => {
  it('resolves only ACTIVE mapped principals and never derives IdentityId from PrincipalId', async () => {
    const mappedIdentityId = randomUUID();
    const suspendedIdentityId = randomUUID();
    const revokedIdentityId = randomUUID();

    const activeMappedPrincipalId = randomUUID();
    const activeUnmappedPrincipalId = randomUUID();
    const suspendedPrincipalId = randomUUID();
    const revokedPrincipalId = randomUUID();
    const unknownPrincipalId = randomUUID();

    const identityIds = [mappedIdentityId, suspendedIdentityId, revokedIdentityId];

    const principalIds = [
      activeMappedPrincipalId,
      activeUnmappedPrincipalId,
      suspendedPrincipalId,
      revokedPrincipalId
    ];

    expect(activeMappedPrincipalId).not.toBe(mappedIdentityId);

    const connection = createDatabaseConnection({
      url: loadIntegrationDatabaseUrl()
    });

    const adapter = new PostgresPrincipalIdentityResolutionAdapter(connection);

    try {
      await connection.db.insert(databaseSchema.identities).values([
        {
          id: mappedIdentityId,
          status: 'ACTIVE'
        },
        {
          id: suspendedIdentityId,
          status: 'ACTIVE'
        },
        {
          id: revokedIdentityId,
          status: 'ACTIVE'
        }
      ]);

      await connection.db.insert(databaseSchema.principals).values([
        {
          id: activeMappedPrincipalId,
          identityId: mappedIdentityId,
          status: 'ACTIVE'
        },
        {
          id: activeUnmappedPrincipalId,
          identityId: null,
          status: 'ACTIVE'
        },
        {
          id: suspendedPrincipalId,
          identityId: suspendedIdentityId,
          status: 'SUSPENDED'
        },
        {
          id: revokedPrincipalId,
          identityId: revokedIdentityId,
          status: 'REVOKED'
        }
      ]);

      await expect(
        adapter.resolveIdentityId(asCanonicalPrincipalId(activeMappedPrincipalId))
      ).resolves.toBe(mappedIdentityId);

      await expect(
        adapter.resolveIdentityId(asCanonicalPrincipalId(activeUnmappedPrincipalId))
      ).resolves.toBeUndefined();

      await expect(
        adapter.resolveIdentityId(asCanonicalPrincipalId(unknownPrincipalId))
      ).resolves.toBeUndefined();

      await expect(
        adapter.resolveIdentityId(asCanonicalPrincipalId(suspendedPrincipalId))
      ).resolves.toBeUndefined();

      await expect(
        adapter.resolveIdentityId(asCanonicalPrincipalId(revokedPrincipalId))
      ).resolves.toBeUndefined();

      const resolvedIdentityId = await adapter.resolveIdentityId(
        asCanonicalPrincipalId(activeMappedPrincipalId)
      );

      expect(resolvedIdentityId).toBe(mappedIdentityId);
      expect(resolvedIdentityId).not.toBe(activeMappedPrincipalId);
    } finally {
      try {
        await connection.db
          .delete(databaseSchema.principals)
          .where(inArray(databaseSchema.principals.id, principalIds));

        await connection.db
          .delete(databaseSchema.identities)
          .where(inArray(databaseSchema.identities.id, identityIds));

        const remainingPrincipals = await connection.db
          .select({
            id: databaseSchema.principals.id
          })
          .from(databaseSchema.principals)
          .where(inArray(databaseSchema.principals.id, principalIds));

        const remainingIdentities = await connection.db
          .select({
            id: databaseSchema.identities.id
          })
          .from(databaseSchema.identities)
          .where(inArray(databaseSchema.identities.id, identityIds));

        expect(remainingPrincipals).toEqual([]);
        expect(remainingIdentities).toEqual([]);
      } finally {
        await connection.close();
      }
    }
  });
});
