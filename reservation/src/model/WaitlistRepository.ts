import { and, eq } from "drizzle-orm";
import { db } from "../db";
import { waitlists } from "../db/schema";
import type { WaitlistStore, CustomerQueue } from "../types/model";

export class WaitlistRepository {
    private static instance: WaitlistRepository;

    static getInstance(): WaitlistRepository {
        if (!WaitlistRepository.instance) {
            WaitlistRepository.instance = new WaitlistRepository();
        }
        return WaitlistRepository.instance;
    }

    async getWaitlists(): Promise<WaitlistStore[]> {
        const rows = await db.select().from(waitlists);

        return this.groupByTable(rows);
    }

    async getWaitlist(tableId: string): Promise<WaitlistStore | null> {
        const rows = await db
            .select()
            .from(waitlists)
            .where(eq(waitlists.tableId, tableId));

        if (rows.length === 0) return null;

        return {
            tableId,
            customerQueue: rows.map(r => ({
                customerId: r.customerId,
                preferences: r.preferences,
            })),
        };
    }

    async addToQueue(waitList: WaitlistStore): Promise<number> {
        for (const customer of waitList.customerQueue) {
            await db
                .insert(waitlists)
                .values({
                    tableId: waitList.tableId,
                    customerId: customer.customerId,
                    preferences: customer.preferences,
                })
                .onConflictDoNothing();
        }

        const updated = await db
            .select()
            .from(waitlists)
            .where(eq(waitlists.tableId, waitList.tableId));

        return updated.length;
    }

    async removeFromQueue(tableId: string, customerId: string): Promise<void> {
        await db
            .delete(waitlists)
            .where(
                and(
                    eq(waitlists.tableId, tableId),
                    eq(waitlists.customerId, customerId)
                )
            );
    }

    private groupByTable(rows: { tableId: string; customerId: string; preferences: string[] }[]): WaitlistStore[] {
        const map = new Map<string, CustomerQueue[]>();

        for (const row of rows) {
            if (!map.has(row.tableId)) {
                map.set(row.tableId, []);
            }
            map.get(row.tableId)!.push({
                customerId: row.customerId,
                preferences: row.preferences,
            });
        }

        return Array.from(map.entries()).map(([tableId, customerQueue]) => ({
            tableId,
            customerQueue,
        }));
    }
}