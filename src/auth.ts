import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/db";
import { authConfig } from "@/auth.config";

interface GoogleUserInfo {
  sub: string;
  email: string;
  name?: string;
  given_name?: string;
  family_name?: string;
  picture?: string;
  email_verified?: boolean;
}

export const { handlers, auth, signIn, signOut } = NextAuth({
  ...authConfig,
  providers: [
    /**
     * Email + password login.
     */
    Credentials({
      id: "credentials",
      name: "credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        const email = credentials?.email as string | undefined;
        const password = credentials?.password as string | undefined;

        if (!email || !password) return null;

        const user = await prisma.user.findUnique({ where: { email } });
        if (!user || !user.hashedPassword) return null;

        const isValid = await bcrypt.compare(password, user.hashedPassword);
        if (!isValid) return null;

        return {
          id: user.id,
          email: user.email,
          name:
            user.name ??
            (`${user.firstName ?? ""} ${user.lastName ?? ""}`.trim() || null),
          image: user.image ?? null,
        };
      },
    }),

    /**
     * Google OAuth via @react-oauth/google (popup flow).
     * The frontend sends an access_token; we verify it against
     * Google's userinfo endpoint and find-or-create the user.
     */
    Credentials({
      id: "google-token",
      name: "google-token",
      credentials: {
        accessToken: { label: "Access Token", type: "text" },
      },
      async authorize(credentials) {
        const accessToken = credentials?.accessToken as string | undefined;
        if (!accessToken) return null;

        // Verify the access token and fetch the user's profile
        const res = await fetch(
          "https://www.googleapis.com/oauth2/v3/userinfo",
          { headers: { Authorization: `Bearer ${accessToken}` } },
        );
        if (!res.ok) return null;

        const googleUser = (await res.json()) as GoogleUserInfo;
        if (!googleUser.email) return null;

        // Find existing user or create a new one
        let user = await prisma.user.findUnique({
          where: { email: googleUser.email },
        });

        if (!user) {
          user = await prisma.user.create({
            data: {
              email: googleUser.email,
              name: googleUser.name ?? null,
              firstName: googleUser.given_name ?? null,
              lastName: googleUser.family_name ?? null,
              image: googleUser.picture ?? null,
              // hashedPassword intentionally null for OAuth users
            },
          });
        } else if (!user.image && googleUser.picture) {
          user = await prisma.user.update({
            where: { id: user.id },
            data: { image: googleUser.picture },
          });
        }

        return {
          id: user.id,
          email: user.email,
          name: user.name ?? null,
          image: user.image ?? null,
        };
      },
    }),
  ],

  session: { strategy: "jwt" },

  pages: {
    signIn: "/login",
  },

  callbacks: {
    async jwt({ token, user }) {
      if (user?.email) {
        const dbUser = await prisma.user.findUnique({
          where: { email: user.email },
        });
        if (dbUser) {
          token.userId = dbUser.id;
        }
      }
      return token;
    },

    async session({ session, token }) {
      if (token.userId && session.user) {
        (session.user as typeof session.user & { userId: string }).userId =
          token.userId as string;
      }
      return session;
    },
  },
});
