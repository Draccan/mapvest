import { PgTransaction } from "drizzle-orm/pg-core";
import { PostgresJsQueryResultHKT } from "drizzle-orm/postgres-js";

import { db } from "../../db";

type DbOrTransaction =
    | typeof db
    | PgTransaction<
          PostgresJsQueryResultHKT,
          typeof import("../../db/schema"),
          any
      >;

export default DbOrTransaction;
