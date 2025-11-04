import { describe, it, expect, beforeEach, afterEach } from "bun:test";
import { RedisProducer } from "../../src/infrastructure/queue/RedisProducer";
import { RedisWorker } from "../../src/infrastructure/queue/RedisWorker";
import { redis } from "bun";
import { readFileSync, unlinkSync } from "fs";
import { resolve } from "path";

describe("Queue Integration Tests", () => {
    let producer: RedisProducer;
    let worker: RedisWorker;
    const testQueue = "test_integration_queue";
    const testLogFile = resolve(process.cwd(), "test_notifications.log");

    beforeEach(async () => {
        // Clean up Redis queue
        await redis.del(testQueue);

        // Clean up test log file
        try {
            unlinkSync(testLogFile);
        } catch (error) {
            // File doesn't exist, that's fine
        }

        // Create producer and worker with test queue
        producer = new RedisProducer(testQueue);
        worker = new RedisWorker(testQueue, testLogFile);
    });

    afterEach(async () => {
        // Stop worker
        worker.stop();

        // Clean up Redis
        await redis.del(testQueue);

        // Clean up test log file
        try {
            unlinkSync(testLogFile);
        } catch (error) {
            // File doesn't exist, that's fine
        }
    });

    it("should process message from queue and write to log file", async () => {
        const testPayload = {
            type: "due_soon",
            taskId: "test-task-123",
            title: "Test Task",
            dueDate: new Date().toISOString(),
        };

        // Enqueue message
        await redis.rpush(testQueue, JSON.stringify(testPayload));

        // Start worker (it will process one message and we'll stop it)
        const workerPromise = worker.start();

        // Wait a bit for processing
        await new Promise((resolve) => setTimeout(resolve, 100));

        // Stop worker
        worker.stop();

        // Verify message was processed and written to log
        const logContent = readFileSync(testLogFile, "utf-8");
        expect(logContent).toContain("Notify:");
        expect(logContent).toContain("test-task-123");
        expect(logContent).toContain("Test Task");
    });

    it("should handle multiple messages in order", async () => {
        const payloads = [
            { type: "due_soon", taskId: "task-1", title: "Task 1" },
            { type: "due_soon", taskId: "task-2", title: "Task 2" },
            { type: "due_soon", taskId: "task-3", title: "Task 3" },
        ];

        // Enqueue messages in order
        for (const payload of payloads) {
            await redis.rpush(testQueue, JSON.stringify(payload));
        }

        // Process messages
        const workerPromise = worker.start();

        // Wait for processing
        await new Promise((resolve) => setTimeout(resolve, 200));

        worker.stop();

        // Verify all messages were processed in order
        const logContent = readFileSync(testLogFile, "utf-8");
        const lines = logContent
            .trim()
            .split("\n")
            .filter((line) => line.length > 0);

        expect(lines).toHaveLength(3);
        expect(logContent).toContain("task-1");
        expect(logContent).toContain("task-2");
        expect(logContent).toContain("task-3");

        // Verify order (FIFO)
        const task1Index = logContent.indexOf("task-1");
        const task2Index = logContent.indexOf("task-2");
        const task3Index = logContent.indexOf("task-3");

        expect(task1Index).toBeLessThan(task2Index);
        expect(task2Index).toBeLessThan(task3Index);
    });
});
