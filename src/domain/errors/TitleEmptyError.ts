import { DomainError } from "./DomainError";

export class TitleEmptyError extends DomainError {
	public readonly name: string = "TitleEmptyError";

	constructor() {
		super(`Title cannot be empty`);
	}
}
