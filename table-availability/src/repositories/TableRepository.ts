import type { Table } from "../types/model";

export class TableRepository {
    private tables: Record<string, Table>;
    private static instance: TableRepository;

    constructor() {
        this.tables = {
            T001: { tableId: "T001", capacity: 4, location: "Window", available: true},
            T002: { tableId: "T002", capacity: 2, location: "Corner", available: false},
            T003: { tableId: "T003", capacity: 6, location: "Center", available: true},
            T004: { tableId: "T004", capacity: 8, location: "Balcony", available: false},
        };
    }

    static getInstance(): TableRepository {
        if (!TableRepository.instance) {
            TableRepository.instance = new TableRepository();
        }
        return TableRepository.instance;
    }

    async isAvailable(tableId: string): Promise<boolean> {
        return this.tables[tableId]?.available ?? false;
    }

    async save(table: Table): Promise<void> {
        this.tables[table.tableId] = table;
    }

    async getTables(): Promise<Record<string, Table>> {
        return this.tables;
    }

    async getTable(tableId: string): Promise<Table | null> {
        return this.tables[tableId] ?? null;
    }
}