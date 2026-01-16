
import dotenv from 'dotenv';
import { tablesTable } from '../schemas/tables';
import { createDBClient } from '../client';

dotenv.config();

export async function seedTables() {
  const db = createDBClient({
    username: process.env.DATABASE_USERNAME!,
    password: process.env.DATABASE_PASSWORD!,
    database: process.env.DATABASE_NAME!,
    host: process.env.DATABASE_HOST!,
    port: parseInt(process.env.DATABASE_PORT || "5432"),
    useSsl: false,
  });
  await db.insert(tablesTable).values([
    {
      number: 'T1',
      status: 'available',
      capacity: 4,
      location: 'indoor',
    },
    {
      number: 'T2',
      status: 'available',
      capacity: 4,
      location: 'indoor',
    },
    {
      number: 'T3',
      status: 'available',
      capacity: 2,
      location: 'indoor',
    },
    {
      number: 'T4',
      status: 'available',
      capacity: 4,
      location: 'indoor',
    },
    {
      number: 'T5',
      status: 'available',
      capacity: 2,
      location: 'indoor',
    },
    {
      number: 'T6',
      status: 'available',
      capacity: 4,
      location: 'indoor',
    },
    {
      number: 'T7',
      status: 'available',
      capacity: 2,
      location: 'indoor',
    },
    {
      number: 'T8',
      status: 'available',
      capacity: 4,
      location: 'indoor',
    },
    {
      number: 'T9',
      status: 'available',
      capacity: 4,
      location: 'indoor',
    },
    {
      number: 'T10',
      status: 'available',
      capacity: 2,
      location: 'indoor',
    },
    {
      number: 'T11',
      status: 'available',
      capacity: 4,
      location: 'outdoor',
    },
    {
      number: 'T12',
      status: 'available',
      capacity: 2,
      location: 'outdoor',
    },
    {
      number: 'T13',
      status: 'available',
      capacity: 4,
      location: 'outdoor',
    },
    {
      number: 'T14',
      status: 'available',
      capacity: 4,
      location: 'outdoor',
    },
    {
      number: 'T15',
      status: 'available',
      capacity: 2,
      location: 'outdoor',
    },
    {
      number: 'T16',
      status: 'available',
      capacity: 4,
      location: 'outdoor',
    },
    {
      number: 'T17',
      status: 'available',
      capacity: 2,
      location: 'outdoor',
    },
    {
      number: 'T18',
      status: 'available',
      capacity: 4,
      location: 'outdoor',
    },
    {
      number: 'T19',
      status: 'available',
      capacity: 4,
      location: 'outdoor',
    },
    {
      number: 'T20',
      status: 'available',
      capacity: 2,
      location: 'outdoor',
    }
  ]);
}