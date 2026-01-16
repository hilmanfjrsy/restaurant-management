import { db } from "../../config/db";
import { tablesTable, eq, inArray, reservationsTable, asc, and, sql, lte, gte } from "@restaurant-management/db";
import { ITable, ITableParams, TableStatus } from "./tables.interface";

export class TablesRepository {
  private db: typeof db;
  constructor() {
    this.db = db;
  }

  async getTableById(id: string) {
    const tables = await this.db.select().from(tablesTable).where(eq(tablesTable.id, id)).limit(1);
    return tables[0];
  }

  async getTables(params: ITableParams) {
    const subQuery = this.db.select().from(reservationsTable).where(
      and(
        eq(reservationsTable.tableId, tablesTable.id),
        eq(reservationsTable.date, params.date),
        eq(reservationsTable.status, 'confirmed'),
        and(
          lte(reservationsTable.startTime, params.time),
          gte(reservationsTable.endTime, params.time)
        )
      )
    ).as("reservations")
    const tables =  await this.db.select({
      id: tablesTable.id,
      number: tablesTable.number,
      status: tablesTable.status,
      capacity: tablesTable.capacity,
      location: tablesTable.location,
      reservation: {
        id: reservationsTable.id,
        tableId: reservationsTable.tableId,
        customerId: reservationsTable.customerId,
        date: reservationsTable.date,
        startTime: reservationsTable.startTime,
        endTime: reservationsTable.endTime,
        status: reservationsTable.status
      }
    }).from(tablesTable)
    .leftJoinLateral(subQuery, sql`true`)
    .limit(params.limit).offset((params.page - 1) * params.limit)
    .orderBy(asc(tablesTable.number));
    return tables.map((t) => {
      return {
        ...t,
        status: t.reservation ? 'reserved' : t.status,
      }
    })
  }

  async updateTable(id: string, table: Partial<ITable>) {
    return await this.db.update(tablesTable).set(table).where(eq(tablesTable.id, id)).returning();
  }

  async bulkUpdateStatus(tableIds: string[], status: TableStatus) {
    return await this.db.update(tablesTable).set({ status }).where(inArray(tablesTable.id, tableIds)).returning();
  }
}