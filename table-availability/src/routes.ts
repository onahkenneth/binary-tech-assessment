import type { BunRequest } from 'bun';
import index from '~/public/index.html';
import { TableRepository } from "~/src/model/TableRepository";

export default {
    "/": index,
    "/tables/:tableId": {
        GET: async (req: BunRequest<"/tables/:tableId">) => {
            const { tableId } = req.params
            const table = await getTableRepository().getTable(tableId);

            if (!table) {
                return notFound()
            }

            return Response.json(
                {
                    success: true,
                    data: table
                }
            );
        },
        PUT: async (req: Request) => {
            const body = await req.json() as { tableId: string; available: boolean };
            const repo = getTableRepository();

            const table = await repo.getTable(body.tableId);

            if (!table) {
                return notFound()
            }
            
            if (table) {
                table.available = body.available;
                repo.save(table);
            }

            return Response.json({ created: true, ...table });
        }
    },
}

function getTableRepository() {
    return TableRepository.getInstance()
}

function notFound() {
    return Response.json(
        {
            "error": "Table not found"
        },
        {
            status: 404
        }
    );
}