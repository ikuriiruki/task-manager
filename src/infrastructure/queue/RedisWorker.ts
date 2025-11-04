import { redis } from "bun";
import { appendFile } from "node:fs/promises";

export class RedisWorker {
    private isRunning = false;

    constructor(private queueName: string, private logFile: string) {}

    async start() {
        this.isRunning = true;
        console.log(
            `RedisWorker started for queue: ${this.queueName}, listening for notifications...`
        );

        while (this.isRunning) {
            try {
                // BRPOP blocks until an item is available.
                const res = await redis.blpop(this.queueName, 1); // 1 second timeout
                if (!res) {
                    continue;
                }
                const [, message] = res;
                console.log("Worker received message:", message);
                const payload = JSON.parse(message);

                try {
                    await this.process(payload);
                } catch (processError) {
                    console.error(
                        "Failed to process notification",
                        processError
                    );
                }
            } catch (err) {
                console.error("Worker loop error", err);
                await new Promise((r) => setTimeout(r, 1000));
            }
        }
        console.log("RedisWorker stopped");
    }

    async process(payload: Record<string, any>) {
        try {
            const line = `${new Date().toISOString()} - Notify: ${JSON.stringify(
                payload
            )}\n`;
            await appendFile(this.logFile, line);
            console.log("Processed notification:", payload);
        } catch (err) {
            console.error("Failed to process notification", err);
        }
    }

    stop() {
        console.log(`Stopping RedisWorker for queue: ${this.queueName}`);
        this.isRunning = false;
    }
}
