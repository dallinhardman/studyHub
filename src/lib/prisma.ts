import { PrismaClient } from "@/generated/prisma/client";
import { PrismaBetterSqlite3 } from "@prisma/adapter-better-sqlite3";
import path from "path";

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

function createPrismaClient(): PrismaClient {
  // Prisma v7 requires a driver adapter. PrismaBetterSqlite3 wraps better-sqlite3.
  // prisma.config.ts is only for CLI (migrations, studio); runtime uses this adapter.
  const rawUrl = process.env.DATABASE_URL ?? "file:./prisma/dev.db";
  // The adapter expects a file path (without "file:" prefix) or ":memory:"
  const dbPath = rawUrl.startsWith("file:")
    ? path.resolve(process.cwd(), rawUrl.slice("file:".length))
    : rawUrl;

  const adapter = new PrismaBetterSqlite3({ url: dbPath });
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return new PrismaClient({ adapter } as any) as PrismaClient;
}

export const prisma: PrismaClient =
  globalForPrisma.prisma ?? createPrismaClient();

if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prisma = prisma;
}
