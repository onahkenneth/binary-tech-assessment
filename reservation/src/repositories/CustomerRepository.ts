import type { Customer } from "../types/model";

export class CustomerRepository {
    private static instance: CustomerRepository;
    private readonly customers: Record<string, Customer> = {};

    static getInstance(): CustomerRepository {
        if (!CustomerRepository.instance) {
            CustomerRepository.instance = new CustomerRepository();
        }
        return CustomerRepository.instance;
    }

    async getCustomers(): Promise<Record<string, Customer>> {
        return this.customers;
    }

    async getCustomer(customerId: string): Promise<Customer | null> {
        return this.customers[customerId] ?? null;
    }

    async save(customer: Customer): Promise<void> {
        this.customers[customer.customerId] = customer;
    }
}