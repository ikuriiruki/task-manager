import { Static, Type as T } from "@sinclair/typebox";

export const UpdateTaskDTO = T.Object({
	title: T.Optional(T.String()),
	description: T.Optional(T.String()),
	dueDate: T.Optional(T.Date()),
	status: T.Optional(T.Enum({ pending: "pending", completed: "completed" })),
});

export type UpdateTaskDTOType = Static<typeof UpdateTaskDTO>;
