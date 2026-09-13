import { randomUUID } from 'node:crypto';

import { asCanonicalPrincipalId } from '@segaloka/auth';
import {
  createDatabaseConnection,
  databaseSchema,
  type DatabaseConnection
} from '@segaloka/database';
import { eq, inArray } from 'drizzle-orm';
import { afterEach, describe, expect, it } from 'vitest';

import { PostgresPrincipalBindingResolutionAdapter } from '../src/index.js';

const integrationEnabled = process.env.SEGALOKA_DATABASE_INTEGRATION === '1';

const describeIntegration = integrationEnabled ? describe : describe.skip;

function loadIntegrationDatabaseUrl(): string {
  const databaseUrl = process.env.DATABASE_URL;

  if (databaseUrl === undefined || databaseUrl.trim().length === 0) {
    throw new Error('DATABASE_URL is required for auth persistence integration tests.');
  }

  return databaseUrl;
}

interface Fixture {
  readonly principalId: string;
  readonly bindingId: string;
}

describeIntegration('PostgresPrincipalBindingResolutionAdapter integration', () => {
  let connection: DatabaseConnection | undefined;
  const createdPrincipalIds: string[] = [];
  const createdBindingIds: string[] = [];

  function getConnection(): DatabaseConnection {
    connection ??= createDatabaseConnection({
      url: loadIntegrationDatabaseUrl()
    });

    return connection;
  }

  async function createFixture(options?: {
    readonly principalStatus?: 'ACTIVE' | 'SUSPENDED' | 'REVOKED';
    readonly bindingStatus?: 'ACTIVE' | 'REVOKED';
    readonly issuer?: string;
    readonly subject?: string;
  }): Promise<Fixture> {
    const database = getConnection();

    const principalId = randomUUID();
    const bindingId = randomUUID();

    createdPrincipalIds.push(principalId);
    createdBindingIds.push(bindingId);

    await database.db.insert(databaseSchema.principals).values({
      id: principalId,
      identityId: null,
      status: options?.principalStatus ?? 'ACTIVE'
    });

    await database.db.insert(databaseSchema.principalBindings).values({
      id: bindingId,
      principalId,
      issuer: options?.issuer ?? `https://issuer.example.test/${randomUUID()}`,
      subject: options?.subject ?? `subject-${randomUUID()}`,
      status: options?.bindingStatus ?? 'ACTIVE'
    });

    return {
      principalId,
      bindingId
    };
  }

  afterEach(async () => {
    if (connection === undefined) {
      return;
    }

    try {
      if (createdBindingIds.length > 0) {
        await connection.db
          .delete(databaseSchema.principalBindings)
          .where(inArray(databaseSchema.principalBindings.id, createdBindingIds));
      }

      if (createdPrincipalIds.length > 0) {
        await connection.db
          .delete(databaseSchema.principals)
          .where(inArray(databaseSchema.principals.id, createdPrincipalIds));
      }

      if (createdBindingIds.length > 0) {
        const residualBindings = await connection.db
          .select({
            id: databaseSchema.principalBindings.id
          })
          .from(databaseSchema.principalBindings)
          .where(inArray(databaseSchema.principalBindings.id, createdBindingIds));

        expect(residualBindings).toHaveLength(0);
      }

      if (createdPrincipalIds.length > 0) {
        const residualPrincipals = await connection.db
          .select({
            id: databaseSchema.principals.id
          })
          .from(databaseSchema.principals)
          .where(inArray(databaseSchema.principals.id, createdPrincipalIds));

        expect(residualPrincipals).toHaveLength(0);
      }
    } finally {
      createdBindingIds.length = 0;
      createdPrincipalIds.length = 0;

      await connection.close();
      connection = undefined;
    }
  });

  it('resolves an ACTIVE binding attached to an ACTIVE unmapped principal', async () => {
    const database = getConnection();
    const adapter = new PostgresPrincipalBindingResolutionAdapter(database);

    const issuer = `https://issuer.example.test/${randomUUID()}`;
    const subject = `subject-${randomUUID()}`;

    const fixture = await createFixture({
      issuer,
      subject
    });

    const resolved = await adapter.resolvePrincipalId({
      issuer,
      subject
    });

    expect(resolved).toBe(asCanonicalPrincipalId(fixture.principalId));

    const rows = await database.db
      .select({
        identityId: databaseSchema.principals.identityId
      })
      .from(databaseSchema.principals)
      .where(eq(databaseSchema.principals.id, fixture.principalId))
      .limit(1);

    expect(rows[0]?.identityId).toBeNull();
  });

  it('returns undefined for an unknown external identity', async () => {
    const database = getConnection();
    const adapter = new PostgresPrincipalBindingResolutionAdapter(database);

    const resolved = await adapter.resolvePrincipalId({
      issuer: `https://unknown.example.test/${randomUUID()}`,
      subject: `unknown-${randomUUID()}`
    });

    expect(resolved).toBeUndefined();
  });

  it('returns undefined when the matching binding is REVOKED', async () => {
    const database = getConnection();
    const adapter = new PostgresPrincipalBindingResolutionAdapter(database);

    const issuer = `https://issuer.example.test/${randomUUID()}`;
    const subject = `subject-${randomUUID()}`;

    await createFixture({
      issuer,
      subject,
      bindingStatus: 'REVOKED'
    });

    const resolved = await adapter.resolvePrincipalId({
      issuer,
      subject
    });

    expect(resolved).toBeUndefined();
  });

  it.each(['SUSPENDED', 'REVOKED'] as const)(
    'returns undefined when the matching principal is %s',
    async (principalStatus) => {
      const database = getConnection();
      const adapter = new PostgresPrincipalBindingResolutionAdapter(database);

      const issuer = `https://issuer.example.test/${randomUUID()}`;
      const subject = `subject-${randomUUID()}`;

      await createFixture({
        issuer,
        subject,
        principalStatus
      });

      const resolved = await adapter.resolvePrincipalId({
        issuer,
        subject
      });

      expect(resolved).toBeUndefined();
    }
  );

  it('matches issuer and subject case-sensitively', async () => {
    const database = getConnection();
    const adapter = new PostgresPrincipalBindingResolutionAdapter(database);

    const suffix = randomUUID();
    const issuer = `https://issuer.example.test/Tenant-${suffix}`;
    const subject = `Subject-${suffix}`;

    await createFixture({
      issuer,
      subject
    });

    await expect(
      adapter.resolvePrincipalId({
        issuer: issuer.toLowerCase(),
        subject
      })
    ).resolves.toBeUndefined();

    await expect(
      adapter.resolvePrincipalId({
        issuer,
        subject: subject.toLowerCase()
      })
    ).resolves.toBeUndefined();
  });

  it('does not trim issuer or subject at the persistence boundary', async () => {
    const database = getConnection();
    const adapter = new PostgresPrincipalBindingResolutionAdapter(database);

    const issuer = `https://issuer.example.test/${randomUUID()}`;
    const subject = `subject-${randomUUID()}`;

    await createFixture({
      issuer,
      subject
    });

    await expect(
      adapter.resolvePrincipalId({
        issuer: ` ${issuer}`,
        subject
      })
    ).resolves.toBeUndefined();

    await expect(
      adapter.resolvePrincipalId({
        issuer,
        subject: `${subject} `
      })
    ).resolves.toBeUndefined();
  });
});
