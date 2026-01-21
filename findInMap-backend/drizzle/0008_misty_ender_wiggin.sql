ALTER TABLE "map_points" ADD COLUMN "is_public" boolean DEFAULT false;--> statement-breakpoint
ALTER TABLE "map_points" ADD COLUMN "public_id" uuid DEFAULT gen_random_uuid();--> statement-breakpoint
ALTER TABLE "map_points" ADD CONSTRAINT "map_points_public_id_unique" UNIQUE("public_id");