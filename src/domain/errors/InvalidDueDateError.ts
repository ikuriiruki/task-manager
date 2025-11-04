import { DomainError } from "./DomainError";

export class InvalidDueDateError extends DomainError {
	public readonly name: string = "InvalidDueDateError";

	constructor(value: any) {
		super(`Invalid due date value: ${value}`);
	}
}
