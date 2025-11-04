import { createServices } from "@infrastructure/bootstrap";
import { config } from "@infrastructure/config";
import { createServer } from "@infrastructure/web/server";

async function bootstrap() {
	const services = createServices();
	const app = await createServer(services);

	app.listen(config.port, () => {
		console.log(`Server running on http://localhost:${config.port}`);
	});
}

bootstrap().catch((err) => {
	console.error(err);
});
