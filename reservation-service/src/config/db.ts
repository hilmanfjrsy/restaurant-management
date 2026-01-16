import { createDBClient } from "@restaurant-management/db"
import { ENV } from "./env"

export const db = createDBClient({
  username: ENV.DATABASE_USERNAME,
  password: ENV.DATABASE_PASSWORD,
  host: ENV.DATABASE_HOST,
  port: ENV.DATABASE_PORT,
  database: ENV.DATABASE_NAME,
  useSsl: ENV.DATABASE_USE_SSL,
})