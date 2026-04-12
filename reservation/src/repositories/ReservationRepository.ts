import type { Reservation } from "../types/model";

export class ReservationRepository {
    private static instance: ReservationRepository;
    private readonly reservations: Record<string, Reservation> = {};

    static getInstance(): ReservationRepository {
        if (!ReservationRepository.instance) {
            ReservationRepository.instance = new ReservationRepository();
        }
        return ReservationRepository.instance;
    }

    async getReservations(): Promise<Record<string, Reservation>> {
        return this.reservations;
    }

    async getReservation(tableId: string): Promise<Reservation | null> {
        return this.reservations[tableId] ?? null;
    }

    async save(reservation: Reservation): Promise<void> {
        this.reservations[reservation.tableId] = reservation;
    }

    async delete(tableId: string): Promise<void> {
        delete this.reservations[tableId];
    }
}