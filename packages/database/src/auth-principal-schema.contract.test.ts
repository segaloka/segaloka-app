import { getTableColumns, getTableName } from 'drizzle-orm';
import { describe, expect, it } from 'vitest';

import * as schemaModule from './schema.js';

type UnknownRecord = Readonly<Record<string, unknown>>;

function getSchemaExport(name: string): unknown {
  return (schemaModule as UnknownRecord)[name];
}

function requireTable(name: string): object {
  const value = getSchemaExport(name);

  expect(value, `Expected schema export "${name}" to exist.`).toBeDefined();
  expect(typeof value, `Expected schema export "${name}" to be a Drizzle table object.`).toBe(
    'object'
  );

  if (value === null || typeof value !== 'object') {
    throw new Error(`Schema export "${name}" is not a table object.`);
  }

  return value;
}

function expectColumns(exportName: string, expectedColumns: readonly string[]): void {
  const table = requireTable(exportName);
  const columns = getTableColumns(table as Parameters<typeof getTableColumns>[0]);

  const actualColumnNames = Object.values(columns)
    .map((column) => column.name)
    .sort();

  expect(actualColumnNames).toEqual([...expectedColumns].sort());
}

describe('authentication principal persistence schema contract', () => {
  it('exports the dedicated auth PostgreSQL schema', () => {
    const authSchema = getSchemaExport('authSchema');

    expect(authSchema).toBeDefined();
    expect(typeof authSchema).toBe('object');
  });

  it('exports the canonical authentication principal tables', () => {
    expect(getSchemaExport('principals')).toBeDefined();
    expect(getSchemaExport('principalBindings')).toBeDefined();
  });

  it('uses the canonical physical authentication table names', () => {
    expect(getTableName(requireTable('principals') as Parameters<typeof getTableName>[0])).toBe(
      'principals'
    );

    expect(
      getTableName(requireTable('principalBindings') as Parameters<typeof getTableName>[0])
    ).toBe('principal_bindings');
  });

  it('defines canonical principal columns', () => {
    expectColumns('principals', ['id', 'identity_id', 'status', 'created_at', 'updated_at']);
  });

  it('defines canonical external principal binding columns', () => {
    expectColumns('principalBindings', [
      'id',
      'principal_id',
      'issuer',
      'subject',
      'status',
      'created_at',
      'updated_at'
    ]);
  });
});
