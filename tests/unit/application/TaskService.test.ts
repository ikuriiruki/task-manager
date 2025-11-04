import { describe, it, expect, beforeEach, afterEach } from "bun:test";
import { TaskService } from "@application/services/TaskService";
import { Task } from "@domain/entities/Task";
import { TaskNotFound } from "@application/errors/TaskNotFound";
import { MockTaskRepository } from "../../mocks/MockTaskRepository";
import { MockNotifier } from "../../mocks/MockNotifier";

describe("TaskService", () => {
	let taskService: TaskService;
	let mockRepository: MockTaskRepository;
	let mockNotifier: MockNotifier;

	beforeEach(() => {
		mockRepository = new MockTaskRepository();
		mockNotifier = new MockNotifier();
		taskService = new TaskService(mockRepository, mockNotifier);
	});

	afterEach(() => {
		mockRepository.clear();
		mockNotifier.clear();
	});

	describe("create", () => {
		it("should create a task without due date", async () => {
			const createData = {
				title: "Test Task",
				description: "Test Description",
			};

			const result = await taskService.create(createData);

			expect(result.id).toBeDefined();
			expect(result.title).toBe("Test Task");
			expect(result.description).toBe("Test Description");
			expect(result.dueDate).toBeUndefined();
			expect(result.status).toBe("pending");
			expect(mockNotifier.enqueueCalls).toHaveLength(0);
		});

		it("should create a task with due date not within 24 hours", async () => {
			const futureDate = new Date();
			futureDate.setDate(futureDate.getDate() + 2); // 2 days from now

			const createData = {
				title: "Test Task",
				description: "Test Description",
				dueDate: futureDate.toISOString(),
			};

			const result = await taskService.create(createData);

			expect(result.id).toBeDefined();
			expect(result.title).toBe("Test Task");
			expect(result.dueDate).toBe(futureDate.toISOString());
			expect(mockNotifier.enqueueCalls).toHaveLength(0);
		});

		it("should create a task with due date within 24 hours and enqueue notification", async () => {
			const futureDate = new Date();
			futureDate.setHours(futureDate.getHours() + 12); // 12 hours from now

			const createData = {
				title: "Test Task",
				description: "Test Description",
				dueDate: futureDate.toISOString(),
			};

			const result = await taskService.create(createData);

			expect(result.id).toBeDefined();
			expect(result.title).toBe("Test Task");
			expect(result.dueDate).toBe(futureDate.toISOString());

			expect(mockNotifier.enqueueCalls).toHaveLength(1);
			expect(mockNotifier.enqueueCalls[0]).toEqual({
				type: "due_soon",
				taskId: result.id,
				title: "Test Task",
				dueDate: futureDate.toISOString(),
			});
		});
	});

	describe("list", () => {
		it("should return empty list when no tasks exist", async () => {
			const result = await taskService.list();
			expect(result).toEqual([]);
		});

		it("should return all tasks when no filter provided", async () => {
			// Create some tasks
			const task1 = new Task("1", "Task 1");
			const task2 = new Task("2", "Task 2");

			await mockRepository.create(task1);
			await mockRepository.create(task2);

			const result = await taskService.list();

			expect(result).toHaveLength(2);
			expect(result[0].title).toBe("Task 1");
			expect(result[1].title).toBe("Task 2");
		});

		it("should filter tasks by status", async () => {
			// Create tasks with different statuses
			const task1 = new Task("1", "Task 1");
			const task2 = new Task("2", "Task 2");
			task2.update({ status: "completed" });

			await mockRepository.create(task1);
			await mockRepository.create(task2);

			const pendingTasks = await taskService.list({ status: "pending" });
			const completedTasks = await taskService.list({
				status: "completed",
			});

			expect(pendingTasks).toHaveLength(1);
			expect(pendingTasks[0].title).toBe("Task 1");

			expect(completedTasks).toHaveLength(1);
			expect(completedTasks[0].title).toBe("Task 2");
		});
	});

	describe("get", () => {
		it("should return task when it exists", async () => {
			const task = new Task("1", "Test Task", "Test Description");
			await mockRepository.create(task);

			const result = await taskService.get("1");

			expect(result.id).toBe("1");
			expect(result.title).toBe("Test Task");
			expect(result.description).toBe("Test Description");
		});

		it("should throw TaskNotFound when task does not exist", async () => {
			expect(async () => {
				await taskService.get("non-existent-id");
			}).toThrow(TaskNotFound);
		});
	});

	describe("update", () => {
		it("should update task successfully", async () => {
			const task = new Task("1", "Old Title", "Old Description");
			await mockRepository.create(task);

			const updateData = {
				title: "New Title",
				description: "New Description",
				status: "completed" as const,
			};

			const result = await taskService.update("1", updateData);

			expect(result.id).toBe("1");
			expect(result.title).toBe("New Title");
			expect(result.description).toBe("New Description");
			expect(result.status).toBe("completed");
			expect(mockNotifier.enqueueCalls).toHaveLength(0);
		});

		it("should update task with due date within 24 hours and enqueue notification", async () => {
			const task = new Task("1", "Test Task");
			await mockRepository.create(task);

			const futureDate = new Date();
			futureDate.setHours(futureDate.getHours() + 12); // 12 hours from now

			const updateData = {
				dueDate: futureDate,
			};

			const result = await taskService.update("1", updateData);

			expect(mockNotifier.enqueueCalls).toHaveLength(1);
			expect(mockNotifier.enqueueCalls[0]).toEqual({
				type: "due_soon",
				taskId: "1",
				title: "Test Task",
				dueDate: futureDate.toISOString(),
			});
		});

		it("should throw TaskNotFound when updating non-existent task", async () => {
			expect(async () => {
				await taskService.update("non-existent-id", {
					title: "New Title",
				});
			}).toThrow(TaskNotFound);
		});
	});

	describe("delete", () => {
		it("should delete task successfully", async () => {
			const task = new Task("1", "Test Task");
			await mockRepository.create(task);

			await taskService.delete("1");

			const deletedTask = await mockRepository.findById("1");
			expect(deletedTask).toBeNull();
		});

		it("should not throw error when deleting non-existent task", async () => {
			expect(async () => {
				await taskService.delete("non-existent-id");
			}).not.toThrow();
		});
	});
});
