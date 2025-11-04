import { TaskService } from "@application/services/TaskService";
import { TaskRepository } from "./repositories/TaskRepository";
import { RedisProducer } from "./queue/RedisProducer";
import { config } from "./config";

export type ServiceList = {
	taskService: TaskService;
};

export function createServices(): ServiceList {
	const taskRepo = new TaskRepository();
	const notifier = new RedisProducer(config.queueName);
	const taskService = new TaskService(taskRepo, notifier);

	return { taskService };
}
