import { CustomersRepository } from "../../../src/modules/customers/customers.repository";
import { mockDb } from "../../mocks/db.mock";
import { jest } from "@jest/globals";
import {
  mockCustomer,
  mockCustomers,
  mockCustomerId,
  mockCustomerPagination,
} from "../../fixtures/customers.fixtures";
import { sqlInjectionPayloadsArray } from "../../fixtures/security.fixtures";

describe("CustomersRepository", () => {
  let repository: CustomersRepository;

  beforeEach(() => {
    repository = new CustomersRepository();
  });

  describe("getCustomerById", () => {
    it("should return a customer when found", async () => {
      mockDb._setResult([mockCustomer]);

      const result = await repository.getCustomerById(mockCustomerId);

      expect(result).toEqual(mockCustomer);
      expect(mockDb.select).toHaveBeenCalled();
      expect(mockDb.from).toHaveBeenCalled();
      expect(mockDb.where).toHaveBeenCalled();
      expect(mockDb.limit).toHaveBeenCalledWith(1);
    });

    it("should return undefined when customer not found", async () => {
      mockDb._setResult([]);

      const result = await repository.getCustomerById("non-existent");

      expect(result).toBeUndefined();
    });

    it("should handle empty string id", async () => {
      mockDb._setResult([]);

      const result = await repository.getCustomerById("");

      expect(result).toBeUndefined();
      expect(mockDb.where).toHaveBeenCalled();
    });

    it.each(sqlInjectionPayloadsArray)(
      "should safely handle malicious id: %s",
      async (maliciousId) => {
        mockDb._setResult([]);

        const result = await repository.getCustomerById(maliciousId);

        expect(result).toBeUndefined();
        expect(mockDb.where).toHaveBeenCalled();
      }
    );
  });

  describe("getCustomers", () => {
    it("should return customers with pagination", async () => {
      mockDb._setResult(mockCustomers);

      const result = await repository.getCustomers(mockCustomerPagination);

      expect(result).toEqual(mockCustomers);
      expect(mockDb.select).toHaveBeenCalled();
      expect(mockDb.limit).toHaveBeenCalledWith(mockCustomerPagination.limit);
      expect(mockDb.offset).toHaveBeenCalledWith(0);
    });

    it("should calculate correct offset for page 2", async () => {
      mockDb._setResult([]);

      await repository.getCustomers({ page: 2, limit: 10 });

      expect(mockDb.offset).toHaveBeenCalledWith(10);
    });

    it("should calculate correct offset for page 3 with limit 5", async () => {
      mockDb._setResult([]);

      await repository.getCustomers({ page: 3, limit: 5 });

      expect(mockDb.offset).toHaveBeenCalledWith(10);
    });

    it("should return empty array when no customers found", async () => {
      mockDb._setResult([]);

      const result = await repository.getCustomers(mockCustomerPagination);

      expect(result).toEqual([]);
    });

    it("should handle large dataset", async () => {
      const customers = Array.from({ length: 100 }, (_, i) => ({
        ...mockCustomer,
        id: `cust-${i}`,
        name: `Name ${i}`,
        email: `email${i}@example.com`,
      }));
      mockDb._setResult(customers);

      const result = await repository.getCustomers({ page: 1, limit: 100 });

      expect(result).toHaveLength(100);
    });

    it.each(sqlInjectionPayloadsArray)(
      "should safely handle malicious pagination input: %s",
      async (maliciousPayload) => {
        mockDb._setResult([]);

        await repository.getCustomers({
          page: Number(maliciousPayload) as any,
          limit: Number(maliciousPayload) as any,
        });

        expect(mockDb.select).toHaveBeenCalled();
      }
    );
  });
});
