import Table from "./Table";

export class TableRepository {
    private tables: Record<string, Table>;
    private static instance: TableRepository;

    constructor() {
        this.tables = {
            T001: new Table("T001", 4, "Window", true),
            T002: new Table("T002", 2, "Corner", false),
            T003: new Table("T003", 6, "Center", true),
            T004: new Table("T004", 8, "Balcony", false),
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