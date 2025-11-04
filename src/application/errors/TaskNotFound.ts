import { ApplicationError } from "./ApplicationError";

export class TaskNotFound extends ApplicationError {
    public readonly name: string = "TaskNotFound";
    status = 404;

    constructor() {
        super(`Task not found`);
    }
}
