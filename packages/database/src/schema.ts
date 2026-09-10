import { sql } from 'drizzle-orm';
import {
  check,
  foreignKey,
  index,
  pgSchema,
  text,
  timestamp,
  unique,
  uuid
} from 'drizzle-orm/pg-core';

export const identitySchema = pgSchema('identity');

export const identities = identitySchema.table(
  'identities',
  {
    id: uuid('id').primaryKey(),
    status: text('status').notNull(),
    createdAt: timestamp('created_at', {
      withTimezone: true
    })
      .notNull()
      .defaultNow(),
    updatedAt: timestamp('updated_at', {
      withTimezone: true
    })
      .notNull()
      .defaultNow()
  },
  (table) => [
    check('identities_status_check', sql`${table.status} in ('ACTIVE', 'SUSPENDED', 'DISABLED')`)
  ]
);

export const organizations = identitySchema.table(
  'organizations',
  {
    id: uuid('id').primaryKey(),
    type: text('type').notNull(),
    status: text('status').notNull(),
    createdAt: timestamp('created_at', {
      withTimezone: true
    })
      .notNull()
      .defaultNow(),
    updatedAt: timestamp('updated_at', {
      withTimezone: true
    })
      .notNull()
      .defaultNow()
  },
  (table) => [
    check('organizations_type_check', sql`${table.type} in ('PLATFORM', 'TRAVEL', 'VENDOR')`),
    check(
      'organizations_status_check',
      sql`${table.status} in ('ACTIVE', 'SUSPENDED', 'TERMINATED')`
    )
  ]
);

export const workspaces = identitySchema.table(
  'workspaces',
  {
    id: uuid('id').primaryKey(),
    organizationId: uuid('organization_id')
      .notNull()
      .references(() => organizations.id),
    createdAt: timestamp('created_at', {
      withTimezone: true
    })
      .notNull()
      .defaultNow(),
    updatedAt: timestamp('updated_at', {
      withTimezone: true
    })
      .notNull()
      .defaultNow()
  },
  (table) => [index('workspaces_organization_id_idx').on(table.organizationId)]
);

export const memberships = identitySchema.table(
  'memberships',
  {
    id: uuid('id').primaryKey(),
    identityId: uuid('identity_id')
      .notNull()
      .references(() => identities.id),
    organizationId: uuid('organization_id')
      .notNull()
      .references(() => organizations.id),
    status: text('status').notNull(),
    createdAt: timestamp('created_at', {
      withTimezone: true
    })
      .notNull()
      .defaultNow(),
    updatedAt: timestamp('updated_at', {
      withTimezone: true
    })
      .notNull()
      .defaultNow()
  },
  (table) => [
    unique('memberships_identity_organization_unique').on(table.identityId, table.organizationId),
    unique('memberships_id_organization_unique').on(table.id, table.organizationId),
    index('memberships_identity_id_idx').on(table.identityId),
    index('memberships_organization_id_idx').on(table.organizationId),
    check('memberships_status_check', sql`${table.status} in ('ACTIVE', 'SUSPENDED', 'REVOKED')`)
  ]
);

export const branches = identitySchema.table(
  'branches',
  {
    id: uuid('id').primaryKey(),
    organizationId: uuid('organization_id')
      .notNull()
      .references(() => organizations.id),
    status: text('status').notNull(),
    createdAt: timestamp('created_at', {
      withTimezone: true
    })
      .notNull()
      .defaultNow(),
    updatedAt: timestamp('updated_at', {
      withTimezone: true
    })
      .notNull()
      .defaultNow()
  },
  (table) => [
    unique('branches_id_organization_unique').on(table.id, table.organizationId),
    index('branches_organization_id_idx').on(table.organizationId),
    check('branches_status_check', sql`${table.status} in ('ACTIVE', 'SUSPENDED', 'CLOSED')`)
  ]
);

export const branchAccess = identitySchema.table(
  'branch_access',
  {
    id: uuid('id').primaryKey(),
    organizationId: uuid('organization_id').notNull(),
    membershipId: uuid('membership_id').notNull(),
    branchId: uuid('branch_id').notNull(),
    status: text('status').notNull(),
    createdAt: timestamp('created_at', {
      withTimezone: true
    })
      .notNull()
      .defaultNow(),
    updatedAt: timestamp('updated_at', {
      withTimezone: true
    })
      .notNull()
      .defaultNow()
  },
  (table) => [
    unique('branch_access_membership_branch_unique').on(table.membershipId, table.branchId),
    index('branch_access_membership_id_idx').on(table.membershipId),
    index('branch_access_branch_id_idx').on(table.branchId),
    index('branch_access_organization_id_idx').on(table.organizationId),
    foreignKey({
      name: 'branch_access_membership_organization_fk',
      columns: [table.membershipId, table.organizationId],
      foreignColumns: [memberships.id, memberships.organizationId]
    }),
    foreignKey({
      name: 'branch_access_branch_organization_fk',
      columns: [table.branchId, table.organizationId],
      foreignColumns: [branches.id, branches.organizationId]
    }),
    check('branch_access_status_check', sql`${table.status} in ('ACTIVE', 'SUSPENDED', 'REVOKED')`)
  ]
);

export const roles = identitySchema.table(
  'roles',
  {
    id: uuid('id').primaryKey(),
    organizationId: uuid('organization_id')
      .notNull()
      .references(() => organizations.id),
    name: text('name').notNull(),
    kind: text('kind').notNull(),
    status: text('status').notNull(),
    createdAt: timestamp('created_at', {
      withTimezone: true
    })
      .notNull()
      .defaultNow(),
    updatedAt: timestamp('updated_at', {
      withTimezone: true
    })
      .notNull()
      .defaultNow()
  },
  (table) => [
    unique('roles_id_organization_unique').on(table.id, table.organizationId),
    index('roles_organization_id_idx').on(table.organizationId),
    check('roles_kind_check', sql`${table.kind} in ('SYSTEM', 'CUSTOM')`),
    check('roles_status_check', sql`${table.status} in ('ACTIVE', 'ARCHIVED')`)
  ]
);

export const rolePermissions = identitySchema.table(
  'role_permissions',
  {
    roleId: uuid('role_id').notNull(),
    organizationId: uuid('organization_id').notNull(),
    permissionKey: text('permission_key').notNull(),
    scope: text('scope').notNull(),
    createdAt: timestamp('created_at', {
      withTimezone: true
    })
      .notNull()
      .defaultNow()
  },
  (table) => [
    unique('role_permissions_role_permission_unique').on(table.roleId, table.permissionKey),
    index('role_permissions_role_id_idx').on(table.roleId),
    index('role_permissions_organization_id_idx').on(table.organizationId),
    foreignKey({
      name: 'role_permissions_role_organization_fk',
      columns: [table.roleId, table.organizationId],
      foreignColumns: [roles.id, roles.organizationId]
    }),
    check(
      'role_permissions_scope_check',
      sql`${table.scope} in (
        'GLOBAL',
        'TENANT',
        'BRANCH',
        'OWN',
        'ASSIGNED',
        'RELATIONSHIP',
        'PUBLIC'
      )`
    )
  ]
);

export const roleAssignments = identitySchema.table(
  'role_assignments',
  {
    id: uuid('id').primaryKey(),
    organizationId: uuid('organization_id').notNull(),
    membershipId: uuid('membership_id').notNull(),
    roleId: uuid('role_id').notNull(),
    status: text('status').notNull(),
    createdAt: timestamp('created_at', {
      withTimezone: true
    })
      .notNull()
      .defaultNow(),
    updatedAt: timestamp('updated_at', {
      withTimezone: true
    })
      .notNull()
      .defaultNow()
  },
  (table) => [
    unique('role_assignments_membership_role_unique').on(table.membershipId, table.roleId),
    index('role_assignments_membership_id_idx').on(table.membershipId),
    index('role_assignments_role_id_idx').on(table.roleId),
    index('role_assignments_organization_id_idx').on(table.organizationId),
    foreignKey({
      name: 'role_assignments_membership_organization_fk',
      columns: [table.membershipId, table.organizationId],
      foreignColumns: [memberships.id, memberships.organizationId]
    }),
    foreignKey({
      name: 'role_assignments_role_organization_fk',
      columns: [table.roleId, table.organizationId],
      foreignColumns: [roles.id, roles.organizationId]
    }),
    check(
      'role_assignments_status_check',
      sql`${table.status} in ('ACTIVE', 'SUSPENDED', 'REVOKED')`
    )
  ]
);
