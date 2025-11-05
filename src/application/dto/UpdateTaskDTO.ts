import { Static, Type as T } from "@sinclair/typebox";

export interface UpdateTaskDTO {
    title?: string;
    description?: string;
    dueDate?: string;
    status?: "pending" | "completed";
}
