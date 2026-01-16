import { pgTable, uuid, varchar, integer, timestamp, index } from 'drizzle-orm/pg-core';

export const tablesTable = pgTable('tables', {
  id: uuid().defaultRandom().primaryKey(),
  number: varchar().notNull(),
  status: varchar({ enum: ['available', 'reserved', 'seated', 'cleaning'] }).notNull(),
  capacity: integer().default(2).notNull(),
  location: varchar({ enum: ['indoor', 'outdoor'] }).notNull(),
  createdAt: timestamp().defaultNow().notNull(),
}, (table) => ({
  numberIndex: index('table_number_index').on(table.number),
  capacityIndex: index('table_capacity_index').on(table.capacity),
  statusIndex: index('table_status_index').on(table.status),
}));