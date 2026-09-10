import { describe, expect, expectTypeOf, it } from 'vitest';

import type { DatabaseConfig } from '@segaloka/config';

import {
  SEGALOKA_DATABASE_PACKAGE,
  createDatabaseConnection,
  type DatabaseConnection
} from './index.js';

describe('database public API', () => {
  it('exports the connection factory', () => {
    expect(createDatabaseConnection).toBeTypeOf('function');
  });

  it('exports the database connection contract', () => {
    expectTypeOf(createDatabaseConnection).returns.toMatchTypeOf<DatabaseConnection>();
  });

  it('accepts the validated database configuration contract', () => {
    expectTypeOf(createDatabaseConnection).parameter(0).toEqualTypeOf<DatabaseConfig>();
  });

  it('preserves the existing database package marker', () => {
    expect(SEGALOKA_DATABASE_PACKAGE).toBe('@segaloka/database');
  });
});
