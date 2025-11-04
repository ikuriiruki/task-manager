import { ITaskRepository } from "@domain/repositories/ITaskRepository";
import { Task as TaskEntity } from "@domain/entities/Task";
import { prisma } from "@infrastructure/orm/prismaClient";
import { DueDate } from "@domain/value-objects/DueDate";

export class TaskRepository implements ITaskRepository {
	async create(task: TaskEntity): Promise<TaskEntity> {
		const created = await prisma.task.create({
			data: {
				id: task.id,
				title: task.title,
				description: task.description,
				dueDate: task.dueDate?.date,
				status: task.status,
			},
		});

		return new TaskEntity(
			created.id,
			created.title,
			created.description ?? undefined,
			created.dueDate ? new DueDate(created.dueDate) : undefined,
			created.status as "pending" | "completed"
		);
	}

	async findById(id: string): Promise<TaskEntity | null> {
		const task = await prisma.task.findFirst({ where: { id } });
		if (!task) return null;

		return new TaskEntity(
			task.id,
			task.title,
			task.description ?? undefined,
			task.dueDate ? new DueDate(task.dueDate) : undefined,
			task.status as "pending" | "completed"
		);
	}
	async findAll(filter?: { status?: string }): Promise<TaskEntity[]> {
		const tasks = await prisma.task.findMany({
			where: filter?.status ? { status: filter.status } : undefined,
		});

		return tasks.map(
			(t) =>
				new TaskEntity(
					t.id,
					t.title,
					t.description ?? undefined,
					t.dueDate ? new DueDate(t.dueDate) : undefined,
					t.status as "pending" | "completed"
				)
		);
	}

	async update(task: TaskEntity): Promise<TaskEntity> {
		const updated = await prisma.task.update({
			where: { id: task.id },
			data: {
				id: task.id,
				title: task.title,
				description: task.description,
				dueDate: task.dueDate?.date,
				status: task.status,
			},
		});

		return new TaskEntity(
			updated.id,
			updated.title,
			updated.description ?? undefined,
			updated.dueDate ? new DueDate(updated.dueDate) : undefined,
			updated.status as "pending" | "completed"
		);
	}

	async delete(id: string): Promise<void> {
		const task = await prisma.task.findFirst({ where: { id } });
		if (!task) return;

		await prisma.task.delete({ where: { id } });
	}
}
