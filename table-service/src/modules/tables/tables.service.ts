import { ITable, ITableParams, TableStatus } from "./tables.interface";
import { TablesRepository } from "./tables.repository";
import { createEvent } from "@restaurant-management/events";
import { initiateEventClient } from "../../config/event";
import { redisClient } from "../../config/redis";

export class TablesService {
  private tablesRepository: TablesRepository;
  constructor() {
    this.tablesRepository = new TablesRepository();
  }

  async getTableById(id: string) {
    const key = `tables:${id}`
    const cachedTable = await redisClient.get(key)
    if (cachedTable) {
      return JSON.parse(cachedTable)
    }

    const table = await this.tablesRepository.getTableById(id);
    
    await redisClient.set(key, JSON.stringify(table))
    return table
  }

  async getTables(params: ITableParams) {
    const key = `tables:${params.date}:${params.time}`;
    const cachedTables = await redisClient.get(key);
    if (cachedTables) {
      return JSON.parse(cachedTables);
    }
    const tables = await this.tablesRepository.getTables(params);

    await redisClient.set(key, JSON.stringify(tables))
    return tables
  }

  async updateTable(id: string, table: Partial<ITable>) {
    const existingTable = await this.getTableById(id)
    if (!existingTable) throw new Error("Table doesn't exists")

    return await this.tablesRepository.updateTable(id, table);
  }

  async bulkUpdateStatus(tableIds: string[], status: TableStatus) {

    if (!Object.values(TableStatus).includes(status)) {
      throw new Error("Invalid table status")
    }
    const eventClient = await initiateEventClient();

    await eventClient.publish(
      createEvent("table.status_changed", { id: tableIds }),
      {
        exchange: "table.events",
        routingKey: "table.status_changed",
      }
    )
    return this.tablesRepository.bulkUpdateStatus(tableIds, status);
  }
}