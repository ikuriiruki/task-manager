export class ApplicationError extends Error {
	public readonly name: string = "ApplicationError";

	constructor(message: string) {
		super(message);
		Object.setPrototypeOf(this, new.target.prototype);
	}
}
