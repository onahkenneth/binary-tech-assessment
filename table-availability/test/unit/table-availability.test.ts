import { test, expect } from "bun:test";
import { TableRepository } from "~/src/repositories/TableRepository";

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

function getTableRepository() {
    return TableRepository.getInstance();
}

test.concurrent("get requested table details", async () => {
    const tableId = "T001";
    const table = await getTableRepository().getTable(tableId);

    expect(table?.tableId).toBe(tableId);
});

test.concurrent("handle table not found", async () => {
    const tableId = "T005";
    const table = await getTableRepository().getTable(tableId);

    expect(table).toBe(null);
});

test.concurrent("check table is not available", async () => {
    const tableId = "T002";
    const repo = getTableRepository();

    expect(await repo.isAvailable(tableId)).toBe(false);
});

test.concurrent("check table is available", async () => {
    const tableId = "T003";
    const repo = getTableRepository();

    expect(await repo.isAvailable(tableId)).toBe(true);
});

test.concurrent("can update table availability", async () => {
    const tableId = "T003";
    const repo = getTableRepository();
    const table = await repo.getTable(tableId);

    if (table) {
        table.available = false;
        await repo.save(table);
    }

    expect(await repo.isAvailable(tableId)).toBe(false);
});