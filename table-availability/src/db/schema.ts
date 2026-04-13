import { pgTable, varchar, integer, boolean } from "drizzle-orm/pg-core";

export const tables = pgTable("tables", {
    tableId: varchar("table_id").primaryKey(),
    capacity: integer("capacity").notNull(),
    location: varchar("location").notNull(),
    available: boolean("available").notNull().default(true),
});