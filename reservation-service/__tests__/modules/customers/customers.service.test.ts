import { CustomersService } from "../../../src/modules/customers/customers.service";
import { CustomersRepository } from "../../../src/modules/customers/customers.repository";
import { jest } from "@jest/globals";
import {
  mockCustomer,
  mockCustomers,
  mockCustomerId,
  mockCustomerPagination,
} from "../../fixtures/customers.fixtures";

jest.mock("../../../src/modules/customers/customers.repository");

describe("CustomersService", () => {
  let service: CustomersService;
  let mockRepository: jest.Mocked<CustomersRepository>;

  beforeEach(() => {
    jest.clearAllMocks();

    mockRepository = new CustomersRepository() as jest.Mocked<CustomersRepository>;
    mockRepository.getCustomerById = jest.fn();
    mockRepository.getCustomers = jest.fn();

    service = new CustomersService();
    (service as any).customersRepository = mockRepository;
  });

  describe("getCustomerById", () => {
    it("should return customer when found", async () => {
      mockRepository.getCustomerById.mockResolvedValue(mockCustomer);

      const result = await service.getCustomerById(mockCustomerId);

      expect(result).toEqual(mockCustomer);
      expect(mockRepository.getCustomerById).toHaveBeenCalledWith(mockCustomerId);
    });

    it("should return undefined when not found", async () => {
      mockRepository.getCustomerById.mockResolvedValue(undefined as any);

      const result = await service.getCustomerById("non-existent");

      expect(result).toBeUndefined();
    });

    it("should propagate repository errors", async () => {
      mockRepository.getCustomerById.mockRejectedValue(
        new Error("Repository error")
      );

      await expect(service.getCustomerById(mockCustomerId)).rejects.toThrow(
        "Repository error"
      );
    });
  });

  describe("getCustomers", () => {
    it("should return customers", async () => {
      mockRepository.getCustomers.mockResolvedValue(mockCustomers);

      const result = await service.getCustomers(mockCustomerPagination);

      expect(result).toEqual(mockCustomers);
      expect(mockRepository.getCustomers).toHaveBeenCalledWith(
        mockCustomerPagination
      );
    });

    it("should return empty array", async () => {
      mockRepository.getCustomers.mockResolvedValue([]);

      const result = await service.getCustomers(mockCustomerPagination);

      expect(result).toEqual([]);
    });

    it("should propagate repository errors", async () => {
      mockRepository.getCustomers.mockRejectedValue(new Error("DB Error"));

      await expect(service.getCustomers(mockCustomerPagination)).rejects.toThrow(
        "DB Error"
      );
    });
  });
});
