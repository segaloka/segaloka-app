import { randomUUID } from 'node:crypto';

import { describe, expect, it } from 'vitest';

import { createDatabaseConnection, databaseSchema } from '@segaloka/database';
import { asOpaqueId } from '@segaloka/shared-kernel';
import { inArray } from 'drizzle-orm';

import {
  IdentityAuthorizationPersistenceError,
  PostgresIdentityAuthorizationReadAdapter
} from '../src/index.js';

const integrationEnabled = process.env.SEGALOKA_DATABASE_INTEGRATION === '1';

const describeIntegration = integrationEnabled ? describe : describe.skip;

function loadIntegrationDatabaseUrl(): string {
  const databaseUrl = process.env.DATABASE_URL;

  if (databaseUrl === undefined || databaseUrl.trim().length === 0) {
    throw new Error('DATABASE_URL is required for identity persistence integration tests.');
  }

  return databaseUrl;
}

describeIntegration('PostgresIdentityAuthorizationReadAdapter role integration', () => {
  it('returns an empty list for empty or unknown role ids', async () => {
    const connection = createDatabaseConnection({
      url: loadIntegrationDatabaseUrl()
    });

    const adapter = new PostgresIdentityAuthorizationReadAdapter(connection);

    try {
      await expect(adapter.findRolesByIds([])).resolves.toEqual([]);

      await expect(adapter.findRolesByIds([asOpaqueId<'RoleId'>(randomUUID())])).resolves.toEqual(
        []
      );
    } finally {
      await connection.close();
    }
  });

  it('batches roles and permissions, deduplicates requested ids, omits missing ids, preserves kinds and statuses, orders deterministically, and returns an immutable domain graph', async () => {
    const organizationAId = randomUUID();
    const organizationBId = randomUUID();

    const roleSystemActiveId = '10000000-0000-4000-8000-000000000010';
    const roleCustomArchivedId = '10000000-0000-4000-8000-000000000020';
    const roleWithoutPermissionsId = '10000000-0000-4000-8000-000000000030';
    const isolatedRoleId = '10000000-0000-4000-8000-000000000040';

    const missingRoleId = '10000000-0000-4000-8000-000000000099';

    const persistedRoleIds = [
      roleSystemActiveId,
      roleCustomArchivedId,
      roleWithoutPermissionsId,
      isolatedRoleId
    ];

    const connection = createDatabaseConnection({
      url: loadIntegrationDatabaseUrl()
    });

    const adapter = new PostgresIdentityAuthorizationReadAdapter(connection);

    try {
      await connection.db.insert(databaseSchema.organizations).values([
        {
          id: organizationAId,
          type: 'TRAVEL',
          status: 'ACTIVE'
        },
        {
          id: organizationBId,
          type: 'VENDOR',
          status: 'ACTIVE'
        }
      ]);

      await connection.db.insert(databaseSchema.roles).values([
        {
          id: roleSystemActiveId,
          organizationId: organizationAId,
          name: 'System Active Role',
          kind: 'SYSTEM',
          status: 'ACTIVE'
        },
        {
          id: roleCustomArchivedId,
          organizationId: organizationAId,
          name: 'Custom Archived Role',
          kind: 'CUSTOM',
          status: 'ARCHIVED'
        },
        {
          id: roleWithoutPermissionsId,
          organizationId: organizationAId,
          name: 'Role Without Permissions',
          kind: 'CUSTOM',
          status: 'ACTIVE'
        },
        {
          id: isolatedRoleId,
          organizationId: organizationBId,
          name: 'Isolated Vendor Role',
          kind: 'CUSTOM',
          status: 'ACTIVE'
        }
      ]);

      await connection.db.insert(databaseSchema.rolePermissions).values([
        {
          roleId: roleSystemActiveId,
          organizationId: organizationAId,
          permissionKey: 'booking.write',
          scope: 'TENANT'
        },
        {
          roleId: roleSystemActiveId,
          organizationId: organizationAId,
          permissionKey: 'booking.read',
          scope: 'BRANCH'
        },
        {
          roleId: roleSystemActiveId,
          organizationId: organizationAId,
          permissionKey: 'audit.read',
          scope: 'GLOBAL'
        },
        {
          roleId: roleCustomArchivedId,
          organizationId: organizationAId,
          permissionKey: 'package.read',
          scope: 'OWN'
        },
        {
          roleId: isolatedRoleId,
          organizationId: organizationBId,
          permissionKey: 'vendor.read',
          scope: 'TENANT'
        }
      ]);

      const requestedRoleIds = [
        roleCustomArchivedId,
        roleSystemActiveId,
        missingRoleId,
        roleWithoutPermissionsId,
        roleSystemActiveId,
        roleCustomArchivedId
      ].map((id) => asOpaqueId<'RoleId'>(id));

      const result = await adapter.findRolesByIds(requestedRoleIds);

      expect(result).toEqual([
        {
          id: roleSystemActiveId,
          organizationId: organizationAId,
          name: 'System Active Role',
          kind: 'SYSTEM',
          status: 'ACTIVE',
          permissions: [
            {
              permissionKey: 'audit.read',
              scope: 'GLOBAL'
            },
            {
              permissionKey: 'booking.read',
              scope: 'BRANCH'
            },
            {
              permissionKey: 'booking.write',
              scope: 'TENANT'
            }
          ]
        },
        {
          id: roleCustomArchivedId,
          organizationId: organizationAId,
          name: 'Custom Archived Role',
          kind: 'CUSTOM',
          status: 'ARCHIVED',
          permissions: [
            {
              permissionKey: 'package.read',
              scope: 'OWN'
            }
          ]
        },
        {
          id: roleWithoutPermissionsId,
          organizationId: organizationAId,
          name: 'Role Without Permissions',
          kind: 'CUSTOM',
          status: 'ACTIVE',
          permissions: []
        }
      ]);

      expect(result).toHaveLength(3);

      expect(result.map((role) => role.id)).toEqual([
        roleSystemActiveId,
        roleCustomArchivedId,
        roleWithoutPermissionsId
      ]);

      expect(new Set(result.map((role) => role.id)).size).toBe(result.length);

      expect(result.some((role) => role.id === missingRoleId)).toBe(false);
      expect(result.some((role) => role.id === isolatedRoleId)).toBe(false);

      expect(result.map((role) => role.kind)).toEqual(['SYSTEM', 'CUSTOM', 'CUSTOM']);

      expect(result.map((role) => role.status)).toEqual(['ACTIVE', 'ARCHIVED', 'ACTIVE']);

      const systemRole = result[0];
      const archivedRole = result[1];
      const roleWithoutPermissions = result[2];

      expect(systemRole).toBeDefined();
      expect(archivedRole).toBeDefined();
      expect(roleWithoutPermissions).toBeDefined();

      expect(systemRole?.permissions.map((permission) => permission.permissionKey)).toEqual([
        'audit.read',
        'booking.read',
        'booking.write'
      ]);

      expect(archivedRole?.permissions).toEqual([
        {
          permissionKey: 'package.read',
          scope: 'OWN'
        }
      ]);

      expect(roleWithoutPermissions?.permissions).toEqual([]);

      for (const role of result) {
        expect(Object.isFrozen(role)).toBe(true);
        expect(Object.isFrozen(role.permissions)).toBe(true);

        for (const permission of role.permissions) {
          expect(Object.isFrozen(permission)).toBe(true);
        }
      }

      expect(Object.isFrozen(roleWithoutPermissions?.permissions)).toBe(true);
    } finally {
      try {
        await connection.db
          .delete(databaseSchema.rolePermissions)
          .where(inArray(databaseSchema.rolePermissions.roleId, persistedRoleIds));

        await connection.db
          .delete(databaseSchema.roles)
          .where(inArray(databaseSchema.roles.id, persistedRoleIds));

        await connection.db
          .delete(databaseSchema.organizations)
          .where(inArray(databaseSchema.organizations.id, [organizationAId, organizationBId]));

        const remainingRoles = await connection.db
          .select({
            id: databaseSchema.roles.id
          })
          .from(databaseSchema.roles)
          .where(inArray(databaseSchema.roles.id, persistedRoleIds));

        expect(remainingRoles).toEqual([]);
      } finally {
        await connection.close();
      }
    }
  });

  it('rejects cross-organization role permissions through the composite foreign key', async () => {
    const organizationAId = randomUUID();
    const organizationBId = randomUUID();
    const roleId = randomUUID();

    const connection = createDatabaseConnection({
      url: loadIntegrationDatabaseUrl()
    });

    try {
      await connection.db.insert(databaseSchema.organizations).values([
        {
          id: organizationAId,
          type: 'TRAVEL',
          status: 'ACTIVE'
        },
        {
          id: organizationBId,
          type: 'VENDOR',
          status: 'ACTIVE'
        }
      ]);

      await connection.db.insert(databaseSchema.roles).values({
        id: roleId,
        organizationId: organizationBId,
        name: 'Composite FK Role',
        kind: 'CUSTOM',
        status: 'ACTIVE'
      });

      await expect(
        connection.db.insert(databaseSchema.rolePermissions).values({
          roleId,
          organizationId: organizationAId,
          permissionKey: 'booking.read',
          scope: 'TENANT'
        })
      ).rejects.toThrow();

      const persistedCrossOrganizationPermission = await connection.db
        .select({
          roleId: databaseSchema.rolePermissions.roleId
        })
        .from(databaseSchema.rolePermissions)
        .where(inArray(databaseSchema.rolePermissions.roleId, [roleId]));

      expect(persistedCrossOrganizationPermission).toEqual([]);
    } finally {
      try {
        await connection.db
          .delete(databaseSchema.rolePermissions)
          .where(inArray(databaseSchema.rolePermissions.roleId, [roleId]));

        await connection.db
          .delete(databaseSchema.roles)
          .where(inArray(databaseSchema.roles.id, [roleId]));

        await connection.db
          .delete(databaseSchema.organizations)
          .where(inArray(databaseSchema.organizations.id, [organizationAId, organizationBId]));
      } finally {
        await connection.close();
      }
    }
  });

  it('rejects duplicate permission keys for one role regardless of scope', async () => {
    const organizationId = randomUUID();
    const roleId = randomUUID();

    const connection = createDatabaseConnection({
      url: loadIntegrationDatabaseUrl()
    });

    try {
      await connection.db.insert(databaseSchema.organizations).values({
        id: organizationId,
        type: 'TRAVEL',
        status: 'ACTIVE'
      });

      await connection.db.insert(databaseSchema.roles).values({
        id: roleId,
        organizationId,
        name: 'Permission Uniqueness Role',
        kind: 'CUSTOM',
        status: 'ACTIVE'
      });

      await connection.db.insert(databaseSchema.rolePermissions).values({
        roleId,
        organizationId,
        permissionKey: 'booking.read',
        scope: 'TENANT'
      });

      await expect(
        connection.db.insert(databaseSchema.rolePermissions).values({
          roleId,
          organizationId,
          permissionKey: 'booking.read',
          scope: 'BRANCH'
        })
      ).rejects.toThrow();

      const persistedPermissions = await connection.db
        .select({
          permissionKey: databaseSchema.rolePermissions.permissionKey,
          scope: databaseSchema.rolePermissions.scope
        })
        .from(databaseSchema.rolePermissions)
        .where(inArray(databaseSchema.rolePermissions.roleId, [roleId]));

      expect(persistedPermissions).toEqual([
        {
          permissionKey: 'booking.read',
          scope: 'TENANT'
        }
      ]);
    } finally {
      try {
        await connection.db
          .delete(databaseSchema.rolePermissions)
          .where(inArray(databaseSchema.rolePermissions.roleId, [roleId]));

        await connection.db
          .delete(databaseSchema.roles)
          .where(inArray(databaseSchema.roles.id, [roleId]));

        await connection.db
          .delete(databaseSchema.organizations)
          .where(inArray(databaseSchema.organizations.id, [organizationId]));
      } finally {
        await connection.close();
      }
    }
  });

  it('rejects a malformed persisted permission key through the persistence mapping boundary', async () => {
    const organizationId = randomUUID();
    const roleId = randomUUID();

    const connection = createDatabaseConnection({
      url: loadIntegrationDatabaseUrl()
    });

    const adapter = new PostgresIdentityAuthorizationReadAdapter(connection);

    try {
      await connection.db.insert(databaseSchema.organizations).values({
        id: organizationId,
        type: 'TRAVEL',
        status: 'ACTIVE'
      });

      await connection.db.insert(databaseSchema.roles).values({
        id: roleId,
        organizationId,
        name: 'Malformed Permission Role',
        kind: 'CUSTOM',
        status: 'ACTIVE'
      });

      await connection.db.insert(databaseSchema.rolePermissions).values({
        roleId,
        organizationId,
        permissionKey: 'Booking Read',
        scope: 'TENANT'
      });

      try {
        await adapter.findRolesByIds([asOpaqueId<'RoleId'>(roleId)]);
        throw new Error('Expected malformed persisted permission key to be rejected.');
      } catch (error) {
        expect(error).toBeInstanceOf(IdentityAuthorizationPersistenceError);

        if (!(error instanceof IdentityAuthorizationPersistenceError)) {
          throw error;
        }

        expect(error.code).toBe('INVALID_PERMISSION_KEY');
        expect(error.message).toBe('Persisted permission key is invalid: Booking Read');
      }
    } finally {
      try {
        await connection.db
          .delete(databaseSchema.rolePermissions)
          .where(inArray(databaseSchema.rolePermissions.roleId, [roleId]));

        await connection.db
          .delete(databaseSchema.roles)
          .where(inArray(databaseSchema.roles.id, [roleId]));

        await connection.db
          .delete(databaseSchema.organizations)
          .where(inArray(databaseSchema.organizations.id, [organizationId]));
      } finally {
        await connection.close();
      }
    }
  });
});
