import type { WaitlistStore } from "../types/model";

export class WaitlistRepository {
    private readonly waitlists: WaitlistStore[];
    private static instance: WaitlistRepository;

    constructor() {
        this.waitlists = [];
    }


    static getInstance(): WaitlistRepository {
        if (!WaitlistRepository.instance) {
            WaitlistRepository.instance = new WaitlistRepository();
        }
        return WaitlistRepository.instance;
    }

    async getWaitlists(): Promise<WaitlistStore[]> {
        return this.waitlists;
    }

    async getWaitlist(tableId: string): Promise<WaitlistStore | null> {
        const existing = this.waitlists.find(w => w.tableId === tableId);
        return existing ?? null
    }

    async addToQueue(waitList: WaitlistStore): Promise<number> {
        const existing = this.waitlists.find(w => w.tableId === waitList.tableId);

        if (existing) {
            for (const customer of waitList.customerQueue) {
                const alreadyQueued = existing.customerQueue
                    .some(c => c.customerId === customer.customerId);
                if (!alreadyQueued) {
                    existing.customerQueue.push(customer);
                }
            }
            return existing.customerQueue.length;
        }
        
        this.waitlists.push(waitList);
        return waitList.customerQueue.length;
    }

    async removeFromQueue(tableId: string, customerId: string) {
        const waitlistIndex = this.waitlists.findIndex(w => w.tableId === tableId);

        if (waitlistIndex === -1) return;

        const waitlist = this.waitlists[waitlistIndex];

        if (!waitlist) return;

        waitlist.customerQueue = waitlist.customerQueue.filter(
            c => c.customerId !== customerId
        );

        if (waitlist.customerQueue.length === 0) {
            this.waitlists.splice(waitlistIndex, 1);
        }
    }
}