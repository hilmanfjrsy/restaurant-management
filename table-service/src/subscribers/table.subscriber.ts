import { initiateEventClient } from "../config/event";
import { deleteByPattern } from "../config/redis";
import { wsManager } from "../websocket/ws.manager";

export const tableSubscriber = async () => {
  const eventClient = await initiateEventClient();

  await eventClient.subscribe(
    async (event) => {
      wsManager.broadcast(JSON.stringify(event))
      await deleteByPattern("tables:*")
    },
    {
      exchange: "table.events",
      routingKey: "table.*",
      queue: "table.queue",
    }
  )
}
