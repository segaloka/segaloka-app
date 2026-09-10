import { describe, expect, it } from 'vitest';

import {
  DATABASE_CONFIGURATION_ERROR_CODES,
  DatabaseConfigurationError,
  SEGALOKA_CONFIG_PACKAGE,
  parseDatabaseConfig,
  type DatabaseConfig,
  type DatabaseConfigurationErrorCode,
  type DatabaseConfigSource
} from './index.js';

describe('config public API', () => {
  it('exports the database configuration runtime contract', () => {
    const source: DatabaseConfigSource = {
      DATABASE_URL: 'postgresql://segaloka:secret@localhost:5432/segaloka'
    };

    const config: DatabaseConfig = parseDatabaseConfig(source);

    expect(config.url).toBe(source.DATABASE_URL);
    expect(DatabaseConfigurationError).toBeTypeOf('function');
    expect(DATABASE_CONFIGURATION_ERROR_CODES).toEqual([
      'DATABASE_URL_MISSING',
      'DATABASE_URL_INVALID',
      'DATABASE_URL_PROTOCOL_UNSUPPORTED'
    ]);
  });

  it('exports the database configuration error-code type', () => {
    const code: DatabaseConfigurationErrorCode = 'DATABASE_URL_INVALID';

    expect(code).toBe('DATABASE_URL_INVALID');
  });

  it('preserves the existing config package marker', () => {
    expect(SEGALOKA_CONFIG_PACKAGE).toBe('@segaloka/config');
  });
});
