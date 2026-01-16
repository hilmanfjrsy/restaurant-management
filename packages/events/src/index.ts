export { createEventsClient } from "./client";

export type {
  EventsClientConfig,
  EventsClient,
  BaseEvent,
  EventHandler,
  PublishOptions,
  SubscribeOptions,
  DefineEvent,
} from "./types";

export { createPublisher } from "./publisher";
export { createSubscriber } from "./subscriber";

/**
 * Helper function to create a typed event
 *
 * @example
 * ```typescript
 * const event = createEvent('reservation.created', {
 *   reservationId: '123',
 *   tableId: '456',
 * });
 * ```
 */
export function createEvent<T extends string, P>(
  type: T,
  payload: P,
  correlationId?: string
): { type: T; payload: P; timestamp: string; correlationId?: string } {
  return {
    type,
    payload,
    timestamp: new Date().toISOString(),
    ...(correlationId && { correlationId }),
  };
}
