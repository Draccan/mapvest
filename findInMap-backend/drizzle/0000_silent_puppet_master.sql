CREATE TYPE "public"."MapPointType" AS ENUM('THEFT', 'AGGRESSION', 'ROBBERY');
CREATE TABLE "map_points" (
	"id" serial PRIMARY KEY NOT NULL,
	"location" geometry(Point, 4326) NOT NULL,
	"type" "MapPointType" NOT NULL,
	"date" text NOT NULL,
	"created_at" timestamp (3) DEFAULT now() NOT NULL,
	"updated_at" timestamp (3) DEFAULT now() NOT NULL
);
CREATE TABLE "users" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" varchar NOT NULL,
	"surname" varchar NOT NULL,
	"email" varchar NOT NULL,
	"password" varchar NOT NULL,
	"created_at" timestamp (6) DEFAULT now(),
	"updated_at" timestamp (6) DEFAULT now(),
	CONSTRAINT "users_email_unique" UNIQUE("email")
);
