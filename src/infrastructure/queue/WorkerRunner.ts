import { config } from "@infrastructure/config";
import { RedisWorker } from "./RedisWorker";

const worker = new RedisWorker(config.queueName, config.logFile);

worker.start().catch((err) => {
	console.error("Worker crashed", err);
	process.exit(1);
});

process.on("SIGINT", async () => {
	console.log("Stopping worker");
	worker.stop();
	process.exit(0);
});
process.on("SIGTERM", async () => {
	console.log("Stopping worker");
	worker.stop();
	process.exit(0);
});
