import { TitleEmptyError } from "@domain/errors/TitleEmptyError";
import { DueDate } from "@domain/value-objects/DueDate";

type TaskUpdateProps = {
	title?: string;
	description?: string;
	dueDate?: Date;
	status?: "pending" | "completed";
};

export class Task {
	constructor(
		public id: string, // uuid
		public title: string,
		public description?: string,
		public dueDate?: DueDate,
		public status: "pending" | "completed" = "pending"
	) {}

	isDueSoon(): boolean {
		return this.dueDate?.isDueSoon() ?? false;
	}

	update(props: TaskUpdateProps) {
		if (props.title !== undefined) {
			if (!props.title.trim()) throw new TitleEmptyError();
			this.title = props.title;
		}

		if (props.description !== undefined) {
			this.description = props.description;
		}

		if (props.dueDate !== undefined) {
			this.dueDate = new DueDate(props.dueDate);
		}

		if (props.status !== undefined) {
			this.status = props.status;
		}
	}
}
