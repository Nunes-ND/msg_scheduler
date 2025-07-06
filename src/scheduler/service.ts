import type { Pool } from "pg";
import { dbConnection } from "@/providers/database/connection";
import {
	DuplicateScheduleError,
	InvalidSchedulingDateError,
	MessageNotFoundError,
} from "./errors";

export type MessagePayload = {
	messageType: string;
	message: string;
	recipient: string;
	schedulingDate: string;
};

export type ScheduledMessage = MessagePayload & {
	id: string;
	scheduled: boolean;
};

class SchedulerService {
	private readonly dbConnection: Pool;
	private static instance: SchedulerService;

	private constructor() {
		this.dbConnection = dbConnection;
	}

	public static getInstance(): SchedulerService {
		if (!SchedulerService.instance) {
			SchedulerService.instance = new SchedulerService();
		}
		return SchedulerService.instance;
	}

	async create(newMessage: MessagePayload): Promise<ScheduledMessage> {
		if (new Date(newMessage.schedulingDate) < new Date()) {
			throw new InvalidSchedulingDateError();
		}

		const { messageType, message, recipient, schedulingDate } = newMessage;
		const client = await this.dbConnection.connect();

		try {
			const alreadyScheduled = await client.query(
				`SELECT 1 FROM messages
         WHERE recipient = $1
         AND message = $2
         AND "messageType" = $3
         AND "schedulingDate" = $4
         LIMIT 1`,
				[recipient, message, messageType, schedulingDate],
			);

			if (alreadyScheduled.rowCount && alreadyScheduled.rowCount > 0) {
				throw new DuplicateScheduleError();
			}

			const result = await client.query(
				`INSERT INTO messages ("messageType", message, recipient, "schedulingDate", scheduled)
         VALUES ($1, $2, $3, $4, $5)
         RETURNING *`,
				[messageType, message, recipient, schedulingDate, true],
			);

			const createdMessage = result.rows[0];

			const scheduledMessage: ScheduledMessage = {
				...createdMessage,
				schedulingDate: new Date(createdMessage.schedulingDate).toISOString(),
			};

			return scheduledMessage;
		} finally {
			client.release();
		}
	}

	async showStatus(id: string): Promise<ScheduledMessage> {
		const client = await this.dbConnection.connect();

		try {
			const result = await client.query(
				`SELECT * FROM messages WHERE id = $1 LIMIT 1`,
				[id],
			);

			if (!result.rows[0]) {
				throw new MessageNotFoundError();
			}

			return result.rows[0];
		} finally {
			client.release();
		}
	}
}

export const schedulerService = SchedulerService.getInstance();
