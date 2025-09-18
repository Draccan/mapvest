-- CreateEnum
CREATE TYPE "public"."MapPointType" AS ENUM ('THEFT', 'AGGRESSION', 'ROBBERY');

-- CreateTable
CREATE TABLE "public"."map_points" (
    "id" SERIAL NOT NULL,
    "location" geometry(Point, 4326) NOT NULL,
    "type" "public"."MapPointType" NOT NULL,
    "date" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "map_points_pkey" PRIMARY KEY ("id")
);
