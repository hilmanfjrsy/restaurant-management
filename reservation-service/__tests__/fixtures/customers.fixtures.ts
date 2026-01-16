import {
  ICustomer,
  ICustomerPagination,
} from "../../src/modules/customers/customers.interface";

export const mockCustomerId = "cust-a1b2c3d4-e5f6-7890-abcd-ef1234567890";

export type MockCustomerRow = {
  id: string;
  name: string;
  email: string;
  preferences: string | null;
  createdAt: Date;
};

export const mockCustomer: MockCustomerRow = {
  id: mockCustomerId,
  name: "John Doe",
  email: "john.doe@example.com",
  preferences: "window seat",
  createdAt: new Date("2024-01-15T00:00:00.000Z"),
};

export const mockCustomers = [
  { ...mockCustomer },
  {
    ...mockCustomer,
    id: "cust-b2c3d4e5",
    name: "Jane Smith",
    email: "jane.smith@example.com",
    preferences: "quiet area",
  },
  {
    ...mockCustomer,
    id: "cust-c3d4e5f6",
    name: "Bob Johnson",
    email: "bob.johnson@example.com",
    preferences: null,
  },
];

export const mockCustomerPagination: ICustomerPagination = {
  page: 1,
  limit: 10,
};

export const createMockCustomer = (
  overrides: Partial<MockCustomerRow> = {}
): MockCustomerRow => ({
  ...mockCustomer,
  ...overrides,
});
