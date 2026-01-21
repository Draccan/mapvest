ALTER TABLE "maps" ADD COLUMN "is_public" boolean DEFAULT false NOT NULL;--> statement-breakpoint
ALTER TABLE "maps" ADD COLUMN "public_id" uuid;--> statement-breakpoint
ALTER TABLE "maps" ADD CONSTRAINT "maps_public_id_unique" UNIQUE("public_id");