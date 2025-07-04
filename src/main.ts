import type { FastifyListenOptions } from "fastify";
import { server } from "./http/server";
import { testDbConnection } from "./providers/database/connection";

const serverOptions: FastifyListenOptions = {
	port: Number(process.env.PORT),
	host: process.env.HOST,
};

async function bootstrap() {
	try {
		await testDbConnection();
		server.log.info("✅ Database connected successfully");

		await server.listen(serverOptions);
	} catch (error) {
		server.log.error(error);
		process.exit(1);
	}
}

bootstrap();
