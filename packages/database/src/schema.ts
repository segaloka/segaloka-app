import { sql } from 'drizzle-orm';
import {
  bigint,
  boolean,
  check,
  foreignKey,
  index,
  integer,
  jsonb,
  numeric,
  pgSchema,
  pgTable,
  text,
  timestamp,
  unique,
  uuid
} from 'drizzle-orm/pg-core';

export const identitySchema = pgSchema('identity');
export const authSchema = pgSchema('auth');

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

export const principals = authSchema.table(
  'principals',
  {
    id: uuid('id').primaryKey(),
    identityId: uuid('identity_id').references(() => identities.id),
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
    unique('principals_identity_id_unique').on(table.identityId),
    check('principals_status_check', sql`${table.status} in ('ACTIVE', 'SUSPENDED', 'REVOKED')`)
  ]
);

export const principalBindings = authSchema.table(
  'principal_bindings',
  {
    id: uuid('id').primaryKey(),
    principalId: uuid('principal_id')
      .notNull()
      .references(() => principals.id),
    issuer: text('issuer').notNull(),
    subject: text('subject').notNull(),
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
    unique('principal_bindings_issuer_subject_unique').on(table.issuer, table.subject),
    index('principal_bindings_principal_id_idx').on(table.principalId),
    check('principal_bindings_issuer_non_empty_check', sql`length(btrim(${table.issuer})) > 0`),
    check('principal_bindings_subject_non_empty_check', sql`length(btrim(${table.subject})) > 0`),
    check('principal_bindings_status_check', sql`${table.status} in ('ACTIVE', 'REVOKED')`)
  ]
);
export const marketplaceTravels = pgTable(
  'marketplace_travels',
  {
    id: uuid('id').primaryKey(),
    organizationId: uuid('organization_id')
      .notNull()
      .references(() => organizations.id),
    displayName: text('display_name').notNull(),
    logoUrl: text('logo_url'),
    verificationStatus: text('verification_status').notNull(),
    status: text('status').notNull(),
    verifiedAt: timestamp('verified_at', { withTimezone: true }),
    createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow()
  },
  (table) => [
    unique('marketplace_travels_organization_id_unique').on(table.organizationId),
    index('marketplace_travels_public_idx').on(
      table.verificationStatus,
      table.status,
      table.displayName
    ),
    check(
      'marketplace_travels_display_name_non_empty_check',
      sql`length(btrim(${table.displayName})) > 0`
    ),
    check(
      'marketplace_travels_verification_status_check',
      sql`${table.verificationStatus} in ('PENDING', 'VERIFIED', 'REJECTED', 'SUSPENDED')`
    ),
    check('marketplace_travels_status_check', sql`${table.status} in ('ACTIVE', 'INACTIVE')`),
    check(
      'marketplace_travels_verified_at_check',
      sql`${table.verificationStatus} <> 'VERIFIED' or ${table.verifiedAt} is not null`
    )
  ]
);

export const marketplacePackages = pgTable(
  'marketplace_packages',
  {
    id: uuid('id').primaryKey(),
    travelId: uuid('travel_id')
      .notNull()
      .references(() => marketplaceTravels.id),
    categoryCode: text('category_code').notNull(),
    titles: jsonb('titles').$type<Record<string, string>>().notNull(),
    destinationLabels: jsonb('destination_labels').$type<Record<string, string>>().notNull(),
    startingPriceAmountMinor: bigint('starting_price_amount_minor', { mode: 'number' }).notNull(),
    currencyCode: text('currency_code').notNull(),
    heroImageUrl: text('hero_image_url').notNull(),
    durationDays: integer('duration_days').notNull(),
    averageRating: numeric('average_rating', { precision: 2, scale: 1, mode: 'number' })
      .notNull()
      .default(0),
    reviewCount: integer('review_count').notNull().default(0),
    publicationStatus: text('publication_status').notNull(),
    isActive: boolean('is_active').notNull().default(false),
    isBookable: boolean('is_bookable').notNull().default(false),
    publishedAt: timestamp('published_at', { withTimezone: true }),
    createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow()
  },
  (table) => [
    index('marketplace_packages_latest_public_idx').on(
      table.publicationStatus,
      table.isActive,
      table.isBookable,
      table.publishedAt
    ),
    index('marketplace_packages_travel_id_idx').on(table.travelId),
    check(
      'marketplace_packages_category_code_check',
      sql`${table.categoryCode} in ('UMRAH', 'HALAL_TOUR', 'HAJJ', 'DOMESTIC', 'LAND_ARRANGEMENT', 'SEGADEALS')`
    ),
    check(
      'marketplace_packages_titles_locales_check',
      sql`jsonb_typeof(${table.titles}) = 'object' and ${table.titles} ?& array['id', 'en', 'ar']`
    ),
    check(
      'marketplace_packages_destination_locales_check',
      sql`jsonb_typeof(${table.destinationLabels}) = 'object' and ${table.destinationLabels} ?& array['id', 'en', 'ar']`
    ),
    check('marketplace_packages_amount_check', sql`${table.startingPriceAmountMinor} >= 0`),
    check('marketplace_packages_currency_check', sql`${table.currencyCode} ~ '^[A-Z]{3}$'`),
    check('marketplace_packages_duration_check', sql`${table.durationDays} > 0`),
    check(
      'marketplace_packages_rating_check',
      sql`${table.averageRating} >= 0 and ${table.averageRating} <= 5`
    ),
    check('marketplace_packages_review_count_check', sql`${table.reviewCount} >= 0`),
    check(
      'marketplace_packages_publication_status_check',
      sql`${table.publicationStatus} in ('DRAFT', 'PUBLISHED', 'ARCHIVED')`
    ),
    check(
      'marketplace_packages_published_at_check',
      sql`${table.publicationStatus} <> 'PUBLISHED' or ${table.publishedAt} is not null`
    )
  ]
);

export const marketplacePromotions = pgTable(
  'marketplace_promotions',
  {
    id: uuid('id').primaryKey(),
    placement: text('placement').notNull(),
    packageId: uuid('package_id').references(() => marketplacePackages.id),
    titles: jsonb('titles').$type<Record<string, string>>().notNull(),
    descriptions: jsonb('descriptions').$type<Record<string, string>>().notNull(),
    callToActionLabels: jsonb('call_to_action_labels').$type<Record<string, string>>().notNull(),
    targetUri: text('target_uri').notNull(),
    imageUrl: text('image_url'),
    sortOrder: integer('sort_order').notNull().default(0),
    isActive: boolean('is_active').notNull().default(false),
    isSponsored: boolean('is_sponsored').notNull().default(false),
    startsAt: timestamp('starts_at', { withTimezone: true }),
    endsAt: timestamp('ends_at', { withTimezone: true }),
    createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow()
  },
  (table) => [
    index('marketplace_promotions_active_placement_idx').on(
      table.placement,
      table.isActive,
      table.sortOrder,
      table.startsAt,
      table.endsAt
    ),
    index('marketplace_promotions_package_id_idx').on(table.packageId),
    check(
      'marketplace_promotions_placement_check',
      sql`${table.placement} in ('hero_banner', 'popular_package', 'top_package')`
    ),
    check(
      'marketplace_promotions_package_required_check',
      sql`${table.placement} = 'hero_banner' or ${table.packageId} is not null`
    ),
    check(
      'marketplace_promotions_titles_locales_check',
      sql`jsonb_typeof(${table.titles}) = 'object' and ${table.titles} ?& array['id', 'en', 'ar']`
    ),
    check(
      'marketplace_promotions_descriptions_locales_check',
      sql`jsonb_typeof(${table.descriptions}) = 'object' and ${table.descriptions} ?& array['id', 'en', 'ar']`
    ),
    check(
      'marketplace_promotions_cta_locales_check',
      sql`jsonb_typeof(${table.callToActionLabels}) = 'object' and ${table.callToActionLabels} ?& array['id', 'en', 'ar']`
    ),
    check(
      'marketplace_promotions_target_uri_non_empty_check',
      sql`length(btrim(${table.targetUri})) > 0`
    ),
    check(
      'marketplace_promotions_time_range_check',
      sql`${table.startsAt} is null or ${table.endsAt} is null or ${table.endsAt} > ${table.startsAt}`
    )
  ]
);
