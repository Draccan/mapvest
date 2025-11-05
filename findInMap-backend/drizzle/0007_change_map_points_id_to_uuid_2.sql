ALTER TABLE "map_points" ADD COLUMN "new_id" uuid DEFAULT gen_random_uuid();

UPDATE "map_points" SET "new_id" = gen_random_uuid();

ALTER TABLE "map_points" DROP CONSTRAINT "map_points_pkey";

ALTER TABLE "map_points" ALTER COLUMN "new_id" SET NOT NULL;

ALTER TABLE "map_points" ADD PRIMARY KEY ("new_id");

ALTER TABLE "map_points" DROP COLUMN "id";

ALTER TABLE "map_points" RENAME COLUMN "new_id" TO "id";

ALTER TABLE "map_points" ALTER COLUMN "id" SET DEFAULT gen_random_uuid();