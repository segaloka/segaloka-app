import { sql } from 'drizzle-orm';
import { describe, expect, it } from 'vitest';

import { createDatabaseConnection } from '../src/connection.js';
import { loadDatabaseToolingConfig } from './database-config.js';

const integrationEnabled = process.env.SEGALOKA_DATABASE_INTEGRATION === '1';

const describeIntegration = integrationEnabled ? describe : describe.skip;

describeIntegration('database connection integration', () => {
  it('connects through the canonical config and database boundaries', async () => {
    const config = loadDatabaseToolingConfig();
    const connection = createDatabaseConnection(config);

    try {
      const clientResult = await connection.client`
        select
          current_database() as database_name,
          current_user as database_user
      `;

      expect(clientResult).toHaveLength(1);
      expect(clientResult[0]?.database_name).toBe('segaloka');
      expect(clientResult[0]?.database_user).toBe('segaloka');

      const drizzleResult = await connection.db.execute(
        sql`
          select
            current_database() as database_name,
            current_user as database_user,
            1 as smoke_value
        `
      );

      expect(drizzleResult).toHaveLength(1);
      expect(drizzleResult[0]?.database_name).toBe('segaloka');
      expect(drizzleResult[0]?.database_user).toBe('segaloka');
      expect(drizzleResult[0]?.smoke_value).toBe(1);
    } finally {
      await connection.close();
    }
  });

  it('does not require or create application schema for connectivity', async () => {
    const config = loadDatabaseToolingConfig();
    const connection = createDatabaseConnection(config);

    try {
      const tables = await connection.client`
        select tablename
        from pg_tables
        where schemaname = 'public'
        order by tablename
      `;

      expect(tables).toHaveLength(0);
    } finally {
      await connection.close();
    }
  });
});
