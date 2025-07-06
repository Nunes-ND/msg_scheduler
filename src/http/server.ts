import fastify, {
	type FastifyError,
	type FastifyInstance,
	type FastifyReply,
	type FastifyRequest,
} from "fastify";
import { schedulerRoute } from "../scheduler";

export const server: FastifyInstance = fastify({
	logger:
		process.env.NODE_ENV === "development"
			? {
					level: "info",
					transport: {
						target: "pino-pretty",
						options: {
							translateTime: "HH:MM:ss Z",
							ignore: "pid,hostname",
						},
					},
				}
			: false,
});

server.get("/", (request: FastifyRequest, reply: FastifyReply) => {
	reply.send({ status: "ok" });
});

server.register(schedulerRoute);

server.setErrorHandler(
	(error: FastifyError, request: FastifyRequest, reply: FastifyReply) => {
		server.log.error(error);

		if (error.validation) {
			return reply.status(400).send({
				statusCode: 400,
				error: "Bad Request",
				message: "Dados de entrada inválidos.",
				details: error.validation,
			});
		}

		const statusCode = error.statusCode || 500;

		return reply.status(statusCode).send({
			statusCode,
			error: error.name || "Internal Server Error",
			message:
				statusCode < 500 || process.env.NODE_ENV !== "production"
					? error.message
					: "Ocorreu um erro inesperado.",
		});
	},
);
