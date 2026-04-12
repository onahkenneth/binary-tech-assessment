export type ApiResponse<T> = {
    success: boolean;
    data: T | null;
    error: string | null;
};

export enum ReservationType {
    RESERVE = "reserve",
    CANCEL = "cancel"
}

export enum StatusType {
    CONFIRMED = "confirmed",
    WAITLISTED = "waitlisted",
    CANCELED = "canceled"
}

export type Reservation = {
    status: StatusType;
    tableId: string;
    customerId: string
    reservationId: string;
}

export interface CancelRequest {
    tableId: string;
    reservationType: ReservationType
};

export type CancelResponse = {
    status: StatusType;
    tableId: string;
    customerId?: string
    reservationId?: string
};

export interface ReservationRequest extends CancelRequest {
    customerId: string;
    name: string;
    email: string;
    preferences: string[];
};

export type ReservationResponse = {
    status: StatusType;
    tableId: string;
    reservationId: string | null;
    waitlistMessage?: string | null;
    waitlistPosition?: number;
};

export type ReservationError = {
    error: string;
};

export type Customer = {
    customerId: string;
    name: string;
    email: string;
}

export type CustomerQueue = {
    customerId: string;
    preferences: string[];
}

export type WaitlistStore = {
    tableId: string;
    customerQueue: CustomerQueue[];
};