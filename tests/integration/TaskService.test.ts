import { describe, it, expect, beforeEach, afterEach, test } from "bun:test";
import { TaskService } from "../../src/application/services/TaskService";
import { TaskRepository } from "../../src/infrastructure/repositories/TaskRepository";
import { RedisProducer } from "../../src/infrastructure/queue/RedisProducer";
import { Task } from "../../src/domain/entities/Task";
import { DueDate } from "../../src/domain/value-objects/DueDate";
import { cleanupDatabase } from "../setup";
import { redis } from "bun";

describe("TaskService Integration Tests", () => {
	let taskService: TaskService;
	let taskRepository: TaskRepository;
	let redisProducer: RedisProducer;
	const testQueue = "test_task_notifications";

	beforeEach(async () => {
		await cleanupDatabase();
		await redis.del(testQueue);

		taskRepository = new TaskRepository();
		redisProducer = new RedisProducer(testQueue);
		taskService = new TaskService(taskRepository, redisProducer);
	});

	afterEach(async () => {
		await cleanupDatabase();
		await redis.del(testQueue);
	});

	describe("create with real repository", () => {
		it("should create task and persist in database", async () => {
			const createData = {
				title: "Integration Test Task",
				description: "Integration Test Description",
			};

			const result = await taskService.create(createData);

			expect(result.id).toBeDefined();
			expect(result.title).toBe("Integration Test Task");

			// Verify task is actually in database
			const savedTask = await taskRepository.findById(result.id);
			expect(savedTask).not.toBeNull();
			expect(savedTask?.title).toBe("Integration Test Task");
		});

		it("should enqueue notification when task has due date within 24 hours", async () => {
			const futureDate = new Date();
			futureDate.setHours(futureDate.getHours() + 12); // 12 hours from now

			const createData = {
				title: "Urgent Task",
				dueDate: futureDate.toISOString(),
			};

			await taskService.create(createData);

			// Check that notification was enqueued in Redis
			const message = await redis.lpop(testQueue);
			expect(message).not.toBeNull();

			const notification = JSON.parse(message!);
			expect(notification.type).toBe("due_soon");
			expect(notification.title).toBe("Urgent Task");
		});
	});

	describe("update with real repository", () => {
		it("should update task and persist changes", async () => {
			// Create initial task
			const task = new Task(
				"1",
				"Original Title",
				"Original Description"
			);
			const createdTask = await taskRepository.create(task);

			// Update task
			const updateData = {
				title: "Updated Title",
				description: "Updated Description",
				status: "completed" as const,
			};

			const result = await taskService.update(createdTask.id, updateData);

			expect(result.title).toBe("Updated Title");
			expect(result.description).toBe("Updated Description");
			expect(result.status).toBe("completed");

			// Verify changes are persisted
			const updatedTask = await taskRepository.findById(createdTask.id);
			expect(updatedTask?.title).toBe("Updated Title");
			expect(updatedTask?.status).toBe("completed");
		});

		it("should enqueue notification when updated task has due date within 24 hours", async () => {
			const task = new Task("1", "Test Task");
			const createdTask = await taskRepository.create(task);

			const futureDate = new Date();
			futureDate.setHours(futureDate.getHours() + 6); // 6 hours from now

			const updateData = {
				dueDate: futureDate,
			};

			await taskService.update(createdTask.id, updateData);

			// Check that notification was enqueued
			const message = await redis.lpop(testQueue);
			expect(message).not.toBeNull();

			const notification = JSON.parse(message!);
			expect(notification.type).toBe("due_soon");
			expect(notification.taskId).toBe(createdTask.id);
		});
	});

	describe("list with real repository", () => {
		it("should return tasks from database", async () => {
			// Create tasks directly in repository
			const task1 = new Task("1", "Task 1");
			const task2 = new Task("2", "Task 2");
			task2.update({ status: "completed" });

			await taskRepository.create(task1);
			await taskRepository.create(task2);

			// Test without filter
			const allTasks = await taskService.list();
			expect(allTasks).toHaveLength(2);

			// Test with filter
			const pendingTasks = await taskService.list({ status: "pending" });
			expect(pendingTasks).toHaveLength(1);
			expect(pendingTasks[0].title).toBe("Task 1");

			const completedTasks = await taskService.list({
				status: "completed",
			});
			expect(completedTasks).toHaveLength(1);
			expect(completedTasks[0].title).toBe("Task 2");
		});
	});

	describe("delete with real repository", () => {
		it("should delete task from database", async () => {
			const task = new Task("1", "Task to Delete");
			const createdTask = await taskRepository.create(task);

			// Verify task exists
			const beforeDelete = await taskRepository.findById(createdTask.id);
			expect(beforeDelete).not.toBeNull();

			// Delete task
			await taskService.delete(createdTask.id);

			// Verify task is deleted
			const afterDelete = await taskRepository.findById(createdTask.id);
			expect(afterDelete).toBeNull();
		});
	});
});
