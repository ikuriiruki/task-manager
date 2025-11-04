import { CreateTaskDTO } from "@application/dto/CreateTaskDTO";
import { UpdateTaskDTO } from "@application/dto/UpdateTaskDTO";
import { TaskService } from "@application/services/TaskService";
import Elysia from "elysia";

export function createTasksController(taskService: TaskService) {
    const app = new Elysia({ prefix: "/tasks" })
        .post("/", ({ body }) => taskService.create(body), {
            body: CreateTaskDTO,
        })
        .get("/", ({ query }) => taskService.list(query))
        .get("/:id", ({ params }) => taskService.get(params.id))
        .put(
            "/:id",
            ({ params, body }) => taskService.update(params.id, body),
            { body: UpdateTaskDTO }
        )
        .delete("/:id", ({ params }) => taskService.delete(params.id));

    return app;
}
