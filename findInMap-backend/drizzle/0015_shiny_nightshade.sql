CREATE TYPE "public"."Plan" AS ENUM('pro');--> statement-breakpoint
CREATE TABLE "plans" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" "Plan" NOT NULL,
	"max_map_points" integer NOT NULL,
	CONSTRAINT "plans_name_unique" UNIQUE("name")
);
--> statement-breakpoint
ALTER TABLE "groups" ADD COLUMN "plan_id" uuid;--> statement-breakpoint
ALTER TABLE "groups" ADD CONSTRAINT "groups_plan_id_plans_id_fk" FOREIGN KEY ("plan_id") REFERENCES "public"."plans"("id") ON DELETE no action ON UPDATE no action;