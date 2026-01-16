import { jest } from "@jest/globals";

const get = jest.fn() as any;
get.mockResolvedValue(null);

const set = jest.fn() as any;
set.mockResolvedValue("OK");

const del = jest.fn() as any;
del.mockResolvedValue(1);

const scan = jest.fn() as any;
scan.mockResolvedValue(["0", []]);

const quit = jest.fn() as any;
quit.mockResolvedValue("OK");

export const mockRedisClient: any = {
  get,
  set,
  del,
  scan,
  quit,
  disconnect: jest.fn() as any,
};

export const setCachedValue = (key: string, value: any) => {
  mockRedisClient.get.mockImplementation((k: any) => {
    if (k === key) return Promise.resolve(JSON.stringify(value));
    return Promise.resolve(null);
  });
};

export const resetRedisMocks = () => {
  mockRedisClient.get.mockReset().mockResolvedValue(null);
  mockRedisClient.set.mockReset().mockResolvedValue("OK");
  mockRedisClient.del.mockReset().mockResolvedValue(1);
  mockRedisClient.scan.mockReset().mockResolvedValue(["0", []]);
};

export const deleteByPattern = (jest.fn() as any).mockResolvedValue(undefined);
