import type { BunRequest } from "bun";
import { TableRepository } from "../repositories/TableRepository";
import type { Table } from "../types/model";
import { NotFoundError } from "../helpers/error";

export class AvailabilityService {
    private static instance: AvailabilityService;
    private readonly tableRepository: TableRepository;

    constructor() {
        this.tableRepository = TableRepository.getInstance()
    }

    static getInstance(): AvailabilityService {
        if (!AvailabilityService.instance) {
            AvailabilityService.instance = new AvailabilityService();
        }

        return AvailabilityService.instance;
    }

    async getTables(): Promise<Record<string, Table>> {
        return await this.tableRepository.getTables();
    }

    async getTable(tableId: string): Promise<Table | null> {
        const table = await this.tableRepository.getTable(tableId);

        if (!table) {
            throw new NotFoundError("Table not found");
        }

        return table;
    }

    async updateAvailability(request: BunRequest): Promise<void> {
        const body = await request.json() as { tableId: string; available: boolean };
        const table = await this.tableRepository.getTable(body.tableId);

        if (!table) {
            throw new NotFoundError("Table not found");
        }
        
        table.available = body.available;
        return await this.tableRepository.save(table);
    } 
}