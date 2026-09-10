import type { DatabaseConfig } from '@segaloka/config';
import { drizzle, type PostgresJsDatabase } from 'drizzle-orm/postgres-js';
import postgres, { type Sql } from 'postgres';

export interface DatabaseConnection {
  readonly client: Sql;
  readonly db: PostgresJsDatabase;
  readonly close: () => Promise<void>;
}

export function createDatabaseConnection(config: DatabaseConfig): DatabaseConnection {
  const client = postgres(config.url);
  const db = drizzle(client);

  let closePromise: Promise<void> | undefined;

  const close = (): Promise<void> => {
    closePromise ??= client.end();

    return closePromise;
  };

  return Object.freeze({
    client,
    db,
    close
  });
}
