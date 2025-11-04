import { Static, Type as T } from "@sinclair/typebox";

export const CreateTaskDTO = T.Object({
	title: T.String(),
	description: T.Optional(T.String()),
	dueDate: T.Optional(T.String({ format: "date-time" })),
});

export type CreateTaskDTOType = Static<typeof CreateTaskDTO>;
