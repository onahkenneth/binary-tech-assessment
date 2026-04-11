import type { BunRequest } from 'bun';
import index from '~/public/index.html';
import { AvailabilityService } from './services/availability';
import { fail, ok } from './helpers/responses';
import { NotFoundError, ValidationError } from './helpers/error';

export default {
    "/": index,
    "/tables": {
        GET: async () => {
            const result = await AvailabilityService.getInstance()
                .getTables()
            return ok(result);
        },
        PUT: async (req: BunRequest) => {
            try {
                const result = await AvailabilityService.getInstance()
                    .updateAvailability(req);
                return ok(result);
            } catch (error) {
                if (error instanceof NotFoundError) return fail(error.message, 404);
                if (error instanceof ValidationError) return fail(error.message, 400);
                return fail("Unexpected error occurred", 500);
            }
        }
    },
    "/tables/:tableId": {
        GET: async (req: BunRequest<"/tables/:tableId">) => {
            const { tableId } = req.params;
            const result = await AvailabilityService.getInstance()
                .getTable(tableId)
            return ok(result);
        }
    },
}