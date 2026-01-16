import { drizzle } from "drizzle-orm/node-postgres";
import { Pool } from "pg";

export function createDBClient({
  username,
  password,
  host,
  port,
  database,
  useSsl,
}: {
  username: string;
  password: string;
  host: string;
  port: number;
  database: string;
  useSsl: boolean;
}) {
  return drizzle(new Pool({
    user: username,
    password: password,
    host: host,
    port: port,
    database: database,
    ssl: useSsl,
  }))
}

export * from "drizzle-orm"
export * from "./schemas/tables";
export * from "./schemas/reservations";
export * from "./schemas/customers";