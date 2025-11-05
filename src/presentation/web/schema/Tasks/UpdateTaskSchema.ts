import { Type as T } from "@sinclair/typebox";

export const UpdateTaskSchema = T.Object({
    title: T.Optional(T.String()),
    description: T.Optional(T.String()),
    dueDate: T.Optional(T.String({ format: "date-time" })),
    status: T.Optional(T.Enum({ pending: "pending", completed: "completed" })),
});
