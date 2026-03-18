"use client";

import { SessionProvider as NextAuthSessionProvider } from "next-auth/react";
import { GoogleOAuthProvider } from "@react-oauth/google";

const GOOGLE_CLIENT_ID = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID ?? "";

export function SessionProvider({ children }: { children: React.ReactNode }) {
  // Only mount GoogleOAuthProvider when a real client ID is configured.
  // Without it the provider throws "Missing required parameter client_id."
  if (!GOOGLE_CLIENT_ID) {
    return (
      <NextAuthSessionProvider>
        {children}
      </NextAuthSessionProvider>
    );
  }

  return (
    <NextAuthSessionProvider>
      <GoogleOAuthProvider clientId={GOOGLE_CLIENT_ID}>
        {children}
      </GoogleOAuthProvider>
    </NextAuthSessionProvider>
  );
}

export { GOOGLE_CLIENT_ID };
