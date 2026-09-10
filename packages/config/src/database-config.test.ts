import { describe, expect, it } from 'vitest';

import { DatabaseConfigurationError, parseDatabaseConfig } from './database-config.js';

describe('database configuration', () => {
  it('accepts a postgresql connection URL and returns immutable configuration', () => {
    const config = parseDatabaseConfig({
      DATABASE_URL: 'postgresql://segaloka:secret@localhost:5432/segaloka'
    });

    expect(config).toEqual({
      url: 'postgresql://segaloka:secret@localhost:5432/segaloka'
    });

    expect(Object.isFrozen(config)).toBe(true);
  });

  it('accepts the postgres protocol alias', () => {
    expect(
      parseDatabaseConfig({
        DATABASE_URL: 'postgres://segaloka:secret@localhost:5432/segaloka'
      })
    ).toEqual({
      url: 'postgres://segaloka:secret@localhost:5432/segaloka'
    });
  });

  it.each([undefined, '', '   '])('rejects a missing or blank DATABASE_URL', (databaseUrl) => {
    expect(() =>
      parseDatabaseConfig({
        DATABASE_URL: databaseUrl
      })
    ).toThrowError(
      expect.objectContaining({
        code: 'DATABASE_URL_MISSING'
      })
    );
  });

  it('rejects malformed database URLs', () => {
    expect(() =>
      parseDatabaseConfig({
        DATABASE_URL: 'not-a-database-url'
      })
    ).toThrowError(
      expect.objectContaining({
        code: 'DATABASE_URL_INVALID'
      })
    );
  });

  it('rejects non-PostgreSQL URL protocols', () => {
    expect(() =>
      parseDatabaseConfig({
        DATABASE_URL: 'mysql://segaloka:secret@localhost:3306/segaloka'
      })
    ).toThrowError(
      expect.objectContaining({
        code: 'DATABASE_URL_PROTOCOL_UNSUPPORTED'
      })
    );
  });

  it('throws the typed database configuration error', () => {
    expect(() =>
      parseDatabaseConfig({
        DATABASE_URL: undefined
      })
    ).toThrow(DatabaseConfigurationError);
  });

  it('does not normalize or mutate an accepted connection string', () => {
    const databaseUrl = 'postgresql://segaloka:p%40ssword@localhost:5432/segaloka?sslmode=require';

    expect(
      parseDatabaseConfig({
        DATABASE_URL: databaseUrl
      }).url
    ).toBe(databaseUrl);
  });
});
