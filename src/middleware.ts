import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

const ADMIN_SECRET_HEADER = "x-admin-secret";

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Only guard basic admin surfaces for now. This can be replaced by
  // a full authentication solution (e.g. NextAuth) later.
  const isAdminRoute =
    pathname.startsWith("/dashboard") ||
    pathname.startsWith("/newsletters") ||
    pathname.startsWith("/subscribers") ||
    pathname.startsWith("/analytics") ||
    pathname.startsWith("/api/newsletters") ||
    pathname.startsWith("/api/scheduler") ||
    pathname.startsWith("/api/schedules") ||
    pathname.startsWith("/api/subscribers") ||
    pathname.startsWith("/api/ai");

  if (!isAdminRoute) {
    return NextResponse.next();
  }

  const expectedSecret = process.env.ADMIN_SECRET;

  // If no admin secret is configured, we do not block access. This keeps
  // local development simple while still allowing protection in deployed
  // environments.
  if (!expectedSecret) {
    return NextResponse.next();
  }

  const providedSecret = request.headers.get(ADMIN_SECRET_HEADER);

  if (!providedSecret || providedSecret !== expectedSecret) {
    return new NextResponse("Unauthorized", { status: 401 });
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/dashboard/:path*", "/newsletters/:path*", "/subscribers/:path*", "/analytics/:path*", "/api/newsletters/:path*", "/api/scheduler/:path*", "/api/schedules/:path*", "/api/subscribers/:path*", "/api/ai/:path*"],
};

