import { eq } from "drizzle-orm";
import { db } from "~/src/db";
import { tables } from "~/src/db/schema";
import type { Table } from "~/src/types/model";

export class TableRepository {
    private static instance: TableRepository;

    static getInstance(): TableRepository {
        if (!TableRepository.instance) {
            TableRepository.instance = new TableRepository();
        }
        return TableRepository.instance;
    }

    async isAvailable(tableId: string): Promise<boolean> {
        const result = await db
            .select({ available: tables.available })
            .from(tables)
            .where(eq(tables.tableId, tableId))
            .limit(1);

        return result[0]?.available ?? false;
    }

    async save(table: Table): Promise<void> {
        await db
            .insert(tables)
            .values(table)
            .onConflictDoUpdate({
                target: tables.tableId,
                set: {
                    capacity: table.capacity,
                    location: table.location,
                    available: table.available,
                },
            });
    }

    async getTables(): Promise<Table[]> {
        return db.select().from(tables);
    }

    async getTable(tableId: string): Promise<Table | null> {
        const result = await db
            .select()
            .from(tables)
            .where(eq(tables.tableId, tableId))
            .limit(1);

        return result[0] ?? null;
    }
}