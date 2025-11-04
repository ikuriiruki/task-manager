import { DomainError } from "./DomainError";

export class PastDueDateError extends DomainError {
	public readonly name: string = "PastDueDateError";

	constructor(date: Date) {
		super(
			`Invalid due date: ${date.toISOString()} (cannot be in the past)`
		);
	}
}
