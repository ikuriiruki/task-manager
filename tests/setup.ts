import { beforeAll, afterAll } from "bun:test";
import { prisma } from "../src/infrastructure/orm/prismaClient";

beforeAll(async () => {
	// Connect to test database before running tests
	await prisma.$connect();
});

afterAll(async () => {
	// Clean up database connection after all tests
	await prisma.$disconnect();
});

// Helper function to clean database between tests
export async function cleanupDatabase() {
	// Delete all tasks in reverse order of dependencies
	await prisma.task.deleteMany();
}
