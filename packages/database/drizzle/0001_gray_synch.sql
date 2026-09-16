CREATE SCHEMA "iam";
--> statement-breakpoint
CREATE TABLE "iam"."principal_bindings" (
	"id" uuid PRIMARY KEY NOT NULL,
	"principal_id" uuid NOT NULL,
	"issuer" text NOT NULL,
	"subject" text NOT NULL,
	"status" text NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "principal_bindings_issuer_subject_unique" UNIQUE("issuer","subject"),
	CONSTRAINT "principal_bindings_issuer_non_empty_check" CHECK (length(btrim("iam"."principal_bindings"."issuer")) > 0),
	CONSTRAINT "principal_bindings_subject_non_empty_check" CHECK (length(btrim("iam"."principal_bindings"."subject")) > 0),
	CONSTRAINT "principal_bindings_status_check" CHECK ("iam"."principal_bindings"."status" in ('ACTIVE', 'REVOKED'))
);
--> statement-breakpoint
CREATE TABLE "iam"."principals" (
	"id" uuid PRIMARY KEY NOT NULL,
	"identity_id" uuid,
	"status" text NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "principals_identity_id_unique" UNIQUE("identity_id"),
	CONSTRAINT "principals_status_check" CHECK ("iam"."principals"."status" in ('ACTIVE', 'SUSPENDED', 'REVOKED'))
);
--> statement-breakpoint
ALTER TABLE "iam"."principal_bindings" ADD CONSTRAINT "principal_bindings_principal_id_principals_id_fk" FOREIGN KEY ("principal_id") REFERENCES "iam"."principals"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "iam"."principals" ADD CONSTRAINT "principals_identity_id_identities_id_fk" FOREIGN KEY ("identity_id") REFERENCES "identity"."identities"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "principal_bindings_principal_id_idx" ON "iam"."principal_bindings" USING btree ("principal_id");