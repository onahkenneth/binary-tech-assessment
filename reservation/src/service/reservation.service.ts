import { CustomerRepository } from "../model/CustomerRepository";
import { ReservationRepository } from "../model/ReservationRepository";
import { ReservationType, StatusType } from "../types/model";
import type {
    CancelRequest,
    CancelResponse,
    Customer,
    CustomerQueue,
    Reservation,
    ReservationRequest,
    ReservationResponse,
    WaitlistStore
} from "../types/model";
import { WaitlistRepository } from "../model/WaitlistRepository";
import { TableServiceClient } from "./table.service";
import { NotFoundError, ValidationError } from "../helpers/error";

export class ReservationService {
    private static instance: ReservationService;
    private readonly serviceClient: TableServiceClient;
    private readonly customerRepository: CustomerRepository;
    private readonly waitlistRepository: WaitlistRepository;
    private readonly reservationRepository: ReservationRepository;

    constructor() {
        this.serviceClient = new TableServiceClient();
        this.customerRepository = CustomerRepository.getInstance();
        this.waitlistRepository = WaitlistRepository.getInstance();
        this.reservationRepository = ReservationRepository.getInstance();
    }

    static getInstance(): ReservationService {
        if (!ReservationService.instance) {
            ReservationService.instance = new ReservationService();
        }
        return ReservationService.instance;
    }

    async getCustomers(): Promise<Customer[]> {
        return this.customerRepository.getCustomers()
    }

    async getWaitlists(): Promise<WaitlistStore[]> {
        return this.waitlistRepository.getWaitlists()
    }

    async getReservations(): Promise<Reservation[]> {
        return this.reservationRepository.getReservations()
    }

    async validateReservation(reservationType: ReservationType) {
        const validTypes = Object.values(ReservationType);
        return validTypes.includes(reservationType);
    }

    async processReservation(
        request: ReservationRequest
    ): Promise<CancelResponse | ReservationResponse> {
        let response: CancelResponse | ReservationResponse;
        const { reservationType } = request;

        const isValid = await this.validateReservation(reservationType)
    
        if (!isValid) {
            throw new ValidationError("Invalid reservation type");
        }

        switch (reservationType) {
            case ReservationType.RESERVE:
                response = await this.makeReservation(request);
                break;
            case ReservationType.CANCEL:
                response = await this.cancelReservation(request);
                break;
        }

        return response;
    }

    async makeReservation(
        request: ReservationRequest
    ): Promise<ReservationResponse> {
        let response: ReservationResponse;
        const { tableId, customerId, name, email, preferences } = request;
        const result = await this.serviceClient.getTable(tableId);

        console.log(`table data: ${JSON.stringify(result)}`);

        if (result.error) {
            throw new NotFoundError(result.error);
        }

        const table = result.data;
        this.customerRepository.save({ customerId, name, email });

        if (table.available) {
            this.serviceClient.updateAvailability(tableId, false)

            const reservationId = crypto.randomUUID()
            const data = {
                status: StatusType.CONFIRMED,
                tableId: tableId,
                customerId: customerId,
                reservationId: reservationId,
            };
            response = data;
            this.reservationRepository.save(data)
        } else {
            const queue: CustomerQueue = { customerId: customerId, preferences: preferences };
            const position = await this.waitlistRepository
                .addToQueue({ tableId: tableId, customerQueue: [queue] });
            response = {
                status: StatusType.WAITLISTED,
                tableId: tableId,
                reservationId: null,
                waitlistMessage: `You are #${position} in the queue`
            };
        }
        
        return response;
    }

    async cancelReservation(request: CancelRequest): Promise<CancelResponse> {
        let response: CancelResponse;
        const { tableId, customerId } = request;
        const reservation = await this.reservationRepository.getReservationByTable(tableId);

        if (!reservation) {
            throw new NotFoundError(`No reservation for table: ${tableId} found`);
        }

        const isValid = await this.isReservationForCustomer(customerId, reservation);

        if (!isValid) {
            throw new NotFoundError(`No reservation for customer: ${customerId} found`);
        }

        const result = await this.serviceClient.getTable(tableId);
        console.log(`table data: ${result}`);

        if (result.error) {
            throw new NotFoundError(result.error);
        }

        let nextCustomer: CustomerQueue;
        const waitlist = await this.waitlistRepository.getWaitlist(tableId)

        // TODO: When db is added make acid transaction
        if (waitlist) {
            nextCustomer = waitlist.customerQueue[0] as CustomerQueue ?? null

            if (nextCustomer) {
                const reservationId = crypto.randomUUID()
                response = {
                    status: StatusType.CONFIRMED,
                    tableId: tableId,
                    reservationId: reservationId,
                    customerId: nextCustomer.customerId
                }
                // Remove customer from queue since reservation is confirmed
                this.waitlistRepository.removeFromQueue(tableId, nextCustomer.customerId)
                this.reservationRepository.save(response as Reservation)
            }
        } else {
            // Waitlist is empty, make table available
            response = {
                status: StatusType.CANCELED,
                tableId: tableId
            }
            // No one in the waitlist, make table available
            this.serviceClient.updateAvailability(tableId, true);
            this.reservationRepository.delete(reservation.reservationId);
        }

        return response;
    }

    async isReservationForCustomer(customerId: string, reservation: Reservation) {
        return reservation.customerId === customerId;
    }
}