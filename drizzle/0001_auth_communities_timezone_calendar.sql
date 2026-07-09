CREATE TABLE "users" (
	"id" serial PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"username" text NOT NULL,
	"password_hash" text NOT NULL,
	"email" text NOT NULL,
	"phone_number" text NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "refresh_tokens" (
	"id" serial PRIMARY KEY NOT NULL,
	"user_id" integer NOT NULL,
	"token_hash" text NOT NULL,
	"expires_at" timestamp with time zone NOT NULL,
	"revoked_at" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "locations" (
	"id" serial PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"timezone" text DEFAULT 'America/Vancouver' NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "communities" (
	"id" serial PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"location_id" integer NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "refresh_tokens" ADD CONSTRAINT "refresh_tokens_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;
--> statement-breakpoint
ALTER TABLE "communities" ADD CONSTRAINT "communities_location_id_locations_id_fk" FOREIGN KEY ("location_id") REFERENCES "public"."locations"("id") ON DELETE restrict ON UPDATE no action;
--> statement-breakpoint
CREATE UNIQUE INDEX "users_username_uidx" ON "users" USING btree ("username");
--> statement-breakpoint
CREATE UNIQUE INDEX "refresh_tokens_token_hash_uidx" ON "refresh_tokens" USING btree ("token_hash");
--> statement-breakpoint
CREATE INDEX "refresh_tokens_user_id_idx" ON "refresh_tokens" USING btree ("user_id");
--> statement-breakpoint
CREATE UNIQUE INDEX "locations_name_uidx" ON "locations" USING btree ("name");
--> statement-breakpoint
CREATE UNIQUE INDEX "communities_name_location_uidx" ON "communities" USING btree ("name","location_id");
--> statement-breakpoint
CREATE INDEX "communities_location_id_idx" ON "communities" USING btree ("location_id");
--> statement-breakpoint
INSERT INTO "locations" ("name", "timezone")
VALUES ('Default Location', 'America/Vancouver');
--> statement-breakpoint
INSERT INTO "communities" ("name", "location_id")
SELECT 'Unassigned', "id"
FROM "locations"
WHERE "name" = 'Default Location'
ORDER BY "id"
LIMIT 1;
--> statement-breakpoint
DROP INDEX "substitutes_town_idx";
--> statement-breakpoint
ALTER TABLE "substitutes" ADD COLUMN "email" text;
--> statement-breakpoint
ALTER TABLE "substitutes" ADD COLUMN "cell_phone" text;
--> statement-breakpoint
ALTER TABLE "substitutes" ALTER COLUMN "phone_number" DROP NOT NULL;
--> statement-breakpoint
ALTER TABLE "substitutes" DROP COLUMN "town";
--> statement-breakpoint
CREATE INDEX "substitutes_name_idx" ON "substitutes" USING btree ("name");
--> statement-breakpoint
ALTER TABLE "substitute_assignments" ADD COLUMN "community_id" integer;
--> statement-breakpoint
UPDATE "substitute_assignments"
SET "community_id" = (
	SELECT "id"
	FROM "communities"
	WHERE "name" = 'Unassigned'
	ORDER BY "id"
	LIMIT 1
);
--> statement-breakpoint
ALTER TABLE "substitute_assignments" ALTER COLUMN "community_id" SET NOT NULL;
--> statement-breakpoint
ALTER TABLE "substitute_assignments" ADD CONSTRAINT "substitute_assignments_community_id_communities_id_fk" FOREIGN KEY ("community_id") REFERENCES "public"."communities"("id") ON DELETE restrict ON UPDATE no action;
--> statement-breakpoint
CREATE INDEX "substitute_assignments_community_idx" ON "substitute_assignments" USING btree ("community_id");
--> statement-breakpoint
INSERT INTO "substitutes" ("name", "active")
SELECT DISTINCT "substitute_name", false
FROM "callout_statuses" AS "cs"
WHERE "substitute_id" IS NULL
	AND NOT EXISTS (
		SELECT 1
		FROM "substitutes" AS "s"
		WHERE "s"."name" = "cs"."substitute_name"
	);
--> statement-breakpoint
DELETE FROM "callout_statuses" AS "cs"
USING "callout_statuses" AS "older"
WHERE "cs"."substitute_id" IS NULL
	AND "older"."substitute_id" IS NULL
	AND "cs"."date" = "older"."date"
	AND "cs"."substitute_name" = "older"."substitute_name"
	AND "cs"."id" > "older"."id";
--> statement-breakpoint
DELETE FROM "callout_statuses" AS "cs"
USING (
	SELECT "name", min("id") AS "id"
	FROM "substitutes"
	GROUP BY "name"
) AS "resolved",
"callout_statuses" AS "existing"
WHERE "cs"."substitute_id" IS NULL
	AND "cs"."substitute_name" = "resolved"."name"
	AND "existing"."date" = "cs"."date"
	AND "existing"."substitute_id" = "resolved"."id";
--> statement-breakpoint
UPDATE "callout_statuses" AS "cs"
SET "substitute_id" = "resolved"."id"
FROM (
	SELECT "name", min("id") AS "id"
	FROM "substitutes"
	GROUP BY "name"
) AS "resolved"
WHERE "cs"."substitute_id" IS NULL
	AND "cs"."substitute_name" = "resolved"."name";
--> statement-breakpoint
ALTER TABLE "callout_statuses" DROP CONSTRAINT "callout_statuses_substitute_id_substitutes_id_fk";
--> statement-breakpoint
ALTER TABLE "callout_statuses" ALTER COLUMN "substitute_id" SET NOT NULL;
--> statement-breakpoint
ALTER TABLE "callout_statuses" DROP COLUMN "substitute_name";
--> statement-breakpoint
ALTER TABLE "callout_statuses" ADD CONSTRAINT "callout_statuses_substitute_id_substitutes_id_fk" FOREIGN KEY ("substitute_id") REFERENCES "public"."substitutes"("id") ON DELETE restrict ON UPDATE no action;
