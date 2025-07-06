import type { FastifyInstance, FastifyReply, FastifyRequest } from "fastify";
import {
	DuplicateScheduleError,
	InvalidSchedulingDateError,
	MessageNotFoundError,
} from "./errors";
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

	app.get(
		"/schedules/:id",
		{
			schema: {
				params: {
					type: "object",
					properties: {
						id: {
							type: "string",
							format: "uuid",
						},
					},
					required: ["id"],
					additionalProperties: false,
				},
			},
		},
		async (
			request: FastifyRequest<{ Params: { id: string } }>,
			reply: FastifyReply,
		) => {
			try {
				const { id } = request.params;
				const schedule = await schedulerService.showStatus(id);
				reply.status(200).send({
					id: schedule.id,
					scheduled: schedule.scheduled,
				});
			} catch (error) {
				if (error instanceof MessageNotFoundError) {
					return reply.status(404).send({ message: error.message });
				}
				throw error;
			}
		},
	);

	app.put(
		"/schedules/:id",
		{
			schema: {
				params: {
					type: "object",
					properties: {
						id: {
							type: "string",
							format: "uuid",
						},
					},
					required: ["id"],
					additionalProperties: false,
				},
				body: {
					type: "object",
					properties: {
						scheduled: {
							type: "boolean",
						},
					},
					required: ["scheduled"],
					additionalProperties: false,
				},
			},
		},
		async (
			request: FastifyRequest<{
				Params: { id: string };
				Body: { scheduled: boolean };
			}>,
			reply: FastifyReply,
		) => {
			try {
				const { id } = request.params;
				const { scheduled } = request.body;
				const schedule = await schedulerService.changeStatus(id, scheduled);
				reply.status(200).send({
					id: schedule.id,
					scheduled: schedule.scheduled,
				});
			} catch (error) {
				if (error instanceof MessageNotFoundError) {
					return reply.status(404).send({ message: error.message });
				}
				throw error;
			}
		},
	);

	app.delete(
		"/schedules/:id",
		{
			schema: {
				params: {
					type: "object",
					properties: {
						id: {
							type: "string",
							format: "uuid",
						},
					},
					required: ["id"],
					additionalProperties: false,
				},
			},
		},
		async (
			request: FastifyRequest<{ Params: { id: string } }>,
			reply: FastifyReply,
		) => {
			try {
				const { id } = request.params;

				await schedulerService.delete(id);
				reply.status(204).send();
			} catch (error) {
				if (error instanceof MessageNotFoundError) {
					return reply.status(404).send({ message: error.message });
				}
				throw error;
			}
		},
	);
}
