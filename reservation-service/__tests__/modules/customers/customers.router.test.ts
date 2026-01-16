import { Request } from "express";
import {
  createMockRequest,
  createMockResponse,
} from "../../mocks/express.mock";
import { mockCustomers } from "../../fixtures/customers.fixtures";
import { jest } from "@jest/globals";

const mockGetCustomers: any = jest.fn();

jest.mock("../../../src/modules/customers/customers.service", () => ({
  CustomersService: jest.fn().mockImplementation(() => ({
    getCustomers: mockGetCustomers,
  })),
}));

import customersRouter from "../../../src/modules/customers/customers.router";

describe("CustomersRouter", () => {
  let getHandler: any;

  beforeEach(() => {
    jest.clearAllMocks();

    const getRoute = customersRouter.stack.find(
      (layer: any) => layer.route?.path === "/" && layer.route?.methods?.get
    );
    getHandler = getRoute?.route?.stack[0]?.handle;

    if (!getHandler) {
      throw new Error("GET /customers handler not found");
    }
  });

  describe("GET /customers", () => {
    it("should return customers with default pagination", async () => {
      mockGetCustomers.mockResolvedValue(mockCustomers as any);
      const req = createMockRequest({ query: {} }) as Request;
      const res = createMockResponse();

      await getHandler(req, res);

      expect(mockGetCustomers).toHaveBeenCalledWith({
        page: 1,
        limit: 10,
      });
      expect(res.json).toHaveBeenCalledWith({
        status: "success",
        message: "Success",
        data: mockCustomers,
      });
    });

    it("should use query parameters when provided", async () => {
      mockGetCustomers.mockResolvedValue(mockCustomers as any);
      const req = createMockRequest({
        query: { page: "2", limit: "5" },
      }) as Request;
      const res = createMockResponse();

      await getHandler(req, res);

      expect(mockGetCustomers).toHaveBeenCalledWith({
        page: 2,
        limit: 5,
      });
    });

    it("should return 500 on service error", async () => {
      mockGetCustomers.mockRejectedValue(new Error("Service error") as any);
      const req = createMockRequest({ query: {} }) as Request;
      const res = createMockResponse();

      await getHandler(req, res);

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({
        status: "error",
        message: "Failed to get customers",
        data: null,
      });
    });

    it("should parse page as integer", async () => {
      mockGetCustomers.mockResolvedValue([] as any);
      const req = createMockRequest({ query: { page: "5" } }) as Request;
      const res = createMockResponse();

      await getHandler(req, res);

      expect(mockGetCustomers).toHaveBeenCalledWith(
        expect.objectContaining({ page: 5 })
      );
    });

    it("should parse limit as integer", async () => {
      mockGetCustomers.mockResolvedValue([] as any);
      const req = createMockRequest({ query: { limit: "25" } }) as Request;
      const res = createMockResponse();

      await getHandler(req, res);

      expect(mockGetCustomers).toHaveBeenCalledWith(
        expect.objectContaining({ limit: 25 })
      );
    });

    it("should handle empty result", async () => {
      mockGetCustomers.mockResolvedValue([] as any);
      const req = createMockRequest({ query: {} }) as Request;
      const res = createMockResponse();

      await getHandler(req, res);

      expect(res.json).toHaveBeenCalledWith({
        status: "success",
        message: "Success",
        data: [],
      });
    });
  });
});
