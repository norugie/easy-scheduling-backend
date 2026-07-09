import { drizzle } from "drizzle-orm/node-postgres";
import { Pool } from "pg";
import { dbConfig } from "../config/db.config.js";
import * as schema from "./schema.js";

export const pool = new Pool(dbConfig);
export const db = drizzle(pool, { schema });
