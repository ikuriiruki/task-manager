import { INotifier } from "@application/interfaces/INotifier";
import { redis } from "bun";

export class RedisProducer implements INotifier {
    constructor(private queueName: string) {}
    async enqueue(payload: Record<string, any>): Promise<void> {
        try {
            await redis.rpush(this.queueName, JSON.stringify(payload));
            console.log("Enqueued notification:", payload);
        } catch (err) {
            console.error("Failed to enqueue notification", err);
            throw err;
        }
    }
}
