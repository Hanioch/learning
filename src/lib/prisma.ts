import { PrismaBetterSqlite3 } from "@prisma/adapter-better-sqlite3";
import { PrismaClient } from "@/generated/prisma/client";

/**
 * Client Prisma unique. En développement Next.js recharge les modules à chaque
 * édition : sans ce cache sur `globalThis`, on ouvrirait une connexion SQLite
 * de plus à chaque sauvegarde de fichier.
 */

const DATABASE_URL = process.env.DATABASE_URL ?? "file:./prisma/dev.db";

const createClient = () =>
  new PrismaClient({
    adapter: new PrismaBetterSqlite3({ url: DATABASE_URL }),
  });

const globalForPrisma = globalThis as unknown as {
  prisma?: ReturnType<typeof createClient>;
};

export const prisma = globalForPrisma.prisma ?? createClient();

if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prisma = prisma;
}
