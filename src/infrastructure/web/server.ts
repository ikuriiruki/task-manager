import { CreateTaskDTO } from "@application/dto/CreateTaskDTO";
import { UpdateTaskDTO } from "@application/dto/UpdateTaskDTO";
import { ServiceList } from "@infrastructure/bootstrap";
import Elysia from "elysia";

export async function createServer(services: ServiceList) {
	const { taskService } = services;
	const app = new Elysia()
		.get("/health", () => ({
			status: "ok",
			timestamp: new Date().toISOString(),
		}))
		.post("/tasks", ({ body }) => taskService.create(body), {
			body: CreateTaskDTO,
		})
		.get("/tasks", ({ query }) => taskService.list(query))
		.get("/tasks/:id", ({ params }) => taskService.get(params.id))
		.put(
			"/tasks/:id",
			({ params, body }) => taskService.update(params.id, body),
			{ body: UpdateTaskDTO }
		)
		.delete("/tasks/:id", ({ params }) => taskService.delete(params.id));

	return app;
}
