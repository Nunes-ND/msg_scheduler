import type { FastifyListenOptions } from "fastify";
import { server } from "./http/server";

const serverOptions: FastifyListenOptions = {
	port: Number(process.env.PORT),
	host: process.env.HOST,
};

async function bootstrap() {
	try {
		await server.listen(serverOptions);
	} catch (error) {
		server.log.error(error);
		process.exit(1);
	}
}

bootstrap();
