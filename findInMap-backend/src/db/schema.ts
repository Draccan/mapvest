import {
    pgTable,
    serial,
    uuid,
    varchar,
    text,
    timestamp,
    pgEnum,
    customType,
    primaryKey,
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

export const userGroupRoleEnum = pgEnum("UserGroupRole", [
    "owner",
    "admin",
    "contributor",
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

export const groups = pgTable("groups", {
    id: uuid("id").primaryKey().defaultRandom(),
    name: varchar("name").notNull(),
    createdBy: uuid("created_by")
        .notNull()
        .references(() => users.id),
    createdAt: timestamp("created_at", { precision: 6 }).defaultNow(),
    updatedAt: timestamp("updated_at", { precision: 6 })
        .defaultNow()
        .$onUpdate(() => new Date()),
});

export const usersGroups = pgTable(
    "users_groups",
    {
        userId: uuid("user_id")
            .notNull()
            .references(() => users.id),
        groupId: uuid("group_id")
            .notNull()
            .references(() => groups.id),
        role: userGroupRoleEnum("role").notNull(),
        createdAt: timestamp("created_at", { precision: 6 }).defaultNow(),
    },
    (table) => ({
        pk: primaryKey({ columns: [table.userId, table.groupId] }),
    }),
);

export const mapPoints = pgTable("map_points", {
    id: serial("id").primaryKey(),
    location: geometry("location").notNull(),
    type: mapPointTypeEnum("type").notNull(),
    date: text("date").notNull(),
    createdAt: timestamp("created_at", { precision: 3 }).defaultNow().notNull(),
    updatedAt: timestamp("updated_at", { precision: 3 })
        .defaultNow()
        .notNull()
        .$onUpdate(() => new Date()),
});

export const maps = pgTable("maps", {
    id: uuid("id").primaryKey().notNull().defaultRandom(),
    groupId: uuid("group_id")
        .notNull()
        .references(() => groups.id),
    name: varchar("name").notNull(),
});

export type User = typeof users.$inferSelect;
export type NewUser = typeof users.$inferInsert;
export type Group = typeof groups.$inferSelect;
export type NewGroup = typeof groups.$inferInsert;
export type UserGroup = typeof usersGroups.$inferSelect;
export type NewUserGroup = typeof usersGroups.$inferInsert;
export type MapPoint = typeof mapPoints.$inferSelect;
export type NewMapPoint = typeof mapPoints.$inferInsert;
export type Map = typeof maps.$inferSelect;
export type NewMap = typeof maps.$inferInsert;
