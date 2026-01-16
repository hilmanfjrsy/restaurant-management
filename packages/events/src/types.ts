import type { Channel, ChannelModel, ConsumeMessage } from "amqplib";

/**
 * Configuration options for the events client
 */
export interface EventsClientConfig {
  username: string;
  password: string;
  host: string;
  port: number;
  vhost?: string;
}

/**
 * Base event structure that all events must extend
 */
export interface BaseEvent<T extends string = string, P = unknown> {
  type: T;
  payload: P;
  timestamp: string;
  correlationId?: string;
}

/**
 * Event handler function type
 */
export type EventHandler<E extends BaseEvent> = (
  event: E,
  message: ConsumeMessage
) => Promise<void> | void;

/**
 * Publisher options for publishing events
 */
export interface PublishOptions {
  exchange: string;
  routingKey?: string;
  persistent?: boolean;
}

/**
 * Subscriber options for consuming events
 */
export interface SubscribeOptions {
  exchange: string;
  queue: string;
  routingKey?: string;
  exchangeType?: "direct" | "topic" | "fanout" | "headers";
  durable?: boolean;
  autoAck?: boolean;
}

/**
 * The events client instance returned by createEventsClient
 */
export interface EventsClient {
  connection: ChannelModel;
  channel: Channel;
  publish: <E extends BaseEvent>(
    event: E,
    options: PublishOptions
  ) => Promise<boolean>;
  subscribe: <E extends BaseEvent>(
    handler: EventHandler<E>,
    options: SubscribeOptions
  ) => Promise<void>;
  close: () => Promise<void>;
}

/**
 * Utility type for defining typed events
 */
export type DefineEvent<T extends string, P> = BaseEvent<T, P>;
