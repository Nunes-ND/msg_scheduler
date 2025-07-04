export class DuplicateScheduleError extends Error {
	constructor() {
		super("This message has already been scheduled.");
	}
}

export class InvalidSchedulingDateError extends Error {
	constructor() {
		super("Cannot schedule a message for a past date.");
	}
}
