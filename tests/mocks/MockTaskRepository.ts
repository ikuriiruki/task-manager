import { ITaskRepository } from "../../src/domain/repositories/ITaskRepository";
import { Task } from "../../src/domain/entities/Task";

export class MockTaskRepository implements ITaskRepository {
	private tasks: Map<string, Task> = new Map();

	async create(task: Task): Promise<Task> {
		this.tasks.set(task.id, task);
		return task;
	}

	async findAll(filter?: { status?: string }): Promise<Task[]> {
		let tasks = Array.from(this.tasks.values());

		if (filter?.status) {
			tasks = tasks.filter((task) => task.status === filter.status);
		}

		return tasks;
	}

	async findById(id: string): Promise<Task | null> {
		return this.tasks.get(id) || null;
	}

	async update(task: Task): Promise<Task> {
		this.tasks.set(task.id, task);
		return task;
	}

	async delete(id: string): Promise<void> {
		this.tasks.delete(id);
	}

	// Helper method for testing
	clear(): void {
		this.tasks.clear();
	}

	// Helper method for testing
	getTaskCount(): number {
		return this.tasks.size;
	}
}
