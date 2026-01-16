import { ICustomer, ICustomerPagination } from "./customers.interface";
import { CustomersRepository } from "./customers.repository";


export class CustomersService {
  private customersRepository: CustomersRepository;
  constructor() {
    this.customersRepository = new CustomersRepository();
  }
  
  async getCustomerById(id: string) {
    return await this.customersRepository.getCustomerById(id);
  }

  async getCustomers(pagination: ICustomerPagination) {
    return await this.customersRepository.getCustomers(pagination);
  }
}