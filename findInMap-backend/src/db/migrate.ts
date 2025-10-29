import { drizzle } from "drizzle-orm/postgres-js";
import { migrate } from "drizzle-orm/postgres-js/migrator";
import postgres from "postgres";
import * as fs from "fs";
import * as path from "path";

// Warning: drizzle-kit migrate knows only how to generate metadata and to
// validate migrations, but we need to run the migrations ourselves here.
const runMigrations = async () => {
    console.log("Migration Script Started");

    const connectionString = process.env.DATABASE_URL;

    if (!connectionString) {
        console.error("ERROR: DATABASE_URL environment variable is not set!");
        process.exit(1);
    }

    console.log("Database connection string found");

    // Check migrations folder
    const migrationsFolder = path.join(process.cwd(), "drizzle");
    console.log(`Migrations folder: ${migrationsFolder}`);

    if (!fs.existsSync(migrationsFolder)) {
        console.error("ERROR: Migrations folder does not exist!");
        process.exit(1);
    }

    const migrationFiles = fs
        .readdirSync(migrationsFolder)
        .filter((f) => f.endsWith(".sql"))
        .sort();
    console.log(
        `Found ${migrationFiles.length} migration files:`,
        migrationFiles,
    );

    if (migrationFiles.length === 0) {
        console.warn("WARNING: No migration files found!");
        process.exit(0);
    }

    const sql = postgres(connectionString, { max: 1 });
    const db = drizzle(sql);

    console.log("\n Running migrations...");

    try {
        await migrate(db, { migrationsFolder: "./drizzle" });
        console.log("Migrations completed successfully!");
    } catch (error) {
        console.error("Migration failed with error:", error);
        await sql.end();
        throw error;
    }

    try {
        const result =
            await sql`SELECT COUNT(*) as count FROM drizzle.__drizzle_migrations`;
        console.log(`Total migrations in database: ${result[0].count}`);

        if (result[0].count < migrationFiles.length) {
            console.warn(
                `WARNING: Expected ${migrationFiles.length} migrations but found ${result[0].count} in database!`,
            );
        }
    } catch (error) {
        console.warn("Could not verify migration count:", error);
    }

    await sql.end();
    console.log("Migration Script Completed \n");
    process.exit(0);
};

runMigrations().catch((err) => {
    console.error("\n FATAL ERROR:", err);
    process.exit(1);
});
