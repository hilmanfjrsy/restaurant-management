import { defineConfig } from "drizzle-kit";
import dotenv from "dotenv";

dotenv.config();

export default defineConfig({
  schema: './src/schemas/*',
  out: './drizzle/migrations',
  dialect: 'postgresql',
  dbCredentials: {
    user: process.env.DATABASE_USERNAME!,
    password: process.env.DATABASE_PASSWORD!,
    database: process.env.DATABASE_NAME!,
    host: process.env.DATABASE_HOST!,
    port: parseInt(process.env.DATABASE_PORT || "5432"),
    ssl: false
  }
})
