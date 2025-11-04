import { INotifier } from "@application/interfaces/INotifier";

export class MockNotifier implements INotifier {
    public enqueueCalls: any[] = [];

    async enqueue(payload: Record<string, any>): Promise<void> {
        this.enqueueCalls.push(payload);
    }

    clear(): void {
        this.enqueueCalls = [];
    }
}
