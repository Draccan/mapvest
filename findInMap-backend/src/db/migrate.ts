import { drizzle } from "drizzle-orm/postgres-js";
import { migrate } from "drizzle-orm/postgres-js/migrator";
import postgres from "postgres";

// Warning: drizzle-kit migrate knows only how to generate metadata and to
// validate migrations, but we need to run the migrations ourselves here.
const runMigrations = async () => {
    const connectionString = process.env.DATABASE_URL!;

    const sql = postgres(connectionString, { max: 1 });
    const db = drizzle(sql);

    console.log("Running migrations...");
    await migrate(db, { migrationsFolder: "./drizzle" });
    console.log("Migrations completed!");

    await sql.end();
    process.exit(0);
};

runMigrations().catch((err) => {
    console.error("Migration failed!", err);
    process.exit(1);
});
