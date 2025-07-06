import { randomUUID } from "node:crypto";
import { beforeEach, describe, expect, it } from "vitest";
import { server } from "@/http/server";
import { dbConnection } from "@/providers/database/connection";

describe("Scheduler GET /schedules/:id", () => {
	beforeEach(async () => {
		await dbConnection.query('DELETE FROM "messages"');
	});

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
