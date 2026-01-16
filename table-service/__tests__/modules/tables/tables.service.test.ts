import { TablesService } from "../../../src/modules/tables/tables.service";
import { TablesRepository } from "../../../src/modules/tables/tables.repository";
import {
  mockRedisClient,
  resetRedisMocks,
  setCachedValue,
} from "../../mocks/redis.mock";
import { mockEventsClient, resetEventsMocks } from "../../mocks/events.mock";
import {
  mockTable,
  mockTables,
  mockTablesWithReservation,
  mockTableParams,
  mockTableId,
  createMockTable,
} from "../../fixtures/tables.fixtures";
import { TableStatus } from "../../../src/modules/tables/tables.interface";

jest.mock("../../../src/modules/tables/tables.repository");

describe("TablesService", () => {
  let service: TablesService;
  let mockRepository: jest.Mocked<TablesRepository>;

  beforeEach(() => {
    resetRedisMocks();
    resetEventsMocks();
    jest.clearAllMocks();

    mockRepository = new TablesRepository() as jest.Mocked<TablesRepository>;
    mockRepository.getTableById = jest.fn() as any;
    mockRepository.getTables = jest.fn() as any;
    mockRepository.updateTable = jest.fn() as any;
    mockRepository.bulkUpdateStatus = jest.fn() as any;

    service = new TablesService();
    (service as any).tablesRepository = mockRepository;
  });

  describe("getTableById", () => {
    it("should return cached table when available", async () => {
      setCachedValue(`tables:${mockTableId}`, mockTable);

      const result = await service.getTableById(mockTableId);

      expect(result).toEqual(JSON.parse(JSON.stringify(mockTable)));
      expect(mockRedisClient.get).toHaveBeenCalledWith(`tables:${mockTableId}`);
      expect(mockRepository.getTableById).not.toHaveBeenCalled();
    });

    it("should fetch from repository and cache when not in cache", async () => {
      mockRedisClient.get.mockResolvedValue(null);
      mockRepository.getTableById.mockResolvedValue(mockTable);

      const result = await service.getTableById(mockTableId);

      expect(result).toEqual(mockTable);
      expect(mockRepository.getTableById).toHaveBeenCalledWith(mockTableId);
      expect(mockRedisClient.set).toHaveBeenCalledWith(
        `tables:${mockTableId}`,
        JSON.stringify(mockTable)
      );
    });

    it("should return undefined when table not found", async () => {
      mockRedisClient.get.mockResolvedValue(null);
      mockRepository.getTableById.mockResolvedValue(undefined as any);

      const result = await service.getTableById("non-existent");

      expect(result).toBeUndefined();
    });

    it("should handle cache with different table ids", async () => {
      const table1 = createMockTable({ id: "id-1" });
      const table2 = createMockTable({ id: "id-2" });

      mockRedisClient.get.mockResolvedValue(null);
      mockRepository.getTableById.mockResolvedValueOnce(table1);

      await service.getTableById("id-1");

      expect(mockRedisClient.set).toHaveBeenCalledWith(
        "tables:id-1",
        JSON.stringify(table1)
      );
    });

    it("should cache undefined result", async () => {
      mockRedisClient.get.mockResolvedValue(null);
      mockRepository.getTableById.mockResolvedValue(undefined as any);

      await service.getTableById(mockTableId);

      expect(mockRedisClient.set).toHaveBeenCalled();
    });
  });

  describe("getTables", () => {
    it("should return cached tables when available", async () => {
      const cacheKey = `tables:${mockTableParams.date}:${mockTableParams.time}`;
      setCachedValue(cacheKey, mockTablesWithReservation);

      const result = await service.getTables(mockTableParams);

      expect(result).toEqual(JSON.parse(JSON.stringify(mockTablesWithReservation)));
      expect(mockRepository.getTables).not.toHaveBeenCalled();
    });

    it("should fetch from repository and cache when not in cache", async () => {
      mockRedisClient.get.mockResolvedValue(null);
      mockRepository.getTables.mockResolvedValue(mockTablesWithReservation);

      const result = await service.getTables(mockTableParams);

      expect(result).toEqual(mockTablesWithReservation);
      expect(mockRepository.getTables).toHaveBeenCalledWith(mockTableParams);
      expect(mockRedisClient.set).toHaveBeenCalled();
    });

    it("should generate correct cache key format", async () => {
      mockRedisClient.get.mockResolvedValue(null);
      mockRepository.getTables.mockResolvedValue([]);

      await service.getTables(mockTableParams);

      expect(mockRedisClient.get).toHaveBeenCalledWith(
        `tables:${mockTableParams.date}:${mockTableParams.time}`
      );
    });

    it("should cache empty result", async () => {
      mockRedisClient.get.mockResolvedValue(null);
      mockRepository.getTables.mockResolvedValue([]);

      const result = await service.getTables(mockTableParams);

      expect(result).toEqual([]);
      expect(mockRedisClient.set).toHaveBeenCalled();
    });

    it("should handle different date/time combinations", async () => {
      const params = { ...mockTableParams, date: "2024-02-20", time: "20:00:00" };
      mockRedisClient.get.mockResolvedValue(null);
      mockRepository.getTables.mockResolvedValue(mockTablesWithReservation);

      await service.getTables(params);

      expect(mockRedisClient.get).toHaveBeenCalledWith("tables:2024-02-20:20:00:00");
    });
  });

  describe("updateTable", () => {
    it("should throw error when table does not exist", async () => {
      mockRedisClient.get.mockResolvedValue(null);
      mockRepository.getTableById.mockResolvedValue(undefined as any);

      await expect(
        service.updateTable(mockTableId, { status: TableStatus.SEATED })
      ).rejects.toThrow("Table doesn't exists");
    });

    it("should update table when it exists", async () => {
      setCachedValue(`tables:${mockTableId}`, mockTable);
      const updatedTable = { ...mockTable, status: TableStatus.SEATED };
      mockRepository.updateTable.mockResolvedValue([updatedTable]);

      const result = await service.updateTable(mockTableId, {
        status: TableStatus.SEATED,
      });

      expect(result).toEqual([updatedTable]);
      expect(mockRepository.updateTable).toHaveBeenCalledWith(mockTableId, {
        status: TableStatus.SEATED,
      });
    });

    it("should update table when fetched from repository", async () => {
      mockRedisClient.get.mockResolvedValue(null);
      mockRepository.getTableById.mockResolvedValue(mockTable);
      const updatedTable = { ...mockTable, capacity: 8 };
      mockRepository.updateTable.mockResolvedValue([updatedTable]);

      const result = await service.updateTable(mockTableId, { capacity: 8 });

      expect(result).toEqual([updatedTable]);
    });

    it("should update with all fields", async () => {
      setCachedValue(`tables:${mockTableId}`, mockTable);
      const updates = {
        status: TableStatus.CLEANING,
        capacity: 6,
        location: "outdoor" as const,
        number: "10",
      };
      const updatedTable = { ...mockTable, ...updates };
      mockRepository.updateTable.mockResolvedValue([updatedTable]);

      const result = await service.updateTable(mockTableId, updates);

      expect(mockRepository.updateTable).toHaveBeenCalledWith(mockTableId, updates);
    });

    it("should update single field", async () => {
      setCachedValue(`tables:${mockTableId}`, mockTable);
      mockRepository.updateTable.mockResolvedValue([
        { ...mockTable, number: "99" },
      ]);

      await service.updateTable(mockTableId, { number: "99" });

      expect(mockRepository.updateTable).toHaveBeenCalledWith(mockTableId, {
        number: "99",
      });
    });
  });

  describe("bulkUpdateStatus", () => {
    it("should throw error for invalid status", async () => {
      const tableIds = [mockTableId];
      const invalidStatus = "invalid_status" as TableStatus;

      await expect(
        service.bulkUpdateStatus(tableIds, invalidStatus)
      ).rejects.toThrow("Invalid table status");
    });

    it("should publish event and update tables for valid status", async () => {
      const tableIds = [mockTableId];
      const updatedTables = [{ ...mockTable, status: TableStatus.SEATED }];
      mockRepository.bulkUpdateStatus.mockResolvedValue(updatedTables);

      const result = await service.bulkUpdateStatus(
        tableIds,
        TableStatus.SEATED
      );

      expect(mockEventsClient.publish).toHaveBeenCalledWith(
        expect.objectContaining({
          type: "table.status_changed",
          payload: { id: tableIds },
        }),
        {
          exchange: "table.events",
          routingKey: "table.status_changed",
        }
      );
      expect(result).toEqual(updatedTables);
    });

    it("should handle all valid TableStatus values", async () => {
      const tableIds = [mockTableId];
      mockRepository.bulkUpdateStatus.mockResolvedValue([mockTable]);

      for (const status of Object.values(TableStatus)) {
        await expect(
          service.bulkUpdateStatus(tableIds, status)
        ).resolves.not.toThrow();
      }
    });

    it("should handle empty array of tableIds", async () => {
      mockRepository.bulkUpdateStatus.mockResolvedValue([]);

      const result = await service.bulkUpdateStatus([], TableStatus.AVAILABLE);

      expect(mockEventsClient.publish).toHaveBeenCalled();
      expect(result).toEqual([]);
    });

    it("should publish event with correct payload structure", async () => {
      const tableIds = ["id-1", "id-2", "id-3"];
      mockRepository.bulkUpdateStatus.mockResolvedValue([]);

      await service.bulkUpdateStatus(tableIds, TableStatus.CLEANING);

      expect(mockEventsClient.publish).toHaveBeenCalledWith(
        expect.objectContaining({
          type: "table.status_changed",
          payload: { id: tableIds },
          timestamp: expect.any(String),
        }),
        expect.any(Object)
      );
    });

    it("should update to AVAILABLE status", async () => {
      const tableIds = [mockTableId];
      mockRepository.bulkUpdateStatus.mockResolvedValue([
        { ...mockTable, status: TableStatus.AVAILABLE },
      ]);

      const result = await service.bulkUpdateStatus(
        tableIds,
        TableStatus.AVAILABLE
      );

      expect(mockRepository.bulkUpdateStatus).toHaveBeenCalledWith(
        tableIds,
        TableStatus.AVAILABLE
      );
    });

    it("should update to RESERVED status", async () => {
      const tableIds = [mockTableId];
      mockRepository.bulkUpdateStatus.mockResolvedValue([
        { ...mockTable, status: TableStatus.RESERVED },
      ]);

      await service.bulkUpdateStatus(tableIds, TableStatus.RESERVED);

      expect(mockRepository.bulkUpdateStatus).toHaveBeenCalledWith(
        tableIds,
        TableStatus.RESERVED
      );
    });

    it("should update to SEATED status", async () => {
      const tableIds = [mockTableId];
      mockRepository.bulkUpdateStatus.mockResolvedValue([
        { ...mockTable, status: TableStatus.SEATED },
      ]);

      await service.bulkUpdateStatus(tableIds, TableStatus.SEATED);

      expect(mockRepository.bulkUpdateStatus).toHaveBeenCalledWith(
        tableIds,
        TableStatus.SEATED
      );
    });

    it("should update to CLEANING status", async () => {
      const tableIds = [mockTableId];
      mockRepository.bulkUpdateStatus.mockResolvedValue([
        { ...mockTable, status: TableStatus.CLEANING },
      ]);

      await service.bulkUpdateStatus(tableIds, TableStatus.CLEANING);

      expect(mockRepository.bulkUpdateStatus).toHaveBeenCalledWith(
        tableIds,
        TableStatus.CLEANING
      );
    });
  });

  describe("Error handling", () => {
    it("should handle repository error in getTableById", async () => {
      mockRedisClient.get.mockResolvedValue(null);
      mockRepository.getTableById.mockRejectedValue(new Error("DB Error"));

      await expect(service.getTableById(mockTableId)).rejects.toThrow(
        "DB Error"
      );
    });

    it("should handle repository error in getTables", async () => {
      mockRedisClient.get.mockResolvedValue(null);
      mockRepository.getTables.mockRejectedValue(new Error("DB Error"));

      await expect(service.getTables(mockTableParams)).rejects.toThrow(
        "DB Error"
      );
    });

    it("should handle repository error in updateTable", async () => {
      setCachedValue(`tables:${mockTableId}`, mockTable);
      mockRepository.updateTable.mockRejectedValue(new Error("Update Error"));

      await expect(
        service.updateTable(mockTableId, { status: TableStatus.SEATED })
      ).rejects.toThrow("Update Error");
    });

    it("should handle repository error in bulkUpdateStatus", async () => {
      mockRepository.bulkUpdateStatus.mockRejectedValue(
        new Error("Bulk Update Error")
      );

      await expect(
        service.bulkUpdateStatus([mockTableId], TableStatus.SEATED)
      ).rejects.toThrow("Bulk Update Error");
    });
  });
});
