-- Custom SQL migration file, put your code below! --
UPDATE map_points 
SET date = 
    SUBSTRING(date FROM 7 FOR 4) || '-' || 
    SUBSTRING(date FROM 4 FOR 2) || '-' || 
    SUBSTRING(date FROM 1 FOR 2)
WHERE date ~ '^[0-9]{2}/[0-9]{2}/[0-9]{4}$';--> statement-breakpoint

ALTER TABLE "map_points" ALTER COLUMN "date" SET DATA TYPE date USING date::date;--> statement-breakpoint
ALTER TABLE "map_points" ALTER COLUMN "date" SET DEFAULT now();