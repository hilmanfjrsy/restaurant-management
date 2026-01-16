import { Request, Response } from "express";
import {
  createMockRequest,
  createMockResponse,
} from "../../mocks/express.mock";
import { mockTablesWithReservation, mockTableParams } from "../../fixtures/tables.fixtures";
import { TableStatus } from "../../../src/modules/tables/tables.interface";

const mockGetTables = jest.fn();
const mockBulkUpdateStatus = jest.fn();

jest.mock("../../../src/modules/tables/tables.service", () => ({
  TablesService: jest.fn().mockImplementation(() => ({
    getTables: mockGetTables,
    bulkUpdateStatus: mockBulkUpdateStatus,
  })),
}));

import tablesRouter from "../../../src/modules/tables/tables.router";

describe("TablesRouter", () => {
  let getHandler: Function;
  let bulkStatusHandler: Function;

  beforeEach(() => {
    jest.clearAllMocks();

    const getRoute = tablesRouter.stack.find(
      (layer: any) => layer.route?.path === "/" && layer.route?.methods?.get
    );
    getHandler = getRoute?.route?.stack[0]?.handle as Function;

    const bulkStatusRoute = tablesRouter.stack.find(
      (layer: any) =>
        layer.route?.path === "/bulk-status" && layer.route?.methods?.patch
    );
    bulkStatusHandler = bulkStatusRoute?.route?.stack[0]?.handle as Function;
  });

  describe("GET /tables", () => {
    it("should return tables with default pagination", async () => {
      mockGetTables.mockResolvedValue(mockTablesWithReservation);
      const req = createMockRequest({ query: {} }) as Request;
      const res = createMockResponse();

      await getHandler(req, res);

      expect(mockGetTables).toHaveBeenCalledWith({
        page: 1,
        limit: 10,
        date: expect.any(String),
        time: expect.any(String),
      });
      expect(res.json).toHaveBeenCalledWith({
        status: "success",
        message: "Success",
        data: mockTablesWithReservation,
      });
    });

    it("should use query parameters when provided", async () => {
      mockGetTables.mockResolvedValue(mockTablesWithReservation);
      const req = createMockRequest({
        query: {
          page: "2",
          limit: "20",
          date: "2024-01-15",
          time: "18:00:00",
        },
      }) as Request;
      const res = createMockResponse();

      await getHandler(req, res);

      expect(mockGetTables).toHaveBeenCalledWith({
        page: 2,
        limit: 20,
        date: "2024-01-15",
        time: "18:00:00",
      });
    });

    it("should return 500 on service error", async () => {
      mockGetTables.mockRejectedValue(new Error("Database error"));
      const req = createMockRequest({ query: {} }) as Request;
      const res = createMockResponse();

      await getHandler(req, res);

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({
        status: "error",
        message: "Failed to get tables",
        data: null,
      });
    });

    it("should parse page as integer", async () => {
      mockGetTables.mockResolvedValue([]);
      const req = createMockRequest({
        query: { page: "5" },
      }) as Request;
      const res = createMockResponse();

      await getHandler(req, res);

      expect(mockGetTables).toHaveBeenCalledWith(
        expect.objectContaining({ page: 5 })
      );
    });

    it("should parse limit as integer", async () => {
      mockGetTables.mockResolvedValue([]);
      const req = createMockRequest({
        query: { limit: "25" },
      }) as Request;
      const res = createMockResponse();

      await getHandler(req, res);

      expect(mockGetTables).toHaveBeenCalledWith(
        expect.objectContaining({ limit: 25 })
      );
    });

    it("should handle empty result", async () => {
      mockGetTables.mockResolvedValue([]);
      const req = createMockRequest({ query: {} }) as Request;
      const res = createMockResponse();

      await getHandler(req, res);

      expect(res.json).toHaveBeenCalledWith({
        status: "success",
        message: "Success",
        data: [],
      });
    });

    it("should use current date when not provided", async () => {
      mockGetTables.mockResolvedValue([]);
      const req = createMockRequest({ query: {} }) as Request;
      const res = createMockResponse();

      await getHandler(req, res);

      const today = new Date().toISOString().split("T")[0];
      expect(mockGetTables).toHaveBeenCalledWith(
        expect.objectContaining({ date: today })
      );
    });
  });

  describe("PATCH /bulk-status", () => {
    it("should return 400 when tableIds is missing", async () => {
      const req = createMockRequest({
        body: { status: TableStatus.SEATED },
      }) as Request;
      const res = createMockResponse();

      await bulkStatusHandler(req, res);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({
        status: "error",
        message: "Table IDs are required and must be an array",
        data: null,
      });
    });

    it("should return 400 when tableIds is not an array", async () => {
      const req = createMockRequest({
        body: { tableIds: "single-id", status: TableStatus.SEATED },
      }) as Request;
      const res = createMockResponse();

      await bulkStatusHandler(req, res);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({
        status: "error",
        message: "Table IDs are required and must be an array",
        data: null,
      });
    });

    it("should return 400 when tableIds is null", async () => {
      const req = createMockRequest({
        body: { tableIds: null, status: TableStatus.SEATED },
      }) as Request;
      const res = createMockResponse();

      await bulkStatusHandler(req, res);

      expect(res.status).toHaveBeenCalledWith(400);
    });

    it("should return 400 when status is missing", async () => {
      const req = createMockRequest({
        body: { tableIds: ["id1", "id2"] },
      }) as Request;
      const res = createMockResponse();

      await bulkStatusHandler(req, res);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({
        status: "error",
        message: "Status is required",
        data: null,
      });
    });

    it("should update tables successfully", async () => {
      const tableIds = ["id1", "id2"];
      const updatedTables = mockTablesWithReservation.slice(0, 2);
      mockBulkUpdateStatus.mockResolvedValue(updatedTables);

      const req = createMockRequest({
        body: { tableIds, status: TableStatus.SEATED },
      }) as Request;
      const res = createMockResponse();

      await bulkStatusHandler(req, res);

      expect(mockBulkUpdateStatus).toHaveBeenCalledWith(
        tableIds,
        TableStatus.SEATED
      );
      expect(res.json).toHaveBeenCalledWith({
        status: "success",
        message: "Success",
        data: updatedTables,
      });
    });

    it("should return 500 on service error", async () => {
      mockBulkUpdateStatus.mockRejectedValue(new Error("Service error"));
      const req = createMockRequest({
        body: { tableIds: ["id1"], status: TableStatus.SEATED },
      }) as Request;
      const res = createMockResponse();

      await bulkStatusHandler(req, res);

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({
        status: "error",
        message: "Failed to update table statuses",
        data: null,
      });
    });

    it("should handle empty tableIds array", async () => {
      mockBulkUpdateStatus.mockResolvedValue([]);

      const req = createMockRequest({
        body: { tableIds: [], status: TableStatus.AVAILABLE },
      }) as Request;
      const res = createMockResponse();

      await bulkStatusHandler(req, res);

      expect(mockBulkUpdateStatus).toHaveBeenCalledWith(
        [],
        TableStatus.AVAILABLE
      );
      expect(res.json).toHaveBeenCalledWith({
        status: "success",
        message: "Success",
        data: [],
      });
    });

    it("should handle all valid status values", async () => {
      const tableIds = ["id1"];
      mockBulkUpdateStatus.mockResolvedValue([]);

      for (const status of Object.values(TableStatus)) {
        const req = createMockRequest({
          body: { tableIds, status },
        }) as Request;
        const res = createMockResponse();

        await bulkStatusHandler(req, res);

        expect(mockBulkUpdateStatus).toHaveBeenCalledWith(tableIds, status);
      }
    });

    it("should handle single table update", async () => {
      const tableIds = ["single-id"];
      mockBulkUpdateStatus.mockResolvedValue([mockTablesWithReservation[0]]);

      const req = createMockRequest({
        body: { tableIds, status: TableStatus.CLEANING },
      }) as Request;
      const res = createMockResponse();

      await bulkStatusHandler(req, res);

      expect(mockBulkUpdateStatus).toHaveBeenCalledWith(
        tableIds,
        TableStatus.CLEANING
      );
    });

    it("should handle multiple tables update", async () => {
      const tableIds = ["id1", "id2", "id3", "id4", "id5"];
      mockBulkUpdateStatus.mockResolvedValue(mockTablesWithReservation);

      const req = createMockRequest({
        body: { tableIds, status: TableStatus.RESERVED },
      }) as Request;
      const res = createMockResponse();

      await bulkStatusHandler(req, res);

      expect(mockBulkUpdateStatus).toHaveBeenCalledWith(
        tableIds,
        TableStatus.RESERVED
      );
    });
  });

  describe("Response structure validation", () => {
    it("GET /tables success response should have correct structure", async () => {
      mockGetTables.mockResolvedValue(mockTablesWithReservation);
      const req = createMockRequest({ query: {} }) as Request;
      const res = createMockResponse();

      await getHandler(req, res);

      const response = res._getData();
      expect(response).toHaveProperty("status", "success");
      expect(response).toHaveProperty("message", "Success");
      expect(response).toHaveProperty("data");
      expect(Array.isArray(response.data)).toBe(true);
    });

    it("GET /tables error response should have correct structure", async () => {
      mockGetTables.mockRejectedValue(new Error("Error"));
      const req = createMockRequest({ query: {} }) as Request;
      const res = createMockResponse();

      await getHandler(req, res);

      const response = res._getData();
      expect(response).toHaveProperty("status", "error");
      expect(response).toHaveProperty("message");
      expect(response).toHaveProperty("data", null);
    });

    it("PATCH /bulk-status success response should have correct structure", async () => {
      mockBulkUpdateStatus.mockResolvedValue(mockTablesWithReservation);
      const req = createMockRequest({
        body: { tableIds: ["id1"], status: TableStatus.SEATED },
      }) as Request;
      const res = createMockResponse();

      await bulkStatusHandler(req, res);

      const response = res._getData();
      expect(response).toHaveProperty("status", "success");
      expect(response).toHaveProperty("message", "Success");
      expect(response).toHaveProperty("data");
    });

    it("PATCH /bulk-status error response should have correct structure", async () => {
      const req = createMockRequest({
        body: { tableIds: "invalid", status: TableStatus.SEATED },
      }) as Request;
      const res = createMockResponse();

      await bulkStatusHandler(req, res);

      const response = res._getData();
      expect(response).toHaveProperty("status", "error");
      expect(response).toHaveProperty("message");
      expect(response).toHaveProperty("data", null);
    });
  });
});
