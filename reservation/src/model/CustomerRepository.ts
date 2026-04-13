import { eq } from "drizzle-orm";
import { db } from "../db";
import { customers } from "../db/schema";
import type { Customer } from "../types/model";

export class CustomerRepository {
    private static instance: CustomerRepository;

    static getInstance(): CustomerRepository {
        if (!CustomerRepository.instance) {
            CustomerRepository.instance = new CustomerRepository();
        }
        return CustomerRepository.instance;
    }

    async getCustomers(): Promise<Customer[]> {
        return db.select().from(customers);
    }

    async getCustomer(customerId: string): Promise<Customer | null> {
        const result = await db
            .select()
            .from(customers)
            .where(eq(customers.customerId, customerId))
            .limit(1);

        return result[0] ?? null;
    }

    async save(customer: Customer): Promise<void> {
        await db
            .insert(customers)
            .values(customer)
            .onConflictDoUpdate({
                target: customers.customerId,
                set: {
                    name: customer.name,
                    email: customer.email,
                },
            });
    }
}