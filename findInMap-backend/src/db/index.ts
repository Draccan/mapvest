import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";

import config from "../main/config";
import * as schema from "./schema";

const connectionString = config.databaseUrl;
const client = postgres(connectionString);

export const db = drizzle(client, { schema });

export { client };
