import {
    pgTable,
    serial,
    uuid,
    varchar,
    text,
    timestamp,
    pgEnum,
    customType,
} from "drizzle-orm/pg-core";

const geometry = customType<{ data: string; driverData: string }>({
    dataType() {
        return "geometry(Point, 4326)";
    },
});

export const mapPointTypeEnum = pgEnum("MapPointType", [
    "THEFT",
    "AGGRESSION",
    "ROBBERY",
]);

export const users = pgTable("users", {
    id: uuid("id").primaryKey().defaultRandom(),
    name: varchar("name").notNull(),
    surname: varchar("surname").notNull(),
    email: varchar("email").notNull().unique(),
    password: varchar("password").notNull(),
    createdAt: timestamp("created_at", { precision: 6 }).defaultNow(),
    updatedAt: timestamp("updated_at", { precision: 6 })
        .defaultNow()
        .$onUpdate(() => new Date()),
});

export const mapPoints = pgTable("map_points", {
    id: serial("id").primaryKey(),
    location: geometry("location").notNull(),
    type: mapPointTypeEnum("type").notNull(),
    date: text("date").notNull(), // Date in DD/MM/YYYY format
    createdAt: timestamp("created_at", { precision: 3 }).defaultNow().notNull(),
    updatedAt: timestamp("updated_at", { precision: 3 })
        .defaultNow()
        .notNull()
        .$onUpdate(() => new Date()),
});

export type User = typeof users.$inferSelect;
export type NewUser = typeof users.$inferInsert;
export type MapPoint = typeof mapPoints.$inferSelect;
export type NewMapPoint = typeof mapPoints.$inferInsert;
