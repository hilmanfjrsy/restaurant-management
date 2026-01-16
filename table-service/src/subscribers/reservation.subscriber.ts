import { initiateEventClient } from "../config/event";
import { TablesRepository } from "../modules/tables/tables.repository";
import { TableStatus } from "../modules/tables/tables.interface";
import { createEvent } from "@restaurant-management/events";
import { deleteByPattern } from "../config/redis";

interface ReservationPayload {
  id: string;
  tableId: string;
  customerId: string;
}

export const reservationSubscriber = async () => {
  const eventClient = await initiateEventClient();
  const tablesRepository = new TablesRepository();

  await eventClient.subscribe(
    async (event) => {
      const payload = event.payload as ReservationPayload;
      switch (event.type) {
        case "reservation.cancelled":
          await tablesRepository.updateTable(payload.tableId, { status: TableStatus.AVAILABLE });
          break;
        case "reservation.completed":
          await tablesRepository.updateTable(payload.tableId, { status: TableStatus.SEATED });
          break;
      }

      await deleteByPattern("reservations:")
      await eventClient.publish(
        createEvent("table.status_changed", { id: payload.tableId }),
        {
          exchange: "table.events",
          routingKey: "table.status_changed",
        }
      )
    },
    {
      exchange: "reservation.events",
      routingKey: "reservation.*",
      queue: "reservation.queue",
    }
  )
}
