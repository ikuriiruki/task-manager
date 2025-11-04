import { CreateTaskDTOType } from "@application/dto/CreateTaskDTO";
import { UpdateTaskDTOType } from "@application/dto/UpdateTaskDTO";
import { TaskNotFound } from "@application/errors/TaskNotFound";
import { INotifier } from "@application/interfaces/INotifier";
import { Task } from "@domain/entities/Task";
import { ITaskRepository } from "@domain/repositories/ITaskRepository";
import { DueDate } from "@domain/value-objects/DueDate";

export class TaskService {
    constructor(
        private taskRepo: ITaskRepository,
        private notifier: INotifier
    ) {}

    async create(dto: CreateTaskDTOType) {
        const dueDateVO = dto.dueDate ? new DueDate(dto.dueDate) : undefined;

        const task = new Task(
            crypto.randomUUID(),
            dto.title,
            dto.description,
            dueDateVO
        );

        const created = await this.taskRepo.create(task);

        if (created.dueDate && created.isDueSoon()) {
            const payload = {
                type: "due_soon",
                taskId: created.id,
                title: created.title,
                dueDate: created.dueDate?.toString(),
            };

            await this.notifier?.enqueue(payload);
        }

        return {
            id: created.id,
            title: created.title,
            description: created.description,
            dueDate: created.dueDate?.toString(),
            status: created.status,
        };
    }

    async list(filter?: { status?: string }) {
        const tasks = await this.taskRepo.findAll(filter);
        return tasks.map((task) => ({
            id: task.id,
            title: task.title,
            description: task.description,
            dueDate: task.dueDate?.toString(),
            status: task.status,
        }));
    }

    async get(id: string) {
        const task = await this.taskRepo.findById(id);
        if (!task) throw new TaskNotFound();
        return {
            id: task.id,
            title: task.title,
            description: task.description,
            dueDate: task.dueDate?.toString(),
            status: task.status,
        };
    }

    async update(id: string, dto: UpdateTaskDTOType) {
        const task = await this.taskRepo.findById(id);
        if (!task) throw new TaskNotFound();

        task.update(dto);

        const updated = await this.taskRepo.update(task);

        if (updated.dueDate && updated.isDueSoon()) {
            const payload = {
                type: "due_soon",
                taskId: updated.id,
                title: updated.title,
                dueDate: updated.dueDate?.toString(),
            };

            await this.notifier?.enqueue(payload);
        }

        return {
            id: updated.id,
            title: updated.title,
            description: updated.description,
            dueDate: updated.dueDate?.toString(),
            status: updated.status,
        };
    }

    async delete(id: string) {
        return await this.taskRepo.delete(id);
    }
}
