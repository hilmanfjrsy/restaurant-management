import { TablesRepository } from "../../../src/modules/tables/tables.repository";
import { mockDb } from "../../mocks/db.mock";
import {
  mockTable,
  mockTables,
  mockTableParams,
  mockTableId,
  createMockTable,
} from "../../fixtures/tables.fixtures";
import {
  sqlInjectionPayloadsArray,
  maliciousDateInputs,
  maliciousTimeInputs,
  maliciousIdInputs,
} from "../../fixtures/security.fixtures";
import { TableStatus } from "../../../src/modules/tables/tables.interface";

describe("TablesRepository", () => {
  let repository: TablesRepository;

  beforeEach(() => {
    repository = new TablesRepository();
  });

  describe("getTableById", () => {
    it("should return a table when found", async () => {
      mockDb._setResult([mockTable]);

      const result = await repository.getTableById(mockTableId);

      expect(result).toEqual(mockTable);
      expect(mockDb.select).toHaveBeenCalled();
      expect(mockDb.from).toHaveBeenCalled();
      expect(mockDb.where).toHaveBeenCalled();
      expect(mockDb.limit).toHaveBeenCalledWith(1);
    });

    it("should return undefined when table not found", async () => {
      mockDb._setResult([]);

      const result = await repository.getTableById("non-existent-id");

      expect(result).toBeUndefined();
    });

    it("should handle empty string id", async () => {
      mockDb._setResult([]);

      const result = await repository.getTableById("");

      expect(result).toBeUndefined();
      expect(mockDb.where).toHaveBeenCalled();
    });
  });

  describe("getTables", () => {
    it("should return tables with pagination", async () => {
      const tablesWithReservations = mockTables.map((t) => ({
        ...t,
        reservation: null,
      }));
      mockDb._setResult(tablesWithReservations);

      const result = await repository.getTables(mockTableParams);

      expect(result).toHaveLength(mockTables.length);
      expect(mockDb.select).toHaveBeenCalled();
      expect(mockDb.limit).toHaveBeenCalledWith(mockTableParams.limit);
      expect(mockDb.offset).toHaveBeenCalledWith(0);
    });

    it("should calculate correct offset for page 2", async () => {
      mockDb._setResult([]);
      const params = { ...mockTableParams, page: 2 };

      await repository.getTables(params);

      expect(mockDb.offset).toHaveBeenCalledWith(10);
    });

    it("should calculate correct offset for page 3 with limit 5", async () => {
      mockDb._setResult([]);
      const params = { ...mockTableParams, page: 3, limit: 5 };

      await repository.getTables(params);

      expect(mockDb.offset).toHaveBeenCalledWith(10);
    });

    it("should mark table as reserved when it has a reservation", async () => {
      const tableWithReservation = {
        ...mockTable,
        reservation: { id: "res-1", tableId: mockTableId },
      };
      mockDb._setResult([tableWithReservation]);

      const result = await repository.getTables(mockTableParams);

      expect(result[0].status).toBe("reserved");
    });

    it("should keep original status when no reservation exists", async () => {
      mockDb._setResult([{ ...mockTable, reservation: null }]);

      const result = await repository.getTables(mockTableParams);

      expect(result[0].status).toBe(TableStatus.AVAILABLE);
    });

    it("should return empty array when no tables found", async () => {
      mockDb._setResult([]);

      const result = await repository.getTables(mockTableParams);

      expect(result).toEqual([]);
    });

    it("should handle large dataset", async () => {
      const largeTables = Array.from({ length: 100 }, (_, i) => ({
        ...mockTable,
        id: `table-${i}`,
        number: `${i}`,
        reservation: null,
      }));
      mockDb._setResult(largeTables);

      const result = await repository.getTables({
        ...mockTableParams,
        limit: 100,
      });

      expect(result).toHaveLength(100);
    });

    it("should handle page 1 with offset 0", async () => {
      mockDb._setResult([]);
      const params = { ...mockTableParams, page: 1 };

      await repository.getTables(params);

      expect(mockDb.offset).toHaveBeenCalledWith(0);
    });
  });

  describe("updateTable", () => {
    it("should update table and return updated record", async () => {
      const updatedTable = { ...mockTable, status: TableStatus.CLEANING };
      mockDb._setResult([updatedTable]);

      const result = await repository.updateTable(mockTableId, {
        status: TableStatus.CLEANING,
      });

      expect(result).toEqual([updatedTable]);
      expect(mockDb.update).toHaveBeenCalled();
      expect(mockDb.set).toHaveBeenCalledWith({ status: TableStatus.CLEANING });
      expect(mockDb.returning).toHaveBeenCalled();
    });

    it("should update table with partial data", async () => {
      const updatedTable = { ...mockTable, capacity: 6 };
      mockDb._setResult([updatedTable]);

      const result = await repository.updateTable(mockTableId, { capacity: 6 });

      expect(result).toEqual([updatedTable]);
      expect(mockDb.set).toHaveBeenCalledWith({ capacity: 6 });
    });

    it("should update table location", async () => {
      const updatedTable = { ...mockTable, location: "outdoor" as const };
      mockDb._setResult([updatedTable]);

      const result = await repository.updateTable(mockTableId, {
        location: "outdoor",
      });

      expect(result).toEqual([updatedTable]);
    });

    it("should handle update with empty object", async () => {
      mockDb._setResult([mockTable]);

      const result = await repository.updateTable(mockTableId, {});

      expect(mockDb.set).toHaveBeenCalledWith({});
    });

    it("should update multiple fields at once", async () => {
      const updates = {
        status: TableStatus.SEATED,
        capacity: 8,
      };
      const updatedTable = { ...mockTable, ...updates };
      mockDb._setResult([updatedTable]);

      const result = await repository.updateTable(mockTableId, updates);

      expect(mockDb.set).toHaveBeenCalledWith(updates);
    });
  });

  describe("bulkUpdateStatus", () => {
    it("should update multiple tables status", async () => {
      const tableIds = [mockTables[0].id, mockTables[1].id];
      const updatedTables = tableIds.map((id) => ({
        id,
        status: TableStatus.SEATED,
      }));
      mockDb._setResult(updatedTables);

      const result = await repository.bulkUpdateStatus(
        tableIds,
        TableStatus.SEATED
      );

      expect(result).toEqual(updatedTables);
      expect(mockDb.update).toHaveBeenCalled();
      expect(mockDb.set).toHaveBeenCalledWith({ status: TableStatus.SEATED });
    });

    it("should handle empty array of table IDs", async () => {
      mockDb._setResult([]);

      const result = await repository.bulkUpdateStatus(
        [],
        TableStatus.AVAILABLE
      );

      expect(result).toEqual([]);
    });

    it("should handle single table ID", async () => {
      const updatedTable = { id: mockTableId, status: TableStatus.CLEANING };
      mockDb._setResult([updatedTable]);

      const result = await repository.bulkUpdateStatus(
        [mockTableId],
        TableStatus.CLEANING
      );

      expect(result).toEqual([updatedTable]);
    });

    it("should update to all valid status values", async () => {
      const tableIds = [mockTableId];

      for (const status of Object.values(TableStatus)) {
        mockDb._setResult([{ id: mockTableId, status }]);

        const result = await repository.bulkUpdateStatus(tableIds, status);

        expect(result[0].status).toBe(status);
      }
    });
  });

  describe("SQL Injection Prevention", () => {
    describe("getTableById", () => {
      it.each(sqlInjectionPayloadsArray)(
        "should safely handle malicious id: %s",
        async (maliciousId) => {
          mockDb._setResult([]);

          const result = await repository.getTableById(maliciousId);

          expect(result).toBeUndefined();
          expect(mockDb.where).toHaveBeenCalled();
        }
      );

      it.each(maliciousIdInputs)(
        "should not execute injection in id parameter: %s",
        async (maliciousId) => {
          mockDb._setResult([]);

          await repository.getTableById(maliciousId);

          expect(mockDb.where).toHaveBeenCalled();
          expect(mockDb.select).toHaveBeenCalled();
        }
      );
    });

    describe("getTables", () => {
      it.each(maliciousDateInputs)(
        "should safely handle malicious date: %s",
        async (maliciousDate) => {
          mockDb._setResult([]);

          await repository.getTables({
            ...mockTableParams,
            date: maliciousDate,
          });

          expect(mockDb.select).toHaveBeenCalled();
        }
      );

      it.each(maliciousTimeInputs)(
        "should safely handle malicious time: %s",
        async (maliciousTime) => {
          mockDb._setResult([]);

          await repository.getTables({
            ...mockTableParams,
            time: maliciousTime,
          });

          expect(mockDb.select).toHaveBeenCalled();
        }
      );

      it("should handle injection in both date and time", async () => {
        mockDb._setResult([]);

        await repository.getTables({
          page: 1,
          limit: 10,
          date: "'; DROP TABLE tables; --",
          time: "18:00:00 OR 1=1",
        });

        expect(mockDb.select).toHaveBeenCalled();
      });
    });

    describe("bulkUpdateStatus", () => {
      it("should safely handle injection in tableIds array", async () => {
        const maliciousIds = [
          "valid-uuid",
          "'; DROP TABLE tables; --",
          "1 OR 1=1",
        ];
        mockDb._setResult([]);

        await repository.bulkUpdateStatus(maliciousIds, TableStatus.AVAILABLE);

        expect(mockDb.where).toHaveBeenCalled();
        expect(mockDb.update).toHaveBeenCalled();
      });

      it.each(sqlInjectionPayloadsArray)(
        "should handle malicious id in array: %s",
        async (maliciousId) => {
          mockDb._setResult([]);

          await repository.bulkUpdateStatus(
            [maliciousId],
            TableStatus.AVAILABLE
          );

          expect(mockDb.where).toHaveBeenCalled();
        }
      );
    });

    describe("updateTable", () => {
      it.each(sqlInjectionPayloadsArray)(
        "should safely handle malicious id in update: %s",
        async (maliciousId) => {
          mockDb._setResult([]);

          await repository.updateTable(maliciousId, {
            status: TableStatus.SEATED,
          });

          expect(mockDb.where).toHaveBeenCalled();
        }
      );

      it("should handle malicious data in update payload", async () => {
        mockDb._setResult([]);

        await repository.updateTable(mockTableId, {
          number: "'; DROP TABLE tables; --",
        });

        expect(mockDb.set).toHaveBeenCalledWith({
          number: "'; DROP TABLE tables; --",
        });
      });
    });
  });
});
