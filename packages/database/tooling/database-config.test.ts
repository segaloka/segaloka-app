import { describe, expect, it } from 'vitest';

import { DatabaseConfigurationError } from '@segaloka/config';

import { loadDatabaseToolingConfig } from './database-config.js';

describe('database tooling configuration', () => {
  it('parses an explicitly injected database configuration source', () => {
    const databaseUrl = 'postgresql://segaloka:secret@localhost:5432/segaloka';

    const config = loadDatabaseToolingConfig({
      DATABASE_URL: databaseUrl
    });

    expect(config).toEqual({
      url: databaseUrl
    });
  });

  it('preserves the validated database URL exactly', () => {
    const databaseUrl = 'postgresql://segaloka:secret@localhost:5432/segaloka?sslmode=require';

    const config = loadDatabaseToolingConfig({
      DATABASE_URL: databaseUrl
    });

    expect(config.url).toBe(databaseUrl);
  });

  it('reuses the canonical missing DATABASE_URL validation', () => {
    expect(() => loadDatabaseToolingConfig({})).toThrow(
      expect.objectContaining({
        name: 'DatabaseConfigurationError',
        code: 'DATABASE_URL_MISSING'
      })
    );
  });

  it('reuses the canonical protocol validation', () => {
    expect(() =>
      loadDatabaseToolingConfig({
        DATABASE_URL: 'mysql://localhost:3306/segaloka'
      })
    ).toThrow(
      expect.objectContaining({
        name: 'DatabaseConfigurationError',
        code: 'DATABASE_URL_PROTOCOL_UNSUPPORTED'
      })
    );
  });

  it('throws the canonical configuration error type', () => {
    expect(() => loadDatabaseToolingConfig({})).toThrow(DatabaseConfigurationError);
  });
});
