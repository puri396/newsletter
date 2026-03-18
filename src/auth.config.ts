/**
 * Edge-safe Auth.js configuration for Next.js Middleware.
 *
 * IMPORTANT: This file must NOT import any Node.js-only modules
 * (Prisma, bcrypt, etc.) because Next.js Middleware runs on the
 * Edge Runtime which does not have access to node:process,
 * node:path, native addons, etc.
 *
 * The full auth config (with Prisma callbacks) lives in src/auth.ts
 * and is used only in server-side contexts (API routes, Server Components).
 */
import type { NextAuthConfig } from "next-auth";

export const authConfig = {
  pages: {
    signIn: "/login",
  },
  callbacks: {
    authorized({ auth }) {
      // Simply check that a valid session (JWT) exists.
      // Heavy DB lookups happen only in the full auth.ts jwt/session callbacks.
      return !!auth?.user;
    },
  },
  // No providers here — providers are registered in the full auth.ts.
  providers: [],
} satisfies NextAuthConfig;
