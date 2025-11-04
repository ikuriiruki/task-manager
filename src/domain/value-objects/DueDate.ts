import { InvalidDueDateError } from "@domain/errors/InvalidDueDateError";
import { PastDueDateError } from "@domain/errors/PastDueDateError";

export class DueDate {
	private readonly value: Date;

	constructor(value: string | Date) {
		const date = value instanceof Date ? value : new Date(value);

		if (isNaN(date.getTime())) {
			throw new InvalidDueDateError(value);
		}

		if (date.getTime() < Date.now()) {
			throw new PastDueDateError(date);
		}

		this.value = new Date(date);
	}

	static fromString(str: string) {
		return new DueDate(new Date(str));
	}

	get date(): Date {
		return new Date(this.value); // copy
	}

	isDueSoon(): boolean {
		const diff = this.value.getTime() - Date.now();
		return diff <= 24 * 60 * 60 * 1000; // 24 hours
	}

	toString(): string {
		return this.value.toISOString();
	}

	equals(other: DueDate): boolean {
		return this.value.getTime() === other.value.getTime();
	}
}
