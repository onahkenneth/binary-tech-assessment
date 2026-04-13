import { eq } from "drizzle-orm";
import { db } from "../db";
import { reservations } from "../db/schema";
import type { Reservation, StatusType } from "../types/model";

export class ReservationRepository {
    private static instance: ReservationRepository;

    static getInstance(): ReservationRepository {
        if (!ReservationRepository.instance) {
            ReservationRepository.instance = new ReservationRepository();
        }
        return ReservationRepository.instance;
    }

    async getReservations(): Promise<Reservation[]> {
        const rows = await db.select().from(reservations);
        return rows.map(r => ({ ...r, status: r.status as StatusType }));
    }

    async getReservation(reservationId: string): Promise<Reservation | null> {
        const result = await db
        .select()
        .from(reservations)
        .where(eq(reservations.reservationId, reservationId))
        .limit(1);

        if (!result[0]) return null;
        return { ...result[0], status: result[0].status as StatusType };
    }

    async getReservationByTable(tableId: string): Promise<Reservation | null> {
        const result = await db
        .select()
        .from(reservations)
        .where(eq(reservations.tableId, tableId))
        .limit(1);

        if (!result[0]) return null;
        return { ...result[0], status: result[0].status as StatusType };
    }

    async save(reservation: Reservation): Promise<void> {
        await db
            .insert(reservations)
            .values(reservation)
            .onConflictDoUpdate({
                target: reservations.reservationId,
                set: {
                    tableId: reservation.tableId,
                    customerId: reservation.customerId,
                    status: reservation.status,
                },
            });
    }

    async delete(reservationId: string): Promise<void> {
        await db
            .delete(reservations)
            .where(eq(reservations.reservationId, reservationId));
    }
}