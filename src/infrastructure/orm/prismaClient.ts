// src/infrastructure/orm/prismaClient.ts
import { config } from "@infrastructure/config";
import { PrismaClient } from "@prisma/client";

export const prisma = new PrismaClient({
	datasources: { db: { url: config.databaseUrl } },
});
