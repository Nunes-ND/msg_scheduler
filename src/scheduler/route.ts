import type { FastifyInstance, FastifyReply, FastifyRequest } from "fastify";
import { DuplicateScheduleError, InvalidSchedulingDateError } from "./errors";
import { type MessagePayload, schedulerService } from "./service";

export function schedulerRoute(app: FastifyInstance) {
	app.post(
		"/schedules",
		{
			schema: {
				body: {
					type: "object",
					properties: {
						message: {
							type: "string",
						},
						recipient: {
							type: "string",
						},
						messageType: {
							type: "string",
							enum: ["EMAIL", "SMS", "PUSH", "WHATSAPP"],
						},
						schedulingDate: {
							type: "string",
							format: "date-time",
						},
					},
					required: ["messageType", "message", "recipient", "schedulingDate"],
					additionalProperties: false,
				},
			},
		},
		async (
			request: FastifyRequest<{
				Body: MessagePayload;
			}>,
			reply: FastifyReply,
		) => {
			try {
				const newSchedule = await schedulerService.create(request.body);
				reply.status(201).send(newSchedule);
			} catch (error) {
				if (error instanceof InvalidSchedulingDateError) {
					return reply.status(400).send({ message: error.message });
				}
				if (error instanceof DuplicateScheduleError) {
					return reply.status(409).send({ message: error.message });
				}
				throw error;
			}
		},
	);
}
