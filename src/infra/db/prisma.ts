import { PrismaClient } from "@/prisma-client/client";

declare global {
  // eslint-disable-next-line no-var
  var prisma: PrismaClient | undefined;
}

// #region agent log
if (typeof process !== "undefined" && process.env?.NODE_ENV !== "production") {
  const payload = { location: "infra/db/prisma.ts", message: "DB env check", data: { hasDatabaseUrl: !!process.env.DATABASE_URL }, timestamp: Date.now(), hypothesisId: "DB_ENV" };
  fetch("http://127.0.0.1:7242/ingest/dc9832e8-40a3-44b8-8016-93b3fd8621c8", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(payload) }).catch(() => {});
  try { require("fs").appendFileSync("f:\\newletter-orion\\.cursor\\debug.log", JSON.stringify(payload) + "\n"); } catch (_) { /* no-op */ }
}
// #endregion

const prismaClient = global.prisma ?? new PrismaClient();

if (process.env.NODE_ENV !== "production") {
  global.prisma = prismaClient;
}

export { prismaClient as prisma };

