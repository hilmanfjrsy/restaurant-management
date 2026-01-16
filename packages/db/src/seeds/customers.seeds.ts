
import dotenv from 'dotenv';
import { createDBClient, customersTable } from '../client';

dotenv.config();

export async function seedCustomers() {
  const db = createDBClient({
    username: process.env.DATABASE_USERNAME!,
    password: process.env.DATABASE_PASSWORD!,
    database: process.env.DATABASE_NAME!,
    host: process.env.DATABASE_HOST!,
    port: parseInt(process.env.DATABASE_PORT || "5432"),
    useSsl: false,
  });

  await db.insert(customersTable).values([
    {
      name: 'John Doe',
      email: 'john.doe@example.com',
      preferences: "Vegetarian",
    },
    {
      name: 'Jane Smith',
      email: 'jane.smith@example.com',
      preferences: "Vegan",
    },
    {
      name: 'Alice Johnson',
      email: 'alice.jhonson@example.com',
      preferences: "Gluten-free",
    }
  ]);
}