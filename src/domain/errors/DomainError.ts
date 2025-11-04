export class DomainError extends Error {
	public readonly name: string = "DomainError";

	constructor(message: string) {
		super(message);
		Object.setPrototypeOf(this, new.target.prototype);
	}
}
