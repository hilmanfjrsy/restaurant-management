import type { Channel } from "amqplib";
import type { BaseEvent, PublishOptions } from "./types";

/**
 * Creates a publisher function bound to a channel
 */
export function createPublisher(channel: Channel) {
  return async function publish<E extends BaseEvent>(
    event: E,
    options: PublishOptions
  ): Promise<boolean> {
    const { exchange, routingKey = "", persistent = true } = options;

    await channel.assertExchange(exchange, "topic", { durable: true });

    const message = Buffer.from(JSON.stringify(event));

    return channel.publish(exchange, routingKey, message, {
      persistent,
      contentType: "application/json",
      timestamp: Date.now(),
    });
  };
}
