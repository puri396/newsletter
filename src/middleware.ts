import NextAuth from "next-auth";
import { authConfig } from "@/auth.config";
import { NextResponse } from "next/server";

const { auth } = NextAuth(authConfig);

export default auth((req) => {
  if (!req.auth) {
    const loginUrl = new URL("/login", req.url);
    loginUrl.searchParams.set("callbackUrl", req.nextUrl.pathname);
    return NextResponse.redirect(loginUrl);
  }
  return NextResponse.next();
});

export const config = {
  matcher: [
    "/dashboard/:path*",
    "/newsletters/:path*",
    "/subscribers/:path*",
    "/analytics/:path*",
    "/settings/:path*",
    "/epic/:path*",
    "/epic",
    "/images/:path*",
    "/images",
    "/api/newsletters/:path*",
    "/api/scheduler/:path*",
    "/api/schedules/:path*",
    "/api/subscribers/:path*",
    "/api/epic/:path*",
    "/api/ai/:path*",
  ],
};
