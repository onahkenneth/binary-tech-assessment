import index from '~/public/index.html';
import type { ReservationRequest } from './types/model';
import { ReservationService } from './service/reservation.service';
import type { BunRequest } from 'bun';
import { fail, ok } from './helpers/responses';
import { NotFoundError, ValidationError } from './helpers/error';

export default {
    "/": index,
    "/reservations/customers": {
        GET: async () => {
            try {
                const result = await ReservationService.getInstance().getCustomers();
                return ok(result);
            } catch (error) {
                console.error(error)
                return fail("Unexpected error occurred", 500);
            }
        }
    },
    "/reservations/waitlists": {
        GET: async () => {
            try {
                const result = await ReservationService.getInstance().getWaitlists();
                return ok(result);
            } catch (error) {
                console.error(error)
                return fail("Unexpected error occurred", 500);
            }
        }
    },
    "/reservations": {
        GET: async (req: BunRequest<"/reservations">) => {
            try {
                const result = await ReservationService.getInstance().getReservations();
                return ok(result);
            } catch (error) {
                console.error(error)
                if (error instanceof NotFoundError) return fail(error.message, 404);
                return fail("Unexpected error occurred", 500);
            }
        },
        POST: async (req: BunRequest<"/reservations">) => {
            try {
                const body = await req.json() as ReservationRequest;
                const result = await ReservationService.getInstance().processReservation(body);
                return ok(result);
            } catch (error) {
                console.error(error)
                if (error instanceof NotFoundError) return fail(error.message, 404);
                if (error instanceof ValidationError) return fail(error.message, 400);
                return fail("Unexpected error occurred", 500);
            }
        }
    },
}