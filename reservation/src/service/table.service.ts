const TABLE_SERVICE_URL = process.env.TABLE_SERVICE_URL

// TODO Decompose into an API gateway and discovery service
export class TableServiceClient {
    async getTable(tableId: string) {
        const res = await fetch(`${TABLE_SERVICE_URL}/tables/${tableId}`);

        return res.json();
    }

    async updateAvailability(tableId: string, available: boolean) {
        await fetch(`${TABLE_SERVICE_URL}/tables/${tableId}`, {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ tableId: tableId, available: available }),
        });
    }
}