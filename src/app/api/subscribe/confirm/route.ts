import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

const APP_URL =
  process.env.APP_URL?.replace(/\/$/, "") ??
  process.env.NEXT_PUBLIC_APP_URL?.replace(/\/$/, "") ??
  "http://localhost:3000";

const HTML_SUCCESS = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width,initial-scale=1">
  <title>Subscribed!</title>
  <meta http-equiv="refresh" content="4;url=${APP_URL}/subscribe?confirmed=true">
  <style>
    *{box-sizing:border-box;margin:0;padding:0}
    body{font-family:system-ui,-apple-system,sans-serif;background:#0f172a;color:#e2e8f0;min-height:100vh;display:flex;align-items:center;justify-content:center;padding:1.5rem;text-align:center}
    .card{background:#1e293b;border:1px solid #334155;border-radius:1rem;padding:2.5rem 2rem;max-width:26rem;width:100%}
    h1{font-size:1.25rem;font-weight:600;margin-bottom:.75rem;color:#f1f5f9}
    p{font-size:.875rem;color:#94a3b8;line-height:1.6}
    .icon{font-size:2.5rem;margin-bottom:1rem}
  </style>
</head>
<body>
  <div class="card">
    <div class="icon">🎉</div>
    <h1>You&apos;re subscribed!</h1>
    <p>Your email has been confirmed. You&apos;ll receive our next newsletter. Redirecting you now…</p>
  </div>
</body>
</html>`;

const HTML_INVALID = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width,initial-scale=1">
  <title>Link expired</title>
  <style>
    *{box-sizing:border-box;margin:0;padding:0}
    body{font-family:system-ui,-apple-system,sans-serif;background:#0f172a;color:#e2e8f0;min-height:100vh;display:flex;align-items:center;justify-content:center;padding:1.5rem;text-align:center}
    .card{background:#1e293b;border:1px solid #334155;border-radius:1rem;padding:2.5rem 2rem;max-width:26rem;width:100%}
    h1{font-size:1.25rem;font-weight:600;margin-bottom:.75rem;color:#f1f5f9}
    p{font-size:.875rem;color:#94a3b8;line-height:1.6;margin-bottom:1rem}
    a{color:#22d3ee}
  </style>
</head>
<body>
  <div class="card">
    <div style="font-size:2.5rem;margin-bottom:1rem">🔗</div>
    <h1>Link expired</h1>
    <p>This confirmation link has expired or is invalid.</p>
    <p><a href="${APP_URL}/subscribe">Subscribe again</a></p>
  </div>
</body>
</html>`;

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const token = searchParams.get("token")?.trim();

  if (!token) {
    return new NextResponse(HTML_INVALID, {
      status: 400,
      headers: { "Content-Type": "text/html; charset=utf-8" },
    });
  }

  const subscriber = await prisma.subscriber.findUnique({
    where: { confirmToken: token },
    select: { id: true, status: true, confirmSentAt: true },
  });

  if (!subscriber) {
    return new NextResponse(HTML_INVALID, {
      status: 404,
      headers: { "Content-Type": "text/html; charset=utf-8" },
    });
  }

  // Check 48h expiry
  const TWO_DAYS_MS = 48 * 60 * 60 * 1000;
  if (
    subscriber.confirmSentAt &&
    Date.now() - subscriber.confirmSentAt.getTime() > TWO_DAYS_MS
  ) {
    return new NextResponse(HTML_INVALID, {
      status: 410,
      headers: { "Content-Type": "text/html; charset=utf-8" },
    });
  }

  // Activate subscriber and clear the token
  await prisma.subscriber.update({
    where: { id: subscriber.id },
    data: { status: "active", confirmToken: null },
  });

  return new NextResponse(HTML_SUCCESS, {
    status: 200,
    headers: { "Content-Type": "text/html; charset=utf-8" },
  });
}
