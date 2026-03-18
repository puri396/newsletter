import { PrismaClient } from "@/prisma-client/client";

// Reuse a single PrismaClient instance across hot-reloads in development to
// prevent exhausting the Neon connection pool. In production, a fresh instance
// is created per serverless invocation (Next.js handles lifecycle).

const SOFT_DELETE_MODELS = ["Newsletter", "Schedule", "EmailLog"];
const READ_OPERATIONS = ["findUnique", "findFirst", "findMany", "count", "aggregate"];

function makePrismaClient() {
  return new PrismaClient().$extends({
    query: {
      $allModels: {
        /**
         * Automatically append `deletedAt: null` to all read queries on models
         * that support soft-delete. Callers that explicitly pass `deletedAt` in
         * their `where` clause bypass this guard.
         *
         * Uses `$allOperations` — the Prisma v5/v6 replacement for `$use`.
         */
        async $allOperations({
          model,
          operation,
          args,
          query,
        }: {
          model: string;
          operation: string;
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          args: any;
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          query: (args: any) => Promise<any>;
        }) {
          if (
            SOFT_DELETE_MODELS.includes(model) &&
            READ_OPERATIONS.includes(operation)
          ) {
            const where = (args?.where ?? {}) as Record<string, unknown>;
            // Only inject the filter if the caller hasn't touched deletedAt
            if (!("deletedAt" in where)) {
              return query({ ...args, where: { ...where, deletedAt: null } });
            }
          }
          return query(args);
        },
      },
    },
  });
}

type ExtendedPrismaClient = ReturnType<typeof makePrismaClient>;

declare global {
  // eslint-disable-next-line no-var
  var prisma: ExtendedPrismaClient | undefined;
}

const prismaClient = global.prisma ?? makePrismaClient();

if (process.env.NODE_ENV !== "production") {
  global.prisma = prismaClient;
}

export { prismaClient as prisma };
