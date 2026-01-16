import { pgTable, uuid, varchar, timestamp, index } from 'drizzle-orm/pg-core';

export const customersTable = pgTable('customers', {
  id: uuid().defaultRandom().primaryKey(),
  name: varchar().notNull(),
  email: varchar().notNull().unique(),
  preferences: varchar().default(''),
  createdAt: timestamp().defaultNow().notNull(),
}, (table) => ({
  emailIndex: index('customer_email_index').on(table.email),
}));