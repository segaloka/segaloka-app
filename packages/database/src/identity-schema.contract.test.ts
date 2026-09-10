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

describe('identity persistence schema contract', () => {
  it('exports the canonical identity PostgreSQL schema', () => {
    const identitySchema = getSchemaExport('identitySchema');

    expect(identitySchema, 'Expected schema export "identitySchema" to exist.').toBeDefined();

    expect(
      typeof identitySchema,
      'Expected identitySchema to be a Drizzle PostgreSQL schema object.'
    ).toBe('object');
  });

  it('exports exactly the nine canonical identity authorization tables', () => {
    const expectedTableExports = [
      'identities',
      'organizations',
      'workspaces',
      'memberships',
      'branches',
      'branchAccess',
      'roles',
      'rolePermissions',
      'roleAssignments'
    ] as const;

    for (const exportName of expectedTableExports) {
      expect(
        getSchemaExport(exportName),
        `Expected table export "${exportName}" to exist.`
      ).toBeDefined();
    }
  });

  it('uses the canonical physical table names', () => {
    const expectedNames = {
      identities: 'identities',
      organizations: 'organizations',
      workspaces: 'workspaces',
      memberships: 'memberships',
      branches: 'branches',
      branchAccess: 'branch_access',
      roles: 'roles',
      rolePermissions: 'role_permissions',
      roleAssignments: 'role_assignments'
    } as const;

    for (const [exportName, expectedTableName] of Object.entries(expectedNames)) {
      const table = requireTable(exportName);

      expect(getTableName(table as Parameters<typeof getTableName>[0])).toBe(expectedTableName);
    }
  });

  it('defines the canonical identities columns', () => {
    expectColumns('identities', ['id', 'status', 'created_at', 'updated_at']);
  });

  it('defines the canonical organizations columns', () => {
    expectColumns('organizations', ['id', 'type', 'status', 'created_at', 'updated_at']);
  });

  it('defines the canonical workspaces columns', () => {
    expectColumns('workspaces', ['id', 'organization_id', 'created_at', 'updated_at']);
  });

  it('defines the canonical memberships columns', () => {
    expectColumns('memberships', [
      'id',
      'identity_id',
      'organization_id',
      'status',
      'created_at',
      'updated_at'
    ]);
  });

  it('defines the canonical branches columns', () => {
    expectColumns('branches', ['id', 'organization_id', 'status', 'created_at', 'updated_at']);
  });

  it('defines tenant-bound branch access columns', () => {
    expectColumns('branchAccess', [
      'id',
      'organization_id',
      'membership_id',
      'branch_id',
      'status',
      'created_at',
      'updated_at'
    ]);
  });

  it('defines the canonical roles columns', () => {
    expectColumns('roles', [
      'id',
      'organization_id',
      'name',
      'kind',
      'status',
      'created_at',
      'updated_at'
    ]);
  });

  it('defines role permission columns without a synthetic identity', () => {
    expectColumns('rolePermissions', [
      'role_id',
      'organization_id',
      'permission_key',
      'scope',
      'created_at'
    ]);
  });

  it('defines tenant-bound role assignment columns', () => {
    expectColumns('roleAssignments', [
      'id',
      'organization_id',
      'membership_id',
      'role_id',
      'status',
      'created_at',
      'updated_at'
    ]);
  });
});
