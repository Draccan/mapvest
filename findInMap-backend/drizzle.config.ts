import { config } from "dotenv";
import { defineConfig } from "drizzle-kit";

config();

export default defineConfig({
    schema: "./src/db/schema.ts",
    out: "./drizzle",
    dialect: "postgresql",
    dbCredentials: {
        url: process.env.DATABASE_URL!,
    },
    verbose: true,
    strict: true,
    tablesFilter: [
        "!spatial_ref_sys",
        "!geography_columns",
        "!geometry_columns",
    ],
});
