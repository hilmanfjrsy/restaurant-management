import { resetDbMocks } from "./mocks/db.mock";
import { resetRedisMocks } from "./mocks/redis.mock";
import { resetEventsMocks } from "./mocks/events.mock";

jest.mock("../src/config/db", () => ({
  db: require("./mocks/db.mock").mockDb,
}));

jest.mock("../src/config/redis", () => ({
  redisClient: require("./mocks/redis.mock").mockRedisClient,
  deleteByPattern: require("./mocks/redis.mock").deleteByPattern,
}));

jest.mock("../src/config/event", () => ({
  initiateEventClient: jest
    .fn()
    .mockResolvedValue(require("./mocks/events.mock").mockEventsClient),
}));

beforeEach(() => {
  resetDbMocks();
  resetRedisMocks();
  resetEventsMocks();
  jest.clearAllMocks();
});

afterAll(async () => {
  jest.resetModules();
});
