import { test, expect, mock, describe, beforeAll } from "bun:test";
import { TableRepository } from "~/src/model/TableRepository";
import type { Table } from "~/src/types/model";

/**
 * Unit Tests — Pure Functions
 *
 * No database. No network. No containers.
 * These run instantly and catch logic bugs before integration tests run.
 *
 * Tests:
 *   - get requested table details
 *   - handle table not found
 *   - check table is not available
 *   - check table is available
 *   - can update table availability
 */

// --- Mock CustomerRepository ---

const mockTables: Record<string, Table> = {
    "C001": { customerId: "C001", name: "Jane Doe", email: "jane.doe@example.com" },
    "C002": { customerId: "C002", name: "John Doe", email: "john.doe@example.com" },
    "C003": { customerId: "C003", name: "Bob Brown", email: "bob.brown@example.com" },
};

mock.module("~/src/model/TableRepository", () => ({
    TableRepository: {
        getInstance: () => ({
            getTable: async (tableId: string): Promise<Table | null> => {
                return mockTables[tableId] ?? null;
            },
            getTables: async (): Promise<Table[]> => {
                return Object.values(mockTables);
            },
            isAvailable: async (tableId: string): Promise<boolean> => {
                return mockTables[tableId]?.available ?? false;
            },
            save: async (table: Table): Promise<void> => {
                mockTables[table.tableId] = table;
            },
        }),
    },
}));

// --- Tests ---
describe("Tables", () => {
    let tableRepo: TableRepository;

    beforeAll(async () => {
        tableRepo = TableRepository.getInstance();
    });

    test.concurrent("get requested table details", async () => {
        const tableId = "T001";
        const table = await tableRepo.getTable(tableId);

        expect(table?.tableId).toBe(tableId);
    });

    test.concurrent("handle table not found", async () => {
        const tableId = "T005";
        const table = await tableRepo.getTable(tableId);

        expect(table).toBe(null);
    });

    test.concurrent("check table is not available", async () => {
        const tableId = "T002";

        expect(await tableRepo.isAvailable(tableId)).toBe(false);
    });

    test.concurrent("check table is available", async () => {
        const tableId = "T003";

        expect(await tableRepo.isAvailable(tableId)).toBe(true);
    });

    test.concurrent("can update table availability", async () => {
        const tableId = "T003";
        const table = await tableRepo.getTable(tableId);

        if (table) {
            table.available = false;
            await tableRepo.save(table);
        }

        expect(await tableRepo.isAvailable(tableId)).toBe(false);
    });
});