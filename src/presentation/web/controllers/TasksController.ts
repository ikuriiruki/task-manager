import { TaskService } from "@application/services/TaskService";
import Elysia from "elysia";
import { CreateTaskSchema } from "../schema/Tasks/CreateTaskSchema";
import { UpdateTaskSchema } from "../schema/Tasks/UpdateTaskSchema";

export function createTasksController(taskService: TaskService) {
    const app = new Elysia({ prefix: "/tasks" })
        .post("/", ({ body }) => taskService.create(body), {
            body: CreateTaskSchema,
        })
        .get("/", ({ query }) => taskService.list(query))
        .get("/:id", ({ params }) => taskService.get(params.id))
        .put(
            "/:id",
            ({ params, body }) => taskService.update(params.id, body),
            { body: UpdateTaskSchema }
        )
        .delete("/:id", ({ params }) => taskService.delete(params.id));

    return app;
}
