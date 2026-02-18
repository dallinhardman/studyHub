import { PrismaClient } from "@/generated/prisma/client";

// Prevent multiple Prisma Client instances during Next.js hot-reload in dev.
// Config (datasource URL, etc.) is read from prisma.config.ts at runtime.
const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

// Prisma v7 TS types require adapter/accelerateUrl, but SQLite uses prisma.config.ts
// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-expect-error -- local SQLite connection configured via prisma.config.ts
export const prisma: PrismaClient = globalForPrisma.prisma ?? new PrismaClient();

if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prisma = prisma;
}
