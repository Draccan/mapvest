ALTER TABLE "map_points" DROP CONSTRAINT "map_points_public_id_unique";--> statement-breakpoint
ALTER TABLE "map_points" DROP COLUMN "is_public";--> statement-breakpoint
ALTER TABLE "map_points" DROP COLUMN "public_id";