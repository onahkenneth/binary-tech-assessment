import { test, expect, mock, beforeEach, describe, beforeAll } from "bun:test";
import { CustomerRepository } from "~/src/repositories/CustomerRepository";
import {
    ReservationType,
    StatusType,
    type CancelResponse,
    type CustomerQueue,
    type ReservationRequest,
    type ReservationResponse,
    type WaitlistStore
} from "~/src/types/model";

/**
 * Unit Tests — Pure Functions
 *
 * No database. No network. No containers.
 * These run instantly and catch logic bugs before integration tests run.
 *
 * Tests:
 *   - confirms reservation when table is available
 *   - adds to waitlist when table is not available
 *   - returns 404 for unknown table
 *   - fulfils next waitlist reservation on cancellation when waitlist is not empty
 *   - updates table availability on cancellation when waitlist is empty
 */

const BASE_URL = "http://localhost:3000";

// --- Client ---
async function getTable(tableId: string) {
    const res = await fetch(`${BASE_URL}/tables/${tableId}`);

    if (!res.ok && res.status === 404) {
        return JSON.parse('{"error": "Table not found"}');
    }

    return res.json();
}

async function makeReservation(request: ReservationRequest): Promise<ReservationResponse> {
    const table = await getTable(request.tableId);

    if (table.data.available) {
        await fetch(`${BASE_URL}/tables/${request.tableId}`, {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ tableId: request.tableId, available: false }),
        });

        return {
            status: StatusType.CONFIRMED,
            tableId: request.tableId,
            reservationId: "ROO1",
            waitlistMessage: null,
        };
    }

    return {
        status: StatusType.WAITLISTED,
        tableId: request.tableId,
        reservationId: null,
        waitlistMessage: "You are #1 in the queue",
        waitlistPosition: 1,
    };
}

async function cancelReservation(tableId: string): Promise<CancelResponse> {
    const res = await fetch(`${BASE_URL}/reservations/${tableId}/waitlist`);
    const waitlists: WaitlistStore[] = res.ok ? await res.json() as WaitlistStore[]: [];

    if (waitlists.length > 0) {
        const waitList = waitlists.find(w => w.tableId === tableId) as WaitlistStore;

        if (waitList) {
            const next = waitList.customerQueue[0] as CustomerQueue ?? null

            await fetch(`${BASE_URL}/tables/${tableId}`, {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ tableId, available: false }),
            });

            return {
                status: StatusType.CONFIRMED,
                tableId,
                customerId: next?.customerId,
            };
        }
    }

    await fetch(`${BASE_URL}/tables/${tableId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ tableId, available: true }),
    });

    return {
        status: StatusType.CANCELED,
        tableId
    };
}

// --- Mocks ---
const mockFetch = mock(async (input: string | URL | Request, init?: RequestInit) => {
    const url = input.toString();
    const method = init?.method ?? "GET";

    if (method === "PUT") {
        return Response.json({ created: true });
    }

    if (url.includes("/waitlist")) {
        const tableId = url.split("/reservations/")[1].split("/waitlist")[0];

        if (tableId === "T002") {
            return Response.json([
                {
                    tableId: "T002",
                    customerQueue: [
                        {
                            customerId: "C003",
                            preferences: ["Corner"]
                        }
                    ]
                },
            ]);
        }

        return Response.json([]);
    }

    if (url.includes("/tables/T001")) {
        return Response.json({
            success: true,
            data: {
                tableId: "T001",
                capacity: 4,
                location: "Window",
                available: true
            }
        });
    }

    if (url.includes("/tables/T002")) {
        return Response.json({
            success: true,
            data: {
                tableId: "T002",
                capacity: 2,
                location: "Corner",
                available: false
            }
        });
    }

    return new Response("Not Found", { status: 404 });
});

beforeEach(() => {
    globalThis.fetch = mockFetch;
});

// --- Tests ---
describe("Reservations", () => {
    let customerRepo: CustomerRepository;

    beforeAll(async () => {
        customerRepo = CustomerRepository.getInstance();
    });

    test("confirms reservation when table is available", async () => {
        const customer = await customerRepo.getCustomer("C001");
        const request = {
            tableId: "T001",
            customerId: customer?.customerId!,
            name: "Jane Doe",
            email: "jane.doe@example.com",
            reservationType: ReservationType.RESERVE,
            preferences: ["window", "quiet"]
        };
        const response = await makeReservation(request);

        expect(response.status).toBe(StatusType.CONFIRMED);
        expect(response.tableId).toBe("T001");
        expect(response.reservationId).not.toBe("R001");
        expect(response.waitlistMessage).toBe(null);
    });

    test("adds to waitlist when table is not available", async () => {
        const customer = await customerRepo.getCustomer("C002");
        const request = {
            tableId: "T002",
            customerId: customer?.customerId!,
            name: "John Doe",
            email: "john.doe@example.com",
            reservationType: ReservationType.RESERVE,
            preferences: ["corner", "quiet"]
        };
        const response = await makeReservation(request);

        expect(response.status).toBe(StatusType.WAITLISTED);
        expect(response.tableId).toBe("T002");
        expect(response.reservationId).toBe(null);
        expect(response.waitlistMessage).toContain("in the queue")
    });

    test("returns 404 for unknown table", async () => {
        const res = await getTable("T999");

        expect(res.error).toBe("Table not found");
    });

    test("fulfils next waitlist reservation on cancellation when waitlist is not empty", async () => {
        const response = await cancelReservation("T002");

        expect(response.status).toBe(StatusType.CONFIRMED);
        expect(response.tableId).toBe("T002");
        expect(response.customerId).toBe("C003");
    });

    test("updates table availability on cancellation when waitlist is empty", async () => {
        const response = await cancelReservation("T001");

        expect(response.status).toBe(StatusType.CANCELED);
        expect(response.tableId).toBe("T001");
        expect(response.customerId).toBeUndefined();
    });
});