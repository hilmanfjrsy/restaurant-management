import { connect } from "amqplib";
import type { ChannelModel } from "amqplib";
import type { EventsClient, EventsClientConfig } from "./types";
import { createPublisher } from "./publisher";
import { createSubscriber } from "./subscriber";

/**
 * Creates a RabbitMQ events client
 *
 * @example
 * ```typescript
 * const eventsClient = await createEventsClient({
 *   username: 'guest',
 *   password: 'guest',
 *   host: 'localhost',
 *   port: 5672,
 * });
 * ```
 */
export async function createEventsClient({
  username,
  password,
  host,
  port,
  vhost = "/",
}: EventsClientConfig): Promise<EventsClient> {
  const connectionUrl = `amqp://${username}:${password}@${host}:${port}${vhost}`;

  const connection = (await connect(connectionUrl)) as ChannelModel;
  const channel = await connection.createChannel();

  const publish = createPublisher(channel);
  const subscribe = createSubscriber(channel);

  const close = async () => {
    await channel.close();
    await connection.close();
  };

  return {
    connection,
    channel,
    publish,
    subscribe,
    close,
  };
}
