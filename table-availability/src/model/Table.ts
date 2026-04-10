export default class Table {
    tableId: string;
    capacity: number;
    location: string;
    available: boolean;

    constructor(
        tableId: string,
        capacity: number,
        location: string,
        available: boolean,
    ) {
        this.tableId = tableId;
        this.capacity = capacity;
        this.location = location;
        this.available = available;
    }
}