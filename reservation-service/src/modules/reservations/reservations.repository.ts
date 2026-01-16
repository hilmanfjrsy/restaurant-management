import { db } from "../../config/db";
import { eq, and, reservationsTable, between, or, inArray } from "@restaurant-management/db";
import { IReservation, ReservationStatus } from "./reservations.interface";

export class ReservationsRepository {
  private db: typeof db;
  constructor() {
    this.db = db;
  }

  async createReservation(reservation: IReservation) {
    return await this.db.insert(reservationsTable).values(reservation).returning({ id: reservationsTable.id });
  }

  async checkAvailability(tableId: string, date: string, startTime: string, endTime: string) {
    const reservations = await this.db.select().from(reservationsTable)
      .where(and(
        eq(reservationsTable.tableId, tableId),
        eq(reservationsTable.status, ReservationStatus.CONFIRMED),
        eq(reservationsTable.date, date),
        or(
          between(reservationsTable.startTime, startTime, endTime),
          between(reservationsTable.endTime, startTime, endTime)
        )

      ))
    return reservations
  }

  async getReservationByIds(reservationIds: string[]) {
    const reservation = await this.db.select().from(reservationsTable)
      .where(inArray(reservationsTable.id, reservationIds))
    return reservation
  }

  async bulkUpdateReservation(reservationIds: string[], reservation: Partial<IReservation>) {
    return await this.db.update(reservationsTable).set(reservation).where(inArray(reservationsTable.id, reservationIds)).returning({ id: reservationsTable.id })
  }
}