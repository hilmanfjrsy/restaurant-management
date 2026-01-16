import {
  ITable,
  ITableParams,
  TableStatus,
} from "../../src/modules/tables/tables.interface";

export const mockTableId = "a1b2c3d4-e5f6-7890-abcd-ef1234567890";

export const mockTable: ITable & { id: string; createdAt: Date } = {
  id: mockTableId,
  number: "1",
  status: TableStatus.AVAILABLE,
  capacity: 4,
  location: "indoor",
  createdAt: new Date("2024-01-15T10:00:00Z"),
};

export const mockTables = [
  { ...mockTable },
  {
    ...mockTable,
    id: "b2c3d4e5-f6g7-8901-bcde-f12345678901",
    number: "2",
    capacity: 2,
  },
  {
    ...mockTable,
    id: "c3d4e5f6-g7h8-9012-cdef-123456789012",
    number: "3",
    capacity: 6,
    location: "outdoor" as const,
  },
];

export const mockTableWithReservation = {
  ...mockTable,
  status: "reserved" as const,
  reservation: {
    id: "res-1234",
    tableId: mockTableId,
    customerId: "cust-1234",
    date: "2024-01-15",
    startTime: "18:00:00",
    endTime: "20:00:00",
    status: "confirmed" as const,
  },
};

export const mockTablesWithReservation = [
  { ...mockTable, reservation: null },
  {
    ...mockTable,
    id: "b2c3d4e5-f6g7-8901-bcde-f12345678901",
    number: "2",
    capacity: 2,
    reservation: null,
  },
  {
    ...mockTable,
    id: "c3d4e5f6-g7h8-9012-cdef-123456789012",
    number: "3",
    capacity: 6,
    location: "outdoor" as const,
    reservation: {
      id: "res-5678",
      tableId: "c3d4e5f6-g7h8-9012-cdef-123456789012",
      customerId: "cust-5678",
      date: "2024-01-15",
      startTime: "19:00:00",
      endTime: "21:00:00",
      status: "confirmed" as const,
    },
  },
];

export const mockTableParams: ITableParams = {
  page: 1,
  limit: 10,
  date: "2024-01-15",
  time: "18:00:00",
};

export const createMockTable = (
  overrides: Partial<ITable & { id: string; createdAt: Date }> = {}
): ITable & { id: string; createdAt: Date } => ({
  ...mockTable,
  ...overrides,
});
