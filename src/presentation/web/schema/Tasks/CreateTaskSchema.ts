import { Static, Type as T } from "@sinclair/typebox";

export const CreateTaskSchema = T.Object({
    title: T.String(),
    description: T.Optional(T.String()),
    dueDate: T.Optional(T.String({ format: "date-time" })),
});
