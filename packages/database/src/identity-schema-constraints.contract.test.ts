import { readFileSync } from 'node:fs';

import { describe, expect, it } from 'vitest';

const schemaSource = readFileSync(new URL('./schema.ts', import.meta.url), 'utf8');

function expectSource(pattern: RegExp, description: string): void {
  expect(schemaSource, `Expected schema source to define ${description}.`).toMatch(pattern);
}

function expectSourceNot(pattern: RegExp, description: string): void {
  expect(schemaSource, `Expected schema source not to define ${description}.`).not.toMatch(pattern);
}

function expectUniqueColumns(constraintName: string, expectedColumns: readonly string[]): void {
  const escapedConstraintName = constraintName.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

  const pattern = new RegExp(
    `unique\\(\\s*['"]${escapedConstraintName}['"]\\s*\\)\\.on\\(\\s*${expectedColumns
      .map((column) => `table\\.${column}`)
      .join('\\s*,\\s*')}\\s*\\)`,
    'm'
  );

  expect(
    schemaSource,
    `Expected unique constraint "${constraintName}" to contain exactly columns: ${expectedColumns.join(
      ', '
    )}.`
  ).toMatch(pattern);
}

describe('identity persistence constraint contract', () => {
  it('uses the dedicated identity PostgreSQL schema', () => {
    expectSource(
      /pgSchema\(\s*['"]identity['"]\s*\)/,
      'the dedicated "identity" PostgreSQL schema'
    );
  });

  it('uses UUID physical identifiers without database-generated UUID defaults', () => {
    expectSource(/uuid\(\s*['"]id['"]\s*\)/, 'UUID primary identifiers');

    expectSourceNot(
      /defaultRandom\s*\(|gen_random_uuid|uuid_generate_v4/i,
      'database-generated UUID defaults'
    );
  });

  it('enforces the canonical identity lifecycle states', () => {
    expectSource(
      /ACTIVE[\s\S]*SUSPENDED[\s\S]*DISABLED/,
      'identity ACTIVE, SUSPENDED, and DISABLED states'
    );
  });

  it('enforces the canonical organization types and lifecycle states', () => {
    expectSource(
      /PLATFORM[\s\S]*TRAVEL[\s\S]*VENDOR/,
      'organization PLATFORM, TRAVEL, and VENDOR types'
    );

    expectSource(
      /ACTIVE[\s\S]*SUSPENDED[\s\S]*TERMINATED/,
      'organization ACTIVE, SUSPENDED, and TERMINATED states'
    );
  });

  it('enforces membership lifecycle states', () => {
    expectSource(
      /ACTIVE[\s\S]*SUSPENDED[\s\S]*REVOKED/,
      'membership ACTIVE, SUSPENDED, and REVOKED states'
    );
  });

  it('enforces branch lifecycle states', () => {
    expectSource(
      /ACTIVE[\s\S]*SUSPENDED[\s\S]*CLOSED/,
      'branch ACTIVE, SUSPENDED, and CLOSED states'
    );
  });

  it('enforces role kind and lifecycle states', () => {
    expectSource(/SYSTEM[\s\S]*CUSTOM/, 'SYSTEM and CUSTOM role kinds');

    expectSource(/ACTIVE[\s\S]*ARCHIVED/, 'ACTIVE and ARCHIVED role states');
  });

  it('enforces canonical authorization scopes', () => {
    for (const scope of [
      'GLOBAL',
      'TENANT',
      'BRANCH',
      'OWN',
      'ASSIGNED',
      'RELATIONSHIP',
      'PUBLIC'
    ]) {
      expect(schemaSource).toContain(scope);
    }
  });

  it('enforces one membership per identity and organization', () => {
    expectUniqueColumns('memberships_identity_organization_unique', [
      'identityId',
      'organizationId'
    ]);
  });

  it('enforces one branch access relationship per membership and branch', () => {
    expectUniqueColumns('branch_access_membership_branch_unique', ['membershipId', 'branchId']);
  });

  it('enforces one permission key per role regardless of scope', () => {
    expectUniqueColumns('role_permissions_role_permission_unique', ['roleId', 'permissionKey']);

    expectSourceNot(
      /unique\(\s*['"]role_permissions_role_permission_unique['"]\s*\)\.on\(\s*table\.roleId\s*,\s*table\.permissionKey\s*,\s*table\.scope\s*\)/m,
      'scope as part of the role/permission uniqueness key'
    );
  });

  it('enforces one role assignment per membership and role', () => {
    expectUniqueColumns('role_assignments_membership_role_unique', ['membershipId', 'roleId']);
  });

  it('stores organization isolation keys on branch access and role assignments', () => {
    expectSource(/branchAccess[\s\S]*organizationId/, 'organization_id on branch_access');

    expectSource(/roleAssignments[\s\S]*organizationId/, 'organization_id on role_assignments');
  });

  it('defines composite tenant-bound foreign-key relationships', () => {
    expectSource(
      /foreignKey\([\s\S]*membershipId[\s\S]*organizationId[\s\S]*memberships/i,
      'membership plus organization composite foreign keys'
    );

    expectSource(
      /foreignKey\([\s\S]*branchId[\s\S]*organizationId[\s\S]*branches/i,
      'branch plus organization composite foreign key'
    );

    expectSource(
      /foreignKey\([\s\S]*roleId[\s\S]*organizationId[\s\S]*roles/i,
      'role plus organization composite foreign key'
    );
  });

  it('does not use cascading deletion for the authorization graph', () => {
    expectSourceNot(
      /onDelete\s*:\s*['"]cascade['"]|onDelete\(\s*['"]cascade['"]\s*\)/i,
      'ON DELETE CASCADE'
    );
  });

  it('does not persist a Tenant entity or tenant_id column', () => {
    expectSourceNot(
      /\btenants\b|tenantId|tenant_id/,
      'a Tenant persistence entity or tenant_id column'
    );
  });

  it('does not couple the database schema to the identity domain package', () => {
    expectSourceNot(/@segaloka\/domain-identity/, 'a dependency on @segaloka/domain-identity');
  });
});
