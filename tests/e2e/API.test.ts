import {
    describe,
    it,
    expect,
    beforeAll,
    afterAll,
    beforeEach,
    afterEach,
} from "bun:test";
import { createServer } from "@infrastructure/web/server";
import { createServices } from "@infrastructure/bootstrap";
import { Elysia } from "elysia";
import { cleanupDatabase } from "../setup";

describe("API e2e Tests", () => {
    let app: Elysia;
    let services: ReturnType<typeof createServices>;

    beforeAll(async () => {
        services = createServices();
        app = await createServer(services);
    });

    beforeEach(async () => {
        await cleanupDatabase();
    });

    afterAll(async () => {
        await cleanupDatabase();
    });

    describe("Health Check", () => {
        it("should return health status", async () => {
            const response = await app
                .handle(new Request("http://localhost:3000/health"))
                .then((res) => res.json());

            expect(response.status).toBe("ok");
            expect(response.timestamp).toBeDefined();
        });
    });

    describe("POST /tasks", () => {
        it("should create a task without due date", async () => {
            const taskData = {
                title: "Test Task",
                description: "Test Description",
            };

            const response = await app
                .handle(
                    new Request("http://localhost:3000/tasks", {
                        method: "POST",
                        headers: { "Content-Type": "application/json" },
                        body: JSON.stringify(taskData),
                    })
                )
                .then((res) => res.json());

            expect(response.id).toBeDefined();
            expect(response.title).toBe("Test Task");
            expect(response.description).toBe("Test Description");
            expect(response.dueDate).toBeUndefined();
            expect(response.status).toBe("pending");
        });

        it("should create a task with due date", async () => {
            const futureDate = new Date();
            futureDate.setDate(futureDate.getDate() + 2);

            const taskData = {
                title: "Test Task",
                description: "Test Description",
                dueDate: futureDate.toISOString(),
            };

            const response = await app
                .handle(
                    new Request("http://localhost:3000/tasks", {
                        method: "POST",
                        headers: { "Content-Type": "application/json" },
                        body: JSON.stringify(taskData),
                    })
                )
                .then((res) => res.json());

            expect(response.id).toBeDefined();
            expect(response.title).toBe("Test Task");
            expect(response.dueDate).toBe(futureDate.toISOString());
        });

        it("should return validation error for missing title", async () => {
            const taskData = {
                description: "Test Description",
            };

            const response = await app.handle(
                new Request("http://localhost:3000/tasks", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify(taskData),
                })
            );

            expect(response.status).toBe(422);
        });
    });

    describe("GET /tasks", () => {
        it("should return empty list when no tasks exist", async () => {
            const response = await app
                .handle(new Request("http://localhost:3000/tasks"))
                .then((res) => res.json());

            expect(response).toEqual([]);
        });

        it("should return all tasks", async () => {
            // Create tasks through service
            await services.taskService.create({ title: "Task 1" });
            await services.taskService.create({ title: "Task 2" });

            const response = await app
                .handle(new Request("http://localhost:3000/tasks"))
                .then((res) => res.json());

            expect(response).toHaveLength(2);
            expect(response[0].title).toBe("Task 1");
            expect(response[1].title).toBe("Task 2");
        });

        it("should filter tasks by status", async () => {
            // Create tasks through service
            await services.taskService.create({ title: "Task 1" });
            const task2 = await services.taskService.create({
                title: "Task 2",
            });
            await services.taskService.update(task2.id, {
                status: "completed",
            });

            const pendingResponse = await app
                .handle(
                    new Request("http://localhost:3000/tasks?status=pending")
                )
                .then((res) => res.json());

            const completedResponse = await app
                .handle(
                    new Request("http://localhost:3000/tasks?status=completed")
                )
                .then((res) => res.json());

            expect(pendingResponse).toHaveLength(1);
            expect(pendingResponse[0].title).toBe("Task 1");

            expect(completedResponse).toHaveLength(1);
            expect(completedResponse[0].title).toBe("Task 2");
        });
    });

    describe("GET /tasks/:id", () => {
        it("should return task by ID", async () => {
            const createdTask = await services.taskService.create({
                title: "Test Task",
                description: "Test Description",
            });

            const response = await app
                .handle(
                    new Request(`http://localhost:3000/tasks/${createdTask.id}`)
                )
                .then((res) => res.json());

            expect(response.id).toBe(createdTask.id);
            expect(response.title).toBe("Test Task");
            expect(response.description).toBe("Test Description");
        });

        it("should return 404 for non-existent task", async () => {
            const response = await app.handle(
                new Request("http://localhost:3000/tasks/non-existent-id")
            );

            expect(response.status).toBe(404);
        });
    });

    describe("PUT /tasks/:id", () => {
        it("should update task successfully", async () => {
            const createdTask = await services.taskService.create({
                title: "Original Title",
                description: "Original Description",
            });

            const updateData = {
                title: "Updated Title",
                description: "Updated Description",
                status: "completed",
            };

            const response = await app
                .handle(
                    new Request(
                        `http://localhost:3000/tasks/${createdTask.id}`,
                        {
                            method: "PUT",
                            headers: { "Content-Type": "application/json" },
                            body: JSON.stringify(updateData),
                        }
                    )
                )
                .then((res) => res.json());

            expect(response.id).toBe(createdTask.id);
            expect(response.title).toBe("Updated Title");
            expect(response.description).toBe("Updated Description");
            expect(response.status).toBe("completed");
        });

        it("should update task with partial data", async () => {
            const createdTask = await services.taskService.create({
                title: "Original Title",
            });

            const updateData = {
                title: "Updated Title",
            };

            const response = await app
                .handle(
                    new Request(
                        `http://localhost:3000/tasks/${createdTask.id}`,
                        {
                            method: "PUT",
                            headers: { "Content-Type": "application/json" },
                            body: JSON.stringify(updateData),
                        }
                    )
                )
                .then((res) => res.json());

            expect(response.title).toBe("Updated Title");
            expect(response.status).toBe("pending"); // Should remain unchanged
        });

        it("should return 404 for non-existent task", async () => {
            const updateData = {
                title: "Updated Title",
            };

            const response = await app.handle(
                new Request("http://localhost:3000/tasks/non-existent-id", {
                    method: "PUT",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify(updateData),
                })
            );

            expect(response.status).toBe(404);
        });
    });

    describe("DELETE /tasks/:id", () => {
        it("should delete task successfully", async () => {
            const createdTask = await services.taskService.create({
                title: "Test Task",
            });

            const response = await app.handle(
                new Request(`http://localhost:3000/tasks/${createdTask.id}`, {
                    method: "DELETE",
                })
            );

            expect(response.status).toBe(200);

            // Verify task is deleted
            const getResponse = await app.handle(
                new Request(`http://localhost:3000/tasks/${createdTask.id}`)
            );

            expect(getResponse.status).toBe(404);
        });

        it("should return 200 for non-existent task (idempotent)", async () => {
            const response = await app.handle(
                new Request("http://localhost:3000/tasks/non-existent-id", {
                    method: "DELETE",
                })
            );

            expect(response.status).toBe(200);
        });
    });
});
