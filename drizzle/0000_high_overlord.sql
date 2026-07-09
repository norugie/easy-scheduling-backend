CREATE TYPE "public"."callout_status" AS ENUM('accepted', 'declined', 'no_answer', 'pending');--> statement-breakpoint
CREATE TABLE "absence_ranges" (
	"id" serial PRIMARY KEY NOT NULL,
	"person_away_name" text NOT NULL,
	"start_date" date NOT NULL,
	"end_date" date NOT NULL,
	"notes" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "absence_ranges_valid_dates" CHECK ("absence_ranges"."start_date" <= "absence_ranges"."end_date")
);
--> statement-breakpoint
CREATE TABLE "callout_statuses" (
	"id" serial PRIMARY KEY NOT NULL,
	"date" date NOT NULL,
	"substitute_id" integer,
	"substitute_name" text NOT NULL,
	"status" "callout_status" DEFAULT 'pending' NOT NULL,
	"notes" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "day_notes" (
	"id" serial PRIMARY KEY NOT NULL,
	"date" date NOT NULL,
	"notes" text DEFAULT '' NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "substitute_assignment_exceptions" (
	"id" serial PRIMARY KEY NOT NULL,
	"substitute_assignment_id" integer NOT NULL,
	"date" date NOT NULL,
	"reason" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "substitute_assignments" (
	"id" serial PRIMARY KEY NOT NULL,
	"absence_id" integer,
	"substitute_id" integer,
	"substitute_name" text NOT NULL,
	"start_date" date NOT NULL,
	"end_date" date NOT NULL,
	"notes" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "substitute_assignments_valid_dates" CHECK ("substitute_assignments"."start_date" <= "substitute_assignments"."end_date")
);
--> statement-breakpoint
CREATE TABLE "substitutes" (
	"id" serial PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"phone_number" text NOT NULL,
	"town" text NOT NULL,
	"active" boolean DEFAULT true NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "callout_statuses" ADD CONSTRAINT "callout_statuses_substitute_id_substitutes_id_fk" FOREIGN KEY ("substitute_id") REFERENCES "public"."substitutes"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "substitute_assignment_exceptions" ADD CONSTRAINT "substitute_assignment_exceptions_substitute_assignment_id_substitute_assignments_id_fk" FOREIGN KEY ("substitute_assignment_id") REFERENCES "public"."substitute_assignments"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "substitute_assignments" ADD CONSTRAINT "substitute_assignments_absence_id_absence_ranges_id_fk" FOREIGN KEY ("absence_id") REFERENCES "public"."absence_ranges"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "substitute_assignments" ADD CONSTRAINT "substitute_assignments_substitute_id_substitutes_id_fk" FOREIGN KEY ("substitute_id") REFERENCES "public"."substitutes"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "absence_ranges_dates_idx" ON "absence_ranges" USING btree ("start_date","end_date");--> statement-breakpoint
CREATE UNIQUE INDEX "callout_statuses_date_substitute_uidx" ON "callout_statuses" USING btree ("date","substitute_id");--> statement-breakpoint
CREATE INDEX "callout_statuses_date_idx" ON "callout_statuses" USING btree ("date");--> statement-breakpoint
CREATE UNIQUE INDEX "day_notes_date_uidx" ON "day_notes" USING btree ("date");--> statement-breakpoint
CREATE UNIQUE INDEX "substitute_assignment_exceptions_assignment_date_uidx" ON "substitute_assignment_exceptions" USING btree ("substitute_assignment_id","date");--> statement-breakpoint
CREATE INDEX "substitute_assignment_exceptions_date_idx" ON "substitute_assignment_exceptions" USING btree ("date");--> statement-breakpoint
CREATE INDEX "substitute_assignments_dates_idx" ON "substitute_assignments" USING btree ("start_date","end_date");--> statement-breakpoint
CREATE INDEX "substitute_assignments_absence_idx" ON "substitute_assignments" USING btree ("absence_id");--> statement-breakpoint
CREATE INDEX "substitute_assignments_substitute_idx" ON "substitute_assignments" USING btree ("substitute_id");--> statement-breakpoint
CREATE INDEX "substitutes_town_idx" ON "substitutes" USING btree ("town");--> statement-breakpoint
CREATE INDEX "substitutes_active_idx" ON "substitutes" USING btree ("active");