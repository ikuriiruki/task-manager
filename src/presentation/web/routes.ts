import { ServiceList } from "@infrastructure/bootstrap";
import Elysia from "elysia";
import { createTasksController } from "./controllers/TasksController";

export function registerRoutes(app: Elysia, services: ServiceList) {
    const { taskService } = services;
    const tasksApp = createTasksController(services.taskService);

    app.use(tasksApp);
}
