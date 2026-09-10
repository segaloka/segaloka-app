CREATE SCHEMA "identity";
--> statement-breakpoint
CREATE TABLE "identity"."branch_access" (
	"id" uuid PRIMARY KEY NOT NULL,
	"organization_id" uuid NOT NULL,
	"membership_id" uuid NOT NULL,
	"branch_id" uuid NOT NULL,
	"status" text NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "branch_access_membership_branch_unique" UNIQUE("membership_id","branch_id"),
	CONSTRAINT "branch_access_status_check" CHECK ("identity"."branch_access"."status" in ('ACTIVE', 'SUSPENDED', 'REVOKED'))
);
--> statement-breakpoint
CREATE TABLE "identity"."branches" (
	"id" uuid PRIMARY KEY NOT NULL,
	"organization_id" uuid NOT NULL,
	"status" text NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "branches_id_organization_unique" UNIQUE("id","organization_id"),
	CONSTRAINT "branches_status_check" CHECK ("identity"."branches"."status" in ('ACTIVE', 'SUSPENDED', 'CLOSED'))
);
--> statement-breakpoint
CREATE TABLE "identity"."identities" (
	"id" uuid PRIMARY KEY NOT NULL,
	"status" text NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "identities_status_check" CHECK ("identity"."identities"."status" in ('ACTIVE', 'SUSPENDED', 'DISABLED'))
);
--> statement-breakpoint
CREATE TABLE "identity"."memberships" (
	"id" uuid PRIMARY KEY NOT NULL,
	"identity_id" uuid NOT NULL,
	"organization_id" uuid NOT NULL,
	"status" text NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "memberships_identity_organization_unique" UNIQUE("identity_id","organization_id"),
	CONSTRAINT "memberships_id_organization_unique" UNIQUE("id","organization_id"),
	CONSTRAINT "memberships_status_check" CHECK ("identity"."memberships"."status" in ('ACTIVE', 'SUSPENDED', 'REVOKED'))
);
--> statement-breakpoint
CREATE TABLE "identity"."organizations" (
	"id" uuid PRIMARY KEY NOT NULL,
	"type" text NOT NULL,
	"status" text NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "organizations_type_check" CHECK ("identity"."organizations"."type" in ('PLATFORM', 'TRAVEL', 'VENDOR')),
	CONSTRAINT "organizations_status_check" CHECK ("identity"."organizations"."status" in ('ACTIVE', 'SUSPENDED', 'TERMINATED'))
);
--> statement-breakpoint
CREATE TABLE "identity"."role_assignments" (
	"id" uuid PRIMARY KEY NOT NULL,
	"organization_id" uuid NOT NULL,
	"membership_id" uuid NOT NULL,
	"role_id" uuid NOT NULL,
	"status" text NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "role_assignments_membership_role_unique" UNIQUE("membership_id","role_id"),
	CONSTRAINT "role_assignments_status_check" CHECK ("identity"."role_assignments"."status" in ('ACTIVE', 'SUSPENDED', 'REVOKED'))
);
--> statement-breakpoint
CREATE TABLE "identity"."role_permissions" (
	"role_id" uuid NOT NULL,
	"organization_id" uuid NOT NULL,
	"permission_key" text NOT NULL,
	"scope" text NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "role_permissions_role_permission_unique" UNIQUE("role_id","permission_key"),
	CONSTRAINT "role_permissions_scope_check" CHECK ("identity"."role_permissions"."scope" in (
        'GLOBAL',
        'TENANT',
        'BRANCH',
        'OWN',
        'ASSIGNED',
        'RELATIONSHIP',
        'PUBLIC'
      ))
);
--> statement-breakpoint
CREATE TABLE "identity"."roles" (
	"id" uuid PRIMARY KEY NOT NULL,
	"organization_id" uuid NOT NULL,
	"name" text NOT NULL,
	"kind" text NOT NULL,
	"status" text NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "roles_id_organization_unique" UNIQUE("id","organization_id"),
	CONSTRAINT "roles_kind_check" CHECK ("identity"."roles"."kind" in ('SYSTEM', 'CUSTOM')),
	CONSTRAINT "roles_status_check" CHECK ("identity"."roles"."status" in ('ACTIVE', 'ARCHIVED'))
);
--> statement-breakpoint
CREATE TABLE "identity"."workspaces" (
	"id" uuid PRIMARY KEY NOT NULL,
	"organization_id" uuid NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "identity"."branch_access" ADD CONSTRAINT "branch_access_membership_organization_fk" FOREIGN KEY ("membership_id","organization_id") REFERENCES "identity"."memberships"("id","organization_id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "identity"."branch_access" ADD CONSTRAINT "branch_access_branch_organization_fk" FOREIGN KEY ("branch_id","organization_id") REFERENCES "identity"."branches"("id","organization_id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "identity"."branches" ADD CONSTRAINT "branches_organization_id_organizations_id_fk" FOREIGN KEY ("organization_id") REFERENCES "identity"."organizations"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "identity"."memberships" ADD CONSTRAINT "memberships_identity_id_identities_id_fk" FOREIGN KEY ("identity_id") REFERENCES "identity"."identities"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "identity"."memberships" ADD CONSTRAINT "memberships_organization_id_organizations_id_fk" FOREIGN KEY ("organization_id") REFERENCES "identity"."organizations"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "identity"."role_assignments" ADD CONSTRAINT "role_assignments_membership_organization_fk" FOREIGN KEY ("membership_id","organization_id") REFERENCES "identity"."memberships"("id","organization_id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "identity"."role_assignments" ADD CONSTRAINT "role_assignments_role_organization_fk" FOREIGN KEY ("role_id","organization_id") REFERENCES "identity"."roles"("id","organization_id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "identity"."role_permissions" ADD CONSTRAINT "role_permissions_role_organization_fk" FOREIGN KEY ("role_id","organization_id") REFERENCES "identity"."roles"("id","organization_id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "identity"."roles" ADD CONSTRAINT "roles_organization_id_organizations_id_fk" FOREIGN KEY ("organization_id") REFERENCES "identity"."organizations"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "identity"."workspaces" ADD CONSTRAINT "workspaces_organization_id_organizations_id_fk" FOREIGN KEY ("organization_id") REFERENCES "identity"."organizations"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "branch_access_membership_id_idx" ON "identity"."branch_access" USING btree ("membership_id");--> statement-breakpoint
CREATE INDEX "branch_access_branch_id_idx" ON "identity"."branch_access" USING btree ("branch_id");--> statement-breakpoint
CREATE INDEX "branch_access_organization_id_idx" ON "identity"."branch_access" USING btree ("organization_id");--> statement-breakpoint
CREATE INDEX "branches_organization_id_idx" ON "identity"."branches" USING btree ("organization_id");--> statement-breakpoint
CREATE INDEX "memberships_identity_id_idx" ON "identity"."memberships" USING btree ("identity_id");--> statement-breakpoint
CREATE INDEX "memberships_organization_id_idx" ON "identity"."memberships" USING btree ("organization_id");--> statement-breakpoint
CREATE INDEX "role_assignments_membership_id_idx" ON "identity"."role_assignments" USING btree ("membership_id");--> statement-breakpoint
CREATE INDEX "role_assignments_role_id_idx" ON "identity"."role_assignments" USING btree ("role_id");--> statement-breakpoint
CREATE INDEX "role_assignments_organization_id_idx" ON "identity"."role_assignments" USING btree ("organization_id");--> statement-breakpoint
CREATE INDEX "role_permissions_role_id_idx" ON "identity"."role_permissions" USING btree ("role_id");--> statement-breakpoint
CREATE INDEX "role_permissions_organization_id_idx" ON "identity"."role_permissions" USING btree ("organization_id");--> statement-breakpoint
CREATE INDEX "roles_organization_id_idx" ON "identity"."roles" USING btree ("organization_id");--> statement-breakpoint
CREATE INDEX "workspaces_organization_id_idx" ON "identity"."workspaces" USING btree ("organization_id");