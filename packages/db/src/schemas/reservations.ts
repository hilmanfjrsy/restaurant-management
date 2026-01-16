import { pgTable, uuid, varchar, integer, timestamp, time, date, index } from 'drizzle-orm/pg-core';
import { tablesTable } from './tables';
import { customersTable } from './customers';

export const reservationsTable = pgTable('reservations', {
  id: uuid().defaultRandom().primaryKey(),
  tableId: uuid().notNull().references(() => tablesTable.id),
  customerId: uuid().notNull().references(() => customersTable.id),
  date: date().notNull(),
  startTime: time().notNull(),
  endTime: time().notNull(),
  partySize: integer().default(2).notNull(),
  status: varchar({ enum: ['confirmed', 'cancelled', 'completed'] }).notNull(),
  createdAt: timestamp().defaultNow().notNull(),
}, (table) => ({
  tableIdIndex: index('reservation_table_id_index').on(table.tableId),
  customerIdIndex: index('reservation_customer_id_index').on(table.customerId),
  partySizeIndex: index('reservation_party_size_index').on(table.partySize),
  statusIndex: index('reservation_status_index').on(table.status),
}));