import { jest } from "@jest/globals";

const j: any = jest;

export const mockEventsClient: any = {
  connection: {} as any,
  channel: {} as any,
  publish: j.fn().mockResolvedValue(true),
  subscribe: j.fn().mockResolvedValue(undefined),
  close: j.fn().mockResolvedValue(undefined),
};

export const createEventsClient = j.fn().mockResolvedValue(mockEventsClient);

export const createEvent = j.fn(
  (type: string, payload: any, correlationId?: string) => ({
    type,
    payload,
    timestamp: new Date().toISOString(),
    ...(correlationId && { correlationId }),
  })
);

export const resetEventsMocks = () => {
  mockEventsClient.publish.mockReset().mockResolvedValue(true);
  mockEventsClient.subscribe.mockReset().mockResolvedValue(undefined);
  mockEventsClient.close.mockReset().mockResolvedValue(undefined);
  createEventsClient.mockReset().mockResolvedValue(mockEventsClient);
  createEvent
    .mockReset()
    .mockImplementation((type: string, payload: any, correlationId?: string) => ({
    type,
    payload,
    timestamp: new Date().toISOString(),
    ...(correlationId && { correlationId }),
    }));
};
