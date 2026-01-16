import Redis from "ioredis";
import { ENV } from "./env";

export const redisClient = new Redis({
  host: ENV.REDIS_HOST,
  port: ENV.REDIS_PORT,
  password: ENV.REDIS_PASSWORD,
})

export async function deleteByPattern(pattern: string) {
  let cursor = "0";

  do {
    const [nextCursor, keys] = await redisClient.scan(
      cursor,
      "MATCH",
      pattern,
      "COUNT",
      100
    );

    cursor = nextCursor;

    if (keys.length > 0) {
      await redisClient.del(...keys);
    }
  } while (cursor !== "0");
}
