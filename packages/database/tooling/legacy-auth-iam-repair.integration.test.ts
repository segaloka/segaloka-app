import { randomUUID } from 'node:crypto';
import { readFileSync } from 'node:fs';

import postgres, { type Sql } from 'postgres';
import { afterEach, describe, expect, it } from 'vitest';

import { loadDatabaseToolingConfig } from './database-config.js';

const integrationEnabled = process.env.SEGALOKA_DATABASE_INTEGRATION === '1';
const describeIntegration = integrationEnabled ? describe : describe.skip;

const disposableDatabasePrefix = 'segaloka_iam_repair_';
const disposableDatabasePattern = /^segaloka_iam_repair_[0-9a-f]{32}$/;

const repairMigration = readFileSync(
  new URL('../drizzle/0003_repair_legacy_auth_iam_schema.sql', import.meta.url),
  'utf8'
);

const historicalLegacySchemaSql = `
CREATE SCHEMA "auth";

CREATE TABLE "auth"."principal_bindings" (
  "id" uuid PRIMARY KEY NOT NULL,
  "principal_id" uuid NOT NULL,
  "issuer" text NOT NULL,
  "subject" text NOT NULL,
  "status" text NOT NULL,
  "created_at" timestamp with time zone DEFAULT now() NOT NULL,
  "updated_at" timestamp with time zone DEFAULT now() NOT NULL,
  CONSTRAINT "principal_bindings_issuer_subject_unique" UNIQUE("issuer","subject"),
  CONSTRAINT "principal_bindings_issuer_non_empty_check"
    CHECK (length(btrim("auth"."principal_bindings"."issuer")) > 0),
  CONSTRAINT "principal_bindings_subject_non_empty_check"
    CHECK (length(btrim("auth"."principal_bindings"."subject")) > 0),
  CONSTRAINT "principal_bindings_status_check"
    CHECK ("auth"."principal_bindings"."status" in ('ACTIVE', 'REVOKED'))
);

CREATE TABLE "auth"."principals" (
  "id" uuid PRIMARY KEY NOT NULL,
  "identity_id" uuid,
  "status" text NOT NULL,
  "created_at" timestamp with time zone DEFAULT now() NOT NULL,
  "updated_at" timestamp with time zone DEFAULT now() NOT NULL,
  CONSTRAINT "principals_identity_id_unique" UNIQUE("identity_id"),
  CONSTRAINT "principals_status_check"
    CHECK ("auth"."principals"."status" in ('ACTIVE', 'SUSPENDED', 'REVOKED'))
);

ALTER TABLE "auth"."principal_bindings"
  ADD CONSTRAINT "principal_bindings_principal_id_principals_id_fk"
  FOREIGN KEY ("principal_id")
  REFERENCES "auth"."principals"("id")
  ON DELETE no action
  ON UPDATE no action;

ALTER TABLE "auth"."principals"
  ADD CONSTRAINT "principals_identity_id_identities_id_fk"
  FOREIGN KEY ("identity_id")
  REFERENCES "identity"."identities"("id")
  ON DELETE no action
  ON UPDATE no action;

CREATE INDEX "principal_bindings_principal_id_idx"
  ON "auth"."principal_bindings"
  USING btree ("principal_id");
`;

const canonicalIamSchemaSql = historicalLegacySchemaSql
  .replace('CREATE SCHEMA "auth";', 'CREATE SCHEMA "iam";')
  .replaceAll('"auth"."principal_bindings"', '"iam"."principal_bindings"')
  .replaceAll('"auth"."principals"', '"iam"."principals"');

interface DisposableDatabase {
  readonly name: string;
  readonly sql: Sql;
  connectionClosed: boolean;
}

interface AdministrativeDatabase {
  readonly configUrl: string;
  readonly sql: Sql;
}

const disposableDatabases = new Map<string, DisposableDatabase>();

function quoteIdentifier(identifier: string): string {
  return `"${identifier.replaceAll('"', '""')}"`;
}

function errorMessage(error: unknown): string {
  if (error instanceof Error) {
    return error.message;
  }

  if (typeof error === 'string') {
    return error;
  }

  if (
    typeof error === 'number' ||
    typeof error === 'boolean' ||
    typeof error === 'bigint' ||
    typeof error === 'symbol' ||
    error === null ||
    error === undefined
  ) {
    return String(error);
  }

  try {
    const serialized = JSON.stringify(error);

    if (serialized !== undefined) {
      return serialized;
    }
  } catch {
    // Fall through to a deterministic message.
  }

  return 'Unknown non-serializable error';
}

function assertLocalDatabaseUrl(databaseUrl: string): URL {
  const url = new URL(databaseUrl);
  const hostname = url.hostname.toLowerCase();

  if (!['localhost', '127.0.0.1', '[::1]'].includes(hostname)) {
    throw new Error(
      `IAM repair integration tests require local PostgreSQL; received host "${hostname}".`
    );
  }

  if (url.port !== '5433') {
    throw new Error(
      `IAM repair integration tests require local PostgreSQL port "5433"; received "${url.port || '(default)'}".`
    );
  }

  if (url.pathname !== '/segaloka') {
    throw new Error(
      'IAM repair integration tests require the administrative DATABASE_URL to target "segaloka".'
    );
  }

  return url;
}

function assertDisposableDatabaseName(databaseName: string): void {
  if (
    !databaseName.startsWith(disposableDatabasePrefix) ||
    !disposableDatabasePattern.test(databaseName)
  ) {
    throw new Error(`Unsafe disposable database name "${databaseName}".`);
  }

  if (databaseName === 'segaloka') {
    throw new Error('Refusing to treat the active Segaloka database as disposable.');
  }
}

function databaseUrlFor(baseUrl: string, databaseName: string): string {
  assertDisposableDatabaseName(databaseName);

  const url = assertLocalDatabaseUrl(baseUrl);
  url.pathname = `/${databaseName}`;

  return url.toString();
}

function createDisposableDatabaseName(): string {
  const databaseName = `${disposableDatabasePrefix}${randomUUID().replaceAll('-', '')}`;
  assertDisposableDatabaseName(databaseName);
  return databaseName;
}

async function openAdministrativeDatabase(): Promise<AdministrativeDatabase> {
  const config = loadDatabaseToolingConfig();
  assertLocalDatabaseUrl(config.url);

  const sql = postgres(config.url, { max: 1 });

  try {
    const rows = await sql<readonly { database_name: string; database_user: string }[]>`
      select
        current_database() as database_name,
        current_user as database_user
    `;

    if (
      rows.length !== 1 ||
      rows[0]?.database_name !== 'segaloka' ||
      rows[0]?.database_user !== 'segaloka'
    ) {
      throw new Error(
        'Administrative database identity mismatch; expected database/user "segaloka".'
      );
    }

    return {
      configUrl: config.url,
      sql
    };
  } catch (error) {
    await sql.end();
    throw error;
  }
}

async function dropDatabaseByName(
  admin: AdministrativeDatabase,
  databaseName: string
): Promise<void> {
  assertLocalDatabaseUrl(admin.configUrl);
  assertDisposableDatabaseName(databaseName);

  const currentRows = await admin.sql<
    readonly { database_name: string; database_user: string }[]
  >`
    select
      current_database() as database_name,
      current_user as database_user
  `;

  if (
    currentRows.length !== 1 ||
    currentRows[0]?.database_name !== 'segaloka' ||
    currentRows[0]?.database_user !== 'segaloka'
  ) {
    throw new Error(
      'Refusing database drop because administrative database identity changed.'
    );
  }

  await admin.sql.unsafe(`DROP DATABASE IF EXISTS ${quoteIdentifier(databaseName)}`);
}

async function createDisposableDatabase(): Promise<DisposableDatabase> {
  const admin = await openAdministrativeDatabase();
  const name = createDisposableDatabaseName();

  try {
    assertDisposableDatabaseName(name);

    const existing = await admin.sql<readonly { exists: boolean }[]>`
      select exists (
        select 1
        from pg_database
        where datname = ${name}
      ) as exists
    `;

    if (existing.length !== 1 || existing[0]?.exists !== false) {
      throw new Error(
        `Refusing to create disposable database "${name}" because it already exists or its state is ambiguous.`
      );
    }

    await admin.sql.unsafe(`CREATE DATABASE ${quoteIdentifier(name)}`);

    let disposable: DisposableDatabase | undefined;

    try {
      disposable = {
        name,
        sql: postgres(databaseUrlFor(admin.configUrl, name), { max: 1 }),
        connectionClosed: false
      };

      const identity = await disposable.sql<readonly { database_name: string }[]>`
        select current_database() as database_name
      `;

      if (identity.length !== 1 || identity[0]?.database_name !== name) {
        throw new Error(
          `Disposable database identity mismatch for "${name}".`
        );
      }

      disposableDatabases.set(name, disposable);

      return disposable;
    } catch (error) {
      let cleanupError: unknown;

      try {
        if (disposable !== undefined) {
          await closeDisposableConnection(disposable);
        }

        await dropDatabaseByName(admin, name);
      } catch (caught) {
        cleanupError = caught;
      }

      if (cleanupError !== undefined) {
        const setupMessage = errorMessage(error);
        const cleanupMessage = errorMessage(cleanupError);

        throw new Error(
          `Disposable database setup failed and cleanup also failed. Setup: ${setupMessage} Cleanup: ${cleanupMessage}`
        );
      }

      throw error;
    }
  } finally {
    await admin.sql.end();
  }
}

async function closeDisposableConnection(
  disposable: DisposableDatabase
): Promise<void> {
  assertDisposableDatabaseName(disposable.name);

  if (disposable.connectionClosed) {
    return;
  }

  await disposable.sql.end();
  disposable.connectionClosed = true;
}

async function dropDisposableDatabase(disposable: DisposableDatabase): Promise<void> {
  assertDisposableDatabaseName(disposable.name);

  await closeDisposableConnection(disposable);

  const admin = await openAdministrativeDatabase();

  try {
    await dropDatabaseByName(admin, disposable.name);
    disposableDatabases.delete(disposable.name);
  } finally {
    await admin.sql.end();
  }
}

async function installIdentityPrerequisite(sql: Sql): Promise<void> {
  await sql.unsafe(`
    CREATE SCHEMA "identity";

    CREATE TABLE "identity"."identities" (
      "id" uuid PRIMARY KEY NOT NULL
    );
  `);
}

async function relationOid(
  sql: Sql,
  schemaName: string,
  relationName: string
): Promise<number | null> {
  const rows = await sql<readonly { oid: number | null }[]>`
    select to_regclass(${`${schemaName}.${relationName}`})::oid::integer as oid
  `;

  return rows[0]?.oid ?? null;
}

async function relationExists(
  sql: Sql,
  schemaName: string,
  relationName: string
): Promise<boolean> {
  return (await relationOid(sql, schemaName, relationName)) !== null;
}

async function schemaExists(sql: Sql, schemaName: string): Promise<boolean> {
  const rows = await sql<readonly { exists: boolean }[]>`
    select exists (
      select 1
      from pg_namespace
      where nspname = ${schemaName}
    ) as exists
  `;

  return rows[0]?.exists ?? false;
}

async function expectMigrationRejected(sql: Sql): Promise<void> {
  let error: unknown;

  try {
    await sql.unsafe(repairMigration);
  } catch (caught) {
    error = caught;
  }

  expect(error).toBeDefined();
  expect(error).toEqual(
    expect.objectContaining({
      code: '55000'
    })
  );
}

afterEach(async () => {
  const leftovers = [...disposableDatabases.values()];

  for (const disposable of leftovers) {
    await dropDisposableDatabase(disposable);
  }
});

describeIntegration('legacy auth IAM repair migration integration', () => {
  it('is a canonical IAM no-op and preserves relation OIDs', async () => {
    const disposable = await createDisposableDatabase();

    try {
      await installIdentityPrerequisite(disposable.sql);
      await disposable.sql.unsafe(canonicalIamSchemaSql);

      const principalOidBefore = await relationOid(
        disposable.sql,
        'iam',
        'principals'
      );
      const bindingOidBefore = await relationOid(
        disposable.sql,
        'iam',
        'principal_bindings'
      );

      expect(principalOidBefore).not.toBeNull();
      expect(bindingOidBefore).not.toBeNull();

      await disposable.sql.unsafe(repairMigration);

      expect(await relationOid(disposable.sql, 'iam', 'principals')).toBe(
        principalOidBefore
      );
      expect(
        await relationOid(disposable.sql, 'iam', 'principal_bindings')
      ).toBe(bindingOidBefore);

      expect(await relationExists(disposable.sql, 'auth', 'principals')).toBe(
        false
      );
      expect(
        await relationExists(disposable.sql, 'auth', 'principal_bindings')
      ).toBe(false);
    } finally {
      await dropDisposableDatabase(disposable);
    }
  });

  it('repairs the exact historical legacy IAM pair without recreating tables', async () => {
    const disposable = await createDisposableDatabase();

    try {
      await installIdentityPrerequisite(disposable.sql);
      await disposable.sql.unsafe(historicalLegacySchemaSql);

      const principalOidBefore = await relationOid(
        disposable.sql,
        'auth',
        'principals'
      );
      const bindingOidBefore = await relationOid(
        disposable.sql,
        'auth',
        'principal_bindings'
      );

      expect(principalOidBefore).not.toBeNull();
      expect(bindingOidBefore).not.toBeNull();

      await disposable.sql.unsafe(repairMigration);

      expect(await relationOid(disposable.sql, 'iam', 'principals')).toBe(
        principalOidBefore
      );
      expect(
        await relationOid(disposable.sql, 'iam', 'principal_bindings')
      ).toBe(bindingOidBefore);

      expect(await relationExists(disposable.sql, 'auth', 'principals')).toBe(
        false
      );
      expect(
        await relationExists(disposable.sql, 'auth', 'principal_bindings')
      ).toBe(false);

      expect(await schemaExists(disposable.sql, 'auth')).toBe(true);
      expect(await schemaExists(disposable.sql, 'iam')).toBe(true);
    } finally {
      await dropDisposableDatabase(disposable);
    }
  });

  it('fails closed when canonical and legacy IAM relations collide', async () => {
    const disposable = await createDisposableDatabase();

    try {
      await installIdentityPrerequisite(disposable.sql);
      await disposable.sql.unsafe(canonicalIamSchemaSql);

      await disposable.sql.unsafe(`
        CREATE SCHEMA "auth";

        CREATE TABLE "auth"."principals" (
          "id" uuid PRIMARY KEY NOT NULL
        );

        CREATE TABLE "auth"."principal_bindings" (
          "id" uuid PRIMARY KEY NOT NULL
        );
      `);

      const iamPrincipalOidBefore = await relationOid(
        disposable.sql,
        'iam',
        'principals'
      );
      const iamBindingOidBefore = await relationOid(
        disposable.sql,
        'iam',
        'principal_bindings'
      );
      const authPrincipalOidBefore = await relationOid(
        disposable.sql,
        'auth',
        'principals'
      );
      const authBindingOidBefore = await relationOid(
        disposable.sql,
        'auth',
        'principal_bindings'
      );

      await expectMigrationRejected(disposable.sql);

      expect(await relationOid(disposable.sql, 'iam', 'principals')).toBe(
        iamPrincipalOidBefore
      );
      expect(
        await relationOid(disposable.sql, 'iam', 'principal_bindings')
      ).toBe(iamBindingOidBefore);

      expect(await relationOid(disposable.sql, 'auth', 'principals')).toBe(
        authPrincipalOidBefore
      );
      expect(
        await relationOid(disposable.sql, 'auth', 'principal_bindings')
      ).toBe(authBindingOidBefore);
    } finally {
      await dropDisposableDatabase(disposable);
    }
  });

  it('fails closed on a partial legacy IAM state without moving relations', async () => {
    const disposable = await createDisposableDatabase();

    try {
      await installIdentityPrerequisite(disposable.sql);

      await disposable.sql.unsafe(`
        CREATE SCHEMA "auth";

        CREATE TABLE "auth"."principals" (
          "id" uuid PRIMARY KEY NOT NULL
        );
      `);

      const principalOidBefore = await relationOid(
        disposable.sql,
        'auth',
        'principals'
      );

      await expectMigrationRejected(disposable.sql);

      expect(await relationOid(disposable.sql, 'auth', 'principals')).toBe(
        principalOidBefore
      );
      expect(
        await relationExists(disposable.sql, 'auth', 'principal_bindings')
      ).toBe(false);
      expect(await schemaExists(disposable.sql, 'iam')).toBe(false);
    } finally {
      await dropDisposableDatabase(disposable);
    }
  });
});
