import { reservationSubscriber } from "./reservation.subscriber"
import { tableSubscriber } from "./table.subscriber"

export const startEventSubscriber = async () => {
  await reservationSubscriber()
  await tableSubscriber()
  console.log("Event subscriber started")
}