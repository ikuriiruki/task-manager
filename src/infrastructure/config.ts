import { resolve } from "path";

export const config = {
	port: Number(Bun.env.PORT) || 3000,
	databaseUrl: Bun.env.DATABASE_URL || "postgresql://localhost:5432/tasks",
	redisUrl: Bun.env.REDIS_URL || "redis://localhost:6379",
	queueName: Bun.env.QUEUE_NAME || "task_notifications",
	logFile: resolve(process.cwd(), Bun.env.LOG_FILE || "notifications.log"),
};
