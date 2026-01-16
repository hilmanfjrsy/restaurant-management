import { createEventsClient } from "@restaurant-management/events"
import { ENV } from "./env"

export const initiateEventClient = async () => {
  const eventClient = await createEventsClient({
    username: ENV.EVENT_USERNAME,
    password: ENV.EVENT_PASSWORD,
    host: ENV.EVENT_HOST,
    port: ENV.EVENT_PORT,
  })

  return eventClient
}