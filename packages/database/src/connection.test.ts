import { beforeEach, describe, expect, it, vi } from 'vitest';

const databaseMocks = vi.hoisted(() => {
  const end = vi.fn<() => Promise<void>>(() => Promise.resolve());

  const client = {
    end
  };

  const db = {
    kind: 'mock-drizzle-database'
  };

  const postgres = vi.fn(() => client);
  const drizzle = vi.fn(() => db);

  return {
    client,
    db,
    drizzle,
    end,
    postgres
  };
});

vi.mock('postgres', () => ({
  default: databaseMocks.postgres
}));

vi.mock('drizzle-orm/postgres-js', () => ({
  drizzle: databaseMocks.drizzle
}));

import { createDatabaseConnection } from './connection.js';

describe('database connection factory', () => {
  beforeEach(() => {
    databaseMocks.postgres.mockClear();
    databaseMocks.drizzle.mockClear();
    databaseMocks.end.mockClear();
  });

  it('creates the postgres client from the validated database URL', () => {
    const databaseUrl = 'postgresql://segaloka:secret@localhost:5432/segaloka?sslmode=require';

    createDatabaseConnection({
      url: databaseUrl
    });

    expect(databaseMocks.postgres).toHaveBeenCalledTimes(1);
    expect(databaseMocks.postgres).toHaveBeenCalledWith(databaseUrl);
  });

  it('creates Drizzle from the exact postgres client', () => {
    const connection = createDatabaseConnection({
      url: 'postgresql://segaloka:secret@localhost:5432/segaloka'
    });

    expect(databaseMocks.drizzle).toHaveBeenCalledTimes(1);
    expect(databaseMocks.drizzle).toHaveBeenCalledWith(databaseMocks.client);

    expect(connection.client).toBe(databaseMocks.client);
    expect(connection.db).toBe(databaseMocks.db);
  });

  it('does not close or execute lifecycle side effects during construction', () => {
    createDatabaseConnection({
      url: 'postgresql://segaloka:secret@localhost:5432/segaloka'
    });

    expect(databaseMocks.end).not.toHaveBeenCalled();
  });

  it('closes the postgres client explicitly', async () => {
    const connection = createDatabaseConnection({
      url: 'postgresql://segaloka:secret@localhost:5432/segaloka'
    });

    await connection.close();

    expect(databaseMocks.end).toHaveBeenCalledTimes(1);
  });

  it('makes close idempotent', async () => {
    const connection = createDatabaseConnection({
      url: 'postgresql://segaloka:secret@localhost:5432/segaloka'
    });

    await connection.close();
    await connection.close();
    await connection.close();

    expect(databaseMocks.end).toHaveBeenCalledTimes(1);
  });

  it('freezes the connection lifecycle handle', () => {
    const connection = createDatabaseConnection({
      url: 'postgresql://segaloka:secret@localhost:5432/segaloka'
    });

    expect(Object.isFrozen(connection)).toBe(true);
  });
});
