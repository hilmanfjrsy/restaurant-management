import type { Channel, ConsumeMessage } from "amqplib";
import type { BaseEvent, EventHandler, SubscribeOptions } from "./types";

/**
 * Creates a subscriber function bound to a channel
 */
export function createSubscriber(channel: Channel) {
  return async function subscribe<E extends BaseEvent>(
    handler: EventHandler<E>,
    options: SubscribeOptions
  ): Promise<void> {
    const {
      exchange,
      queue,
      routingKey = "#",
      exchangeType = "topic",
      durable = true,
      autoAck = false,
    } = options;

    await channel.assertExchange(exchange, exchangeType, { durable });
    await channel.assertQueue(queue, { durable });
    await channel.bindQueue(queue, exchange, routingKey);
    await channel.prefetch(1);

    await channel.consume(
      queue,
      async (msg: ConsumeMessage | null) => {
        if (!msg) return;

        try {
          const event = JSON.parse(msg.content.toString()) as E;
          await handler(event, msg);

          if (!autoAck) {
            channel.ack(msg);
          }
        } catch (error) {
          console.error("Error processing message:", error);
          channel.nack(msg, false, false);
        }
      },
      { noAck: autoAck }
    );
  };
}
