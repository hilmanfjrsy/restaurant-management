import { jest } from "@jest/globals";

export const createMockQueryBuilder = () => {
  let mockResult: any[] = [];

  const builder: any = {};

  builder.select = jest.fn().mockImplementation(() => builder);
  builder.from = jest.fn().mockImplementation(() => builder);
  builder.where = jest.fn().mockImplementation(() => builder);
  builder.limit = jest.fn().mockImplementation(() => builder);
  builder.offset = jest.fn().mockImplementation(() => builder);
  builder.orderBy = jest.fn().mockImplementation(() => builder);
  builder.leftJoin = jest.fn().mockImplementation(() => builder);
  builder.leftJoinLateral = jest.fn().mockImplementation(() => builder);
  builder.insert = jest.fn().mockImplementation(() => builder);
  builder.values = jest.fn().mockImplementation(() => builder);
  builder.update = jest.fn().mockImplementation(() => builder);
  builder.set = jest.fn().mockImplementation(() => builder);
  builder.returning = jest
    .fn()
    .mockImplementation(() => Promise.resolve(mockResult));
  builder.as = jest.fn().mockImplementation(() => builder);
  builder.then = (resolve: Function) => resolve(mockResult);
  builder._setResult = (result: any[]) => {
    mockResult = result;
  };
  builder._getResult = () => mockResult;

  return builder;
};

export const mockDb = createMockQueryBuilder();

export const createDBClient = jest.fn(() => mockDb);

export const eq = jest.fn((col, val) => ({ type: "eq", col, val }));
export const inArray = jest.fn((col, vals) => ({ type: "inArray", col, vals }));
export const and = jest.fn((...conditions) => ({ type: "and", conditions }));
export const or = jest.fn((...conditions) => ({ type: "or", conditions }));
export const between = jest.fn((col, min, max) => ({
  type: "between",
  col,
  min,
  max,
}));
export const asc = jest.fn((col) => ({ type: "asc", col }));
export const desc = jest.fn((col) => ({ type: "desc", col }));
export const sql = jest.fn((strings, ...values) => ({
  type: "sql",
  strings,
  values,
}));
export const lte = jest.fn((col, val) => ({ type: "lte", col, val }));
export const gte = jest.fn((col, val) => ({ type: "gte", col, val }));

export const tablesTable = {
  id: "tables.id",
  number: "tables.number",
  status: "tables.status",
  capacity: "tables.capacity",
  location: "tables.location",
};

export const reservationsTable = {
  id: "reservations.id",
  tableId: "reservations.tableId",
  customerId: "reservations.customerId",
  date: "reservations.date",
  startTime: "reservations.startTime",
  endTime: "reservations.endTime",
  partySize: "reservations.partySize",
  status: "reservations.status",
};

export const customersTable = {
  id: "customers.id",
  name: "customers.name",
  email: "customers.email",
  preferences: "customers.preferences",
};

export const resetDbMocks = () => {
  mockDb._setResult([]);
  Object.values(mockDb).forEach((method) => {
    if (jest.isMockFunction(method)) {
      method.mockClear();
    }
  });
};
