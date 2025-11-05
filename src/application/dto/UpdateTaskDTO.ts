export interface UpdateTaskDTO {
    title?: string;
    description?: string;
    dueDate?: string;
    status?: "pending" | "completed";
}
