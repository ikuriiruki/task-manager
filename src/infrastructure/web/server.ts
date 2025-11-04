import { CreateTaskDTO } from "@application/dto/CreateTaskDTO";
import { UpdateTaskDTO } from "@application/dto/UpdateTaskDTO";
import { ServiceList } from "@infrastructure/bootstrap";
import Elysia from "elysia";
import { registerRoutes } from "src/presentation/web/routes";

export async function createServer(services: ServiceList) {
    const app = new Elysia().get("/health", () => ({
        status: "ok",
        timestamp: new Date().toISOString(),
    }));

    registerRoutes(app, services);

    return app;
}
