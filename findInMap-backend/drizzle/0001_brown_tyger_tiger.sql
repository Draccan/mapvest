ALTER TABLE "map_points" ALTER COLUMN "type" SET DATA TYPE varchar;--> statement-breakpoint
ALTER TABLE "map_points" ALTER COLUMN "type" DROP NOT NULL;--> statement-breakpoint
DROP TYPE "public"."MapPointType";