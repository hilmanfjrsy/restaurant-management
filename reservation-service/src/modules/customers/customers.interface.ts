export interface ICustomer {
  name: string;
  email: string;
  preferences?: string
}

export interface ICustomerPagination {
  page: number;
  limit: number;
}