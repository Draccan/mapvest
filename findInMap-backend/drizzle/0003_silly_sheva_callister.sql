CREATE TABLE "map_categories" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"map_id" uuid NOT NULL,
	"description" varchar NOT NULL,
	"color" varchar NOT NULL,
	"created_at" timestamp (6) DEFAULT now(),
	"updated_at" timestamp (6) DEFAULT now()
);
--> statement-breakpoint
ALTER TABLE "map_points" ADD COLUMN "category_id" uuid;--> statement-breakpoint
ALTER TABLE "map_categories" ADD CONSTRAINT "map_categories_map_id_maps_id_fk" FOREIGN KEY ("map_id") REFERENCES "public"."maps"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "map_points" ADD CONSTRAINT "map_points_category_id_map_categories_id_fk" FOREIGN KEY ("category_id") REFERENCES "public"."map_categories"("id") ON DELETE no action ON UPDATE no action;