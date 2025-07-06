import { randomUUID } from "node:crypto";
import { beforeEach, describe, expect, it } from "vitest";
import { server } from "@/http/server";
import { dbConnection } from "@/providers/database/connection";

describe("Scheduler", () => {
	beforeEach(async () => {
		await dbConnection.query('DELETE FROM "messages"');
	});

	describe("Scheduler POST /schedules", () => {
		it("should schedule a message and return the correct data", async () => {
			const schedulingDate = new Date();
			schedulingDate.setDate(schedulingDate.getDate() + 1);
			const schedulingDateISO = schedulingDate.toISOString();

			const response = await server.inject({
				method: "POST",
				url: "/schedules",
				body: {
					messageType: "EMAIL",
					message: "New email",
					recipient: "Somebody",
					schedulingDate: schedulingDateISO,
				},
			});

			expect(response.statusCode).toBe(201);
			expect(response.json()).toEqual({
				id: expect.any(String),
				messageType: "EMAIL",
				message: "New email",
				recipient: "Somebody",
				schedulingDate: schedulingDateISO,
				scheduled: true,
				createdAt: expect.any(String),
				updatedAt: expect.any(String),
			});
		});

		it.each(["EMAIL", "SMS", "PUSH", "WHATSAPP"])(
			"should schedule a send message with correct message type",
			async (messageType) => {
				const futureDate = new Date();
				futureDate.setDate(futureDate.getDate() + 1);

				const response = await server.inject({
					method: "POST",
					url: "/schedules",
					body: {
						messageType,
						message: "Important Message",
						recipient: "Somebody",
						schedulingDate: futureDate.toISOString(),
					},
				});

				expect(response.statusCode).toBe(201);
				expect(response.json().messageType).toBe(messageType);
			},
		);

		it("should not schedule a send message with invalid message type", async () => {
			const futureDate = new Date();
			futureDate.setDate(futureDate.getDate() + 1);

			const response = await server.inject({
				method: "POST",
				url: "/schedules",
				body: {
					messageType: "INVALID",
					message: "Invalid type message",
					recipient: "Anybody",
					schedulingDate: futureDate.toISOString(),
				},
			});

			expect(response.statusCode).toBe(400);
		});

		it("should not schedule a message for a past date", async () => {
			const pastDate = new Date();
			pastDate.setDate(pastDate.getDate() - 1);

			const response = await server.inject({
				method: "POST",
				url: "/schedules",
				body: {
					messageType: "EMAIL",
					message: "Past email",
					recipient: "Somebody",
					schedulingDate: pastDate.toISOString(),
				},
			});

			expect(response.statusCode).toBe(400);
			expect(response.json()).toHaveProperty(
				"message",
				"Cannot schedule a message for a past date.",
			);
		});

		it("should not schedule a message that has already been scheduled", async () => {
			const schedulingDate = new Date();
			schedulingDate.setDate(schedulingDate.getDate() + 2);
			const schedulingDateISO = schedulingDate.toISOString();

			const messagePayload = {
				messageType: "EMAIL",
				message: "A message that will be duplicated",
				recipient: "duplicate@test.com",
				schedulingDate: schedulingDateISO,
			};

			await server.inject({
				method: "POST",
				url: "/schedules",
				body: messagePayload,
			});

			const secondResponse = await server.inject({
				method: "POST",
				url: "/schedules",
				body: messagePayload,
			});

			expect(secondResponse.statusCode).toBe(409);
			expect(secondResponse.json()).toHaveProperty(
				"message",
				"This message has already been scheduled.",
			);
		});
	});

	describe("Scheduler GET /schedules/:id", () => {
		it("should show the status of a specific scheduled message", async () => {
			const schedulingDate = new Date();
			schedulingDate.setDate(schedulingDate.getDate() + 1);
			const schedulingDateISO = schedulingDate.toISOString();
			const messageResponse = await server.inject({
				method: "POST",
				url: "/schedules",
				body: {
					messageType: "PUSH",
					message: "New push notification",
					recipient: "051-99999-9999",
					schedulingDate: schedulingDateISO,
				},
			});

			const response = await server.inject({
				method: "GET",
				url: `/schedules/${messageResponse.json().id}`,
			});

			expect(response.statusCode).toBe(200);
			expect(response.json()).toEqual({
				id: messageResponse.json().id,
				scheduled: true,
			});
		});

		it("should not show the schedule status message if it does not exist", async () => {
			const inexistentId = randomUUID();

			const response = await server.inject({
				method: "GET",
				url: `/schedules/${inexistentId}`,
			});

			expect(response.statusCode).toBe(404);
			expect(response.json()).toHaveProperty("message", "Message not found");
		});

		it("should return a 400 error if the message ID is not a valid UUID format", async () => {
			const invalidId = "not-a-valid-uuid";

			const response = await server.inject({
				method: "GET",
				url: `/schedules/${invalidId}`,
			});

			expect(response.statusCode).toBe(400);
			expect(response.json()).toEqual(
				expect.objectContaining({
					error: "Bad Request",
					message: "Dados de entrada inválidos.",
					details: expect.any(Array),
				}),
			);
		});
	});
});
