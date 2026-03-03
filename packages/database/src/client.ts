import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import * as schema from "./schema/index";

export function createDb(connectionString?: string) {
  const url = connectionString ?? process.env.DATABASE_URL ?? "postgresql://airfocus:airfocus@localhost:5432/airfocus";
  const client = postgres(url);
  return drizzle(client, { schema });
}

export type Database = ReturnType<typeof createDb>;
