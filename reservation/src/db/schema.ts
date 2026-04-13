import { pgTable, varchar, text, pgEnum, primaryKey } from "drizzle-orm/pg-core";

export const statusTypeEnum = pgEnum("status_type", ["confirmed", "waitlisted", "canceled"]);

export const customers = pgTable("customers", {
    customerId: varchar("customer_id").primaryKey(),
    name: varchar("name").notNull(),
    email: varchar("email").notNull(),
});

export const reservations = pgTable("reservations", {
    reservationId: varchar("reservation_id").primaryKey(),
    tableId: varchar("table_id").notNull(),
    customerId: varchar("customer_id")
        .notNull()
        .references(() => customers.customerId),
    status: statusTypeEnum("status").notNull(),
});

export const waitlists = pgTable("waitlists", {
    tableId: varchar("table_id").notNull(),
    customerId: varchar("customer_id").notNull().references(() => customers.customerId),
    preferences: text("preferences").array().notNull().default([]),
}, (table) => ({
    pk: primaryKey({ columns: [table.tableId, table.customerId] }),
}));