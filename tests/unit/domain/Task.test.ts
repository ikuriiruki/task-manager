import { describe, it, expect, beforeEach } from "bun:test";
import { Task } from "@domain/entities/Task";
import { DueDate } from "@domain/value-objects/DueDate";
import { TitleEmptyError } from "@domain/errors/TitleEmptyError";
import { PastDueDateError } from "@domain/errors/PastDueDateError";
import { InvalidDueDateError } from "@domain/errors/InvalidDueDateError";

describe("Task Entity", () => {
	it("should create a task with valid data", () => {
		const task = new Task(
			"123e4567-e89b-12d3-a456-426614174000",
			"Test Task",
			"Test Description"
		);

		expect(task.id).toBe("123e4567-e89b-12d3-a456-426614174000");
		expect(task.title).toBe("Test Task");
		expect(task.description).toBe("Test Description");
		expect(task.status).toBe("pending");
		expect(task.dueDate).toBeUndefined();
	});

	it("should create a task with due date", () => {
		const futureDate = new Date();
		futureDate.setDate(futureDate.getDate() + 1);
		const dueDate = new DueDate(futureDate);

		const task = new Task(
			"123e4567-e89b-12d3-a456-426614174000",
			"Test Task",
			undefined,
			dueDate
		);

		expect(task.dueDate).toEqual(dueDate);
	});

	it("should return false for isDueSoon when no due date", () => {
		const task = new Task("123", "Test Task");
		expect(task.isDueSoon()).toBe(false);
	});

	it("should return true for isDueSoon when due date is within 24 hours", () => {
		const futureDate = new Date();
		futureDate.setHours(futureDate.getHours() + 12); // 12 hours from now
		const dueDate = new DueDate(futureDate);

		const task = new Task("123", "Test Task", undefined, dueDate);
		expect(task.isDueSoon()).toBe(true);
	});

	it("should return false for isDueSoon when due date is more than 24 hours away", () => {
		const futureDate = new Date();
		futureDate.setDate(futureDate.getDate() + 2); // 2 days from now
		const dueDate = new DueDate(futureDate);

		const task = new Task("123", "Test Task", undefined, dueDate);
		expect(task.isDueSoon()).toBe(false);
	});

	it("should update task title", () => {
		const task = new Task("123", "Old Title");
		task.update({ title: "New Title" });

		expect(task.title).toBe("New Title");
	});

	it("should throw TitleEmptyError when updating with empty title", () => {
		const task = new Task("123", "Old Title");

		expect(() => {
			task.update({ title: "" });
		}).toThrow(TitleEmptyError);
	});

	it("should throw TitleEmptyError when updating with whitespace title", () => {
		const task = new Task("123", "Old Title");

		expect(() => {
			task.update({ title: "   " });
		}).toThrow(TitleEmptyError);
	});

	it("should update task description", () => {
		const task = new Task("123", "Test Task", "Old Description");
		task.update({ description: "New Description" });

		expect(task.description).toBe("New Description");
	});

	it("should update task due date", () => {
		const task = new Task("123", "Test Task");
		const futureDate = new Date();
		futureDate.setDate(futureDate.getDate() + 1);

		task.update({ dueDate: futureDate });

		expect(task.dueDate?.date).toEqual(futureDate);
	});

	it("should update task status", () => {
		const task = new Task("123", "Test Task");
		task.update({ status: "completed" });

		expect(task.status).toBe("completed");
	});

	it("should update multiple fields at once", () => {
		const task = new Task("123", "Old Title", "Old Description");
		const futureDate = new Date();
		futureDate.setDate(futureDate.getDate() + 1);

		task.update({
			title: "New Title",
			description: "New Description",
			dueDate: futureDate,
			status: "completed",
		});

		expect(task.title).toBe("New Title");
		expect(task.description).toBe("New Description");
		expect(task.dueDate?.date).toEqual(futureDate);
		expect(task.status).toBe("completed");
	});
});

describe("DueDate Value Object", () => {
	it("should create DueDate from Date object", () => {
		const futureDate = new Date();
		futureDate.setDate(futureDate.getDate() + 1);
		const dueDate = new DueDate(futureDate);

		expect(dueDate.date).toEqual(futureDate);
	});

	it("should create DueDate from string", () => {
		const dateString = new Date(
			new Date().getTime() + 86400000
		).toISOString(); // 1 day in future
		const dueDate = new DueDate(dateString);

		expect(dueDate.date).toEqual(new Date(dateString));
	});

	it("should throw InvalidDueDateError for invalid date string", () => {
		expect(() => {
			new DueDate("invalid-date");
		}).toThrow(InvalidDueDateError);
	});

	it("should throw PastDueDateError for past date", () => {
		const pastDate = new Date();
		pastDate.setDate(pastDate.getDate() - 1);

		expect(() => {
			new DueDate(pastDate);
		}).toThrow(PastDueDateError);
	});

	it("should return ISO string representation", () => {
		const futureDate = new Date();
		futureDate.setDate(futureDate.getDate() + 1);
		const dueDate = new DueDate(futureDate);

		expect(dueDate.toString()).toBe(futureDate.toISOString());
	});

	it("should return true for equal dates", () => {
		const futureDate = new Date();
		futureDate.setDate(futureDate.getDate() + 1);
		const dueDate1 = new DueDate(futureDate);
		const dueDate2 = new DueDate(futureDate);

		expect(dueDate1.equals(dueDate2)).toBe(true);
	});

	it("should return false for different dates", () => {
		const date1 = new Date();
		date1.setDate(date1.getDate() + 1);
		const date2 = new Date();
		date2.setDate(date2.getDate() + 2);

		const dueDate1 = new DueDate(date1);
		const dueDate2 = new DueDate(date2);

		expect(dueDate1.equals(dueDate2)).toBe(false);
	});
});
