CREATE TABLE "marketplace_packages" (
	"id" uuid PRIMARY KEY NOT NULL,
	"travel_id" uuid NOT NULL,
	"category_code" text NOT NULL,
	"titles" jsonb NOT NULL,
	"destination_labels" jsonb NOT NULL,
	"starting_price_amount_minor" bigint NOT NULL,
	"currency_code" text NOT NULL,
	"hero_image_url" text NOT NULL,
	"duration_days" integer NOT NULL,
	"average_rating" numeric(2, 1) DEFAULT 0 NOT NULL,
	"review_count" integer DEFAULT 0 NOT NULL,
	"publication_status" text NOT NULL,
	"is_active" boolean DEFAULT false NOT NULL,
	"is_bookable" boolean DEFAULT false NOT NULL,
	"published_at" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "marketplace_packages_category_code_check" CHECK ("marketplace_packages"."category_code" in ('UMRAH', 'HALAL_TOUR', 'HAJJ', 'DOMESTIC', 'LAND_ARRANGEMENT', 'SEGADEALS')),
	CONSTRAINT "marketplace_packages_titles_locales_check" CHECK (jsonb_typeof("marketplace_packages"."titles") = 'object' and "marketplace_packages"."titles" ?& array['id', 'en', 'ar']),
	CONSTRAINT "marketplace_packages_destination_locales_check" CHECK (jsonb_typeof("marketplace_packages"."destination_labels") = 'object' and "marketplace_packages"."destination_labels" ?& array['id', 'en', 'ar']),
	CONSTRAINT "marketplace_packages_amount_check" CHECK ("marketplace_packages"."starting_price_amount_minor" >= 0),
	CONSTRAINT "marketplace_packages_currency_check" CHECK ("marketplace_packages"."currency_code" ~ '^[A-Z]{3}$'),
	CONSTRAINT "marketplace_packages_duration_check" CHECK ("marketplace_packages"."duration_days" > 0),
	CONSTRAINT "marketplace_packages_rating_check" CHECK ("marketplace_packages"."average_rating" >= 0 and "marketplace_packages"."average_rating" <= 5),
	CONSTRAINT "marketplace_packages_review_count_check" CHECK ("marketplace_packages"."review_count" >= 0),
	CONSTRAINT "marketplace_packages_publication_status_check" CHECK ("marketplace_packages"."publication_status" in ('DRAFT', 'PUBLISHED', 'ARCHIVED')),
	CONSTRAINT "marketplace_packages_published_at_check" CHECK ("marketplace_packages"."publication_status" <> 'PUBLISHED' or "marketplace_packages"."published_at" is not null)
);
--> statement-breakpoint
CREATE TABLE "marketplace_promotions" (
	"id" uuid PRIMARY KEY NOT NULL,
	"placement" text NOT NULL,
	"package_id" uuid,
	"titles" jsonb NOT NULL,
	"descriptions" jsonb NOT NULL,
	"call_to_action_labels" jsonb NOT NULL,
	"target_uri" text NOT NULL,
	"image_url" text,
	"sort_order" integer DEFAULT 0 NOT NULL,
	"is_active" boolean DEFAULT false NOT NULL,
	"is_sponsored" boolean DEFAULT false NOT NULL,
	"starts_at" timestamp with time zone,
	"ends_at" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "marketplace_promotions_placement_check" CHECK ("marketplace_promotions"."placement" in ('hero_banner', 'popular_package', 'top_package')),
	CONSTRAINT "marketplace_promotions_package_required_check" CHECK ("marketplace_promotions"."placement" = 'hero_banner' or "marketplace_promotions"."package_id" is not null),
	CONSTRAINT "marketplace_promotions_titles_locales_check" CHECK (jsonb_typeof("marketplace_promotions"."titles") = 'object' and "marketplace_promotions"."titles" ?& array['id', 'en', 'ar']),
	CONSTRAINT "marketplace_promotions_descriptions_locales_check" CHECK (jsonb_typeof("marketplace_promotions"."descriptions") = 'object' and "marketplace_promotions"."descriptions" ?& array['id', 'en', 'ar']),
	CONSTRAINT "marketplace_promotions_cta_locales_check" CHECK (jsonb_typeof("marketplace_promotions"."call_to_action_labels") = 'object' and "marketplace_promotions"."call_to_action_labels" ?& array['id', 'en', 'ar']),
	CONSTRAINT "marketplace_promotions_target_uri_non_empty_check" CHECK (length(btrim("marketplace_promotions"."target_uri")) > 0),
	CONSTRAINT "marketplace_promotions_time_range_check" CHECK ("marketplace_promotions"."starts_at" is null or "marketplace_promotions"."ends_at" is null or "marketplace_promotions"."ends_at" > "marketplace_promotions"."starts_at")
);
--> statement-breakpoint
CREATE TABLE "marketplace_travels" (
	"id" uuid PRIMARY KEY NOT NULL,
	"organization_id" uuid NOT NULL,
	"display_name" text NOT NULL,
	"logo_url" text,
	"verification_status" text NOT NULL,
	"status" text NOT NULL,
	"verified_at" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "marketplace_travels_organization_id_unique" UNIQUE("organization_id"),
	CONSTRAINT "marketplace_travels_display_name_non_empty_check" CHECK (length(btrim("marketplace_travels"."display_name")) > 0),
	CONSTRAINT "marketplace_travels_verification_status_check" CHECK ("marketplace_travels"."verification_status" in ('PENDING', 'VERIFIED', 'REJECTED', 'SUSPENDED')),
	CONSTRAINT "marketplace_travels_status_check" CHECK ("marketplace_travels"."status" in ('ACTIVE', 'INACTIVE')),
	CONSTRAINT "marketplace_travels_verified_at_check" CHECK ("marketplace_travels"."verification_status" <> 'VERIFIED' or "marketplace_travels"."verified_at" is not null)
);
--> statement-breakpoint
ALTER TABLE "marketplace_packages" ADD CONSTRAINT "marketplace_packages_travel_id_marketplace_travels_id_fk" FOREIGN KEY ("travel_id") REFERENCES "public"."marketplace_travels"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "marketplace_promotions" ADD CONSTRAINT "marketplace_promotions_package_id_marketplace_packages_id_fk" FOREIGN KEY ("package_id") REFERENCES "public"."marketplace_packages"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "marketplace_travels" ADD CONSTRAINT "marketplace_travels_organization_id_organizations_id_fk" FOREIGN KEY ("organization_id") REFERENCES "identity"."organizations"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "marketplace_packages_latest_public_idx" ON "marketplace_packages" USING btree ("publication_status","is_active","is_bookable","published_at");--> statement-breakpoint
CREATE INDEX "marketplace_packages_travel_id_idx" ON "marketplace_packages" USING btree ("travel_id");--> statement-breakpoint
CREATE INDEX "marketplace_promotions_active_placement_idx" ON "marketplace_promotions" USING btree ("placement","is_active","sort_order","starts_at","ends_at");--> statement-breakpoint
CREATE INDEX "marketplace_promotions_package_id_idx" ON "marketplace_promotions" USING btree ("package_id");--> statement-breakpoint
CREATE INDEX "marketplace_travels_public_idx" ON "marketplace_travels" USING btree ("verification_status","status","display_name");
--> statement-breakpoint
ALTER TABLE "public"."marketplace_travels" ENABLE ROW LEVEL SECURITY;
--> statement-breakpoint
ALTER TABLE "public"."marketplace_packages" ENABLE ROW LEVEL SECURITY;
--> statement-breakpoint
ALTER TABLE "public"."marketplace_promotions" ENABLE ROW LEVEL SECURITY;
--> statement-breakpoint
GRANT SELECT ON TABLE
  "public"."marketplace_travels",
  "public"."marketplace_packages",
  "public"."marketplace_promotions"
TO anon, authenticated;
--> statement-breakpoint
CREATE POLICY "marketplace_travels_public_read"
ON "public"."marketplace_travels"
FOR SELECT
TO anon, authenticated
USING ("verification_status" = 'VERIFIED' AND "status" = 'ACTIVE');
--> statement-breakpoint
CREATE POLICY "marketplace_packages_public_read"
ON "public"."marketplace_packages"
FOR SELECT
TO anon, authenticated
USING (
  "publication_status" = 'PUBLISHED'
  AND "is_active" = true
  AND "is_bookable" = true
  AND EXISTS (
    SELECT 1
    FROM "public"."marketplace_travels" AS travel
    WHERE travel."id" = "travel_id"
      AND travel."verification_status" = 'VERIFIED'
      AND travel."status" = 'ACTIVE'
  )
);
--> statement-breakpoint
CREATE POLICY "marketplace_promotions_public_read"
ON "public"."marketplace_promotions"
FOR SELECT
TO anon, authenticated
USING (
  "is_active" = true
  AND ("starts_at" IS NULL OR "starts_at" <= now())
  AND ("ends_at" IS NULL OR "ends_at" > now())
);
--> statement-breakpoint
DO $$
DECLARE
  table_name text;
BEGIN
  IF EXISTS (SELECT 1 FROM pg_publication WHERE pubname = 'supabase_realtime') THEN
    FOREACH table_name IN ARRAY ARRAY[
      'marketplace_travels',
      'marketplace_packages',
      'marketplace_promotions'
    ]
    LOOP
      IF NOT EXISTS (
        SELECT 1
        FROM pg_publication_tables
        WHERE pubname = 'supabase_realtime'
          AND schemaname = 'public'
          AND tablename = table_name
      ) THEN
        EXECUTE format(
          'ALTER PUBLICATION supabase_realtime ADD TABLE public.%I',
          table_name
        );
      END IF;
    END LOOP;
  END IF;
END
$$;