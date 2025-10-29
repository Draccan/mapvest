DO $$ BEGIN
 CREATE TYPE "public"."UserGroupRole" AS ENUM('owner', 'admin', 'contributor');
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;

CREATE TABLE IF NOT EXISTS "groups" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" varchar NOT NULL,
	"created_by" uuid NOT NULL,
	"created_at" timestamp (6) DEFAULT now(),
	"updated_at" timestamp (6) DEFAULT now()
);
CREATE TABLE IF NOT EXISTS "users_groups" (
	"user_id" uuid NOT NULL,
	"group_id" uuid NOT NULL,
	"role" "UserGroupRole" NOT NULL,
	"created_at" timestamp (6) DEFAULT now(),
	PRIMARY KEY ("user_id", "group_id")
);

-- Add foreign key constraints only if they don't exist
DO $$ BEGIN
 ALTER TABLE "groups" ADD CONSTRAINT "groups_created_by_users_id_fk" FOREIGN KEY ("created_by") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
 ALTER TABLE "users_groups" ADD CONSTRAINT "users_groups_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
 ALTER TABLE "users_groups" ADD CONSTRAINT "users_groups_group_id_groups_id_fk" FOREIGN KEY ("group_id") REFERENCES "public"."groups"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;

-- Insert groups only for users who don't have one yet
INSERT INTO "groups" ("id", "name", "created_by", "created_at", "updated_at")
SELECT gen_random_uuid(), users.name || ' ' || users.surname || '''s Group', users.id, now(), now()
FROM users
WHERE NOT EXISTS (
	SELECT 1 FROM "groups" WHERE "groups"."created_by" = users.id
);

-- Insert user-group relationships only if they don't exist
INSERT INTO "users_groups" ("user_id", "group_id", "role", "created_at")
SELECT users.id, groups.id, 'owner', now()
FROM users
JOIN groups ON groups.created_by = users.id
WHERE NOT EXISTS (
	SELECT 1 FROM "users_groups" 
	WHERE "users_groups"."user_id" = users.id 
	AND "users_groups"."group_id" = groups.id
);
