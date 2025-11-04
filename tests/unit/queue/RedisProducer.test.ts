import { describe, it, expect, beforeEach, afterEach } from "bun:test";
import { RedisProducer } from "@infrastructure/queue/RedisProducer";
import { redis } from "bun";

describe("RedisProducer", () => {
	let producer: RedisProducer;
	const queueName = "test_notifications";

	beforeEach(async () => {
		producer = new RedisProducer(queueName);
		// Clean up Redis before each test
		await redis.del(queueName);
	});

	afterEach(async () => {
		// Clean up Redis after each test
		await redis.del(queueName);
	});

	it("should enqueue notification successfully", async () => {
		const payload = {
			type: "due_soon",
			taskId: "test-task-id",
			title: "Test Task",
			dueDate: new Date().toISOString(),
		};

		await producer.enqueue(payload);

		// Verify the message was added to the queue
		const message = await redis.lpop(queueName);
		expect(message).not.toBeNull();
		if (message === null) {
			return;
		}
		const parsedMessage = JSON.parse(message);
		expect(parsedMessage).toEqual(payload);
	});

	it("should handle multiple notifications", async () => {
		const payload1 = {
			type: "due_soon",
			taskId: "task-1",
			title: "Task 1",
		};

		const payload2 = {
			type: "due_soon",
			taskId: "task-2",
			title: "Task 2",
		};

		await producer.enqueue(payload1);
		await producer.enqueue(payload2);

		// Verify both messages are in the queue (FIFO order)
		const message1 = await redis.lpop(queueName);
		const message2 = await redis.lpop(queueName);

		expect(JSON.parse(message1!)).toEqual(payload1);
		expect(JSON.parse(message2!)).toEqual(payload2);
	});

	it("should handle complex payload objects", async () => {
		const complexPayload = {
			type: "due_soon",
			taskId: "complex-task",
			title: "Complex Task",
			description: "Task with multiple properties",
			dueDate: new Date().toISOString(),
			priority: "high",
			metadata: {
				category: "work",
				tags: ["urgent", "important"],
			},
		};

		await producer.enqueue(complexPayload);

		const message = await redis.lpop(queueName);
		const parsedMessage = JSON.parse(message!);

		expect(parsedMessage).toEqual(complexPayload);
		expect(parsedMessage.metadata.tags).toEqual(["urgent", "important"]);
	});
});
