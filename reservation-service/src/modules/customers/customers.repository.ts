import { customersTable, eq } from "@restaurant-management/db";
import { db } from "../../config/db";
import { ICustomerPagination } from "./customers.interface";


export class CustomersRepository {
  private db: typeof db;
  constructor() {
    this.db = db;
  }

  async getCustomerById(id: string) {
    const customers = await this.db.select().from(customersTable).where(eq(customersTable.id, id)).limit(1);
    return customers[0];
  }

  async getCustomers(pagination: ICustomerPagination) {
    return await this.db.select().from(customersTable).limit(pagination.limit).offset((pagination.page - 1) * pagination.limit);
  }
}