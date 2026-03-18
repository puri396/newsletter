import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

function html(title: string, body: string) {
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width,initial-scale=1">
  <title>${title}</title>
  <style>
    *{box-sizing:border-box;margin:0;padding:0}
    body{font-family:system-ui,-apple-system,sans-serif;background:#0f172a;color:#e2e8f0;min-height:100vh;display:flex;align-items:center;justify-content:center;padding:1.5rem}
    .card{background:#1e293b;border:1px solid #334155;border-radius:1rem;padding:2.5rem 2rem;max-width:26rem;width:100%;text-align:center}
    h1{font-size:1.25rem;font-weight:600;margin-bottom:.75rem;color:#f1f5f9}
    p{font-size:.875rem;color:#94a3b8;line-height:1.6;margin-bottom:1rem}
    .btn{display:inline-block;background:#7c3aed;color:#fff;font-size:.875rem;font-weight:500;padding:.625rem 1.5rem;border-radius:.5rem;border:none;cursor:pointer;text-decoration:none;transition:background .15s}
    .btn:hover{background:#6d28d9}
    .btn-ghost{background:transparent;border:1px solid #475569;color:#94a3b8;margin-top:.5rem}
    .btn-ghost:hover{background:#1e293b;color:#e2e8f0}
    .icon{font-size:2.5rem;margin-bottom:1rem}
  </style>
</head>
<body>
  <div class="card">${body}</div>
</body>
</html>`;
}

const PAGE_CONFIRM = (subscriberId: string) =>
  html(
    "Unsubscribe",
    `<div class="icon">✉️</div>
    <h1>Confirm unsubscribe</h1>
    <p>Click the button below to stop receiving newsletters from us. This cannot be undone from this link.</p>
    <form method="POST" action="/api/unsubscribe">
      <input type="hidden" name="subscriberId" value="${subscriberId}" />
      <button type="submit" class="btn">Yes, unsubscribe me</button>
    </form>
    <br/>
    <a href="/" class="btn btn-ghost">Cancel — keep me subscribed</a>`,
  );

const PAGE_SUCCESS = html(
  "Unsubscribed",
  `<div class="icon">👋</div>
  <h1>You have been unsubscribed</h1>
  <p>You will no longer receive newsletters from us. Sorry to see you go!</p>
  <a href="/" class="btn btn-ghost">Return to home</a>`,
);

const PAGE_NOT_FOUND = html(
  "Not found",
  `<div class="icon">🔍</div>
  <h1>Link not found</h1>
  <p>This unsubscribe link may have expired or is invalid.</p>
  <a href="/" class="btn btn-ghost">Return to home</a>`,
);

const PAGE_ALREADY = html(
  "Already unsubscribed",
  `<div class="icon">✅</div>
  <h1>Already unsubscribed</h1>
  <p>You are already unsubscribed and will not receive any more emails from us.</p>
  <a href="/" class="btn btn-ghost">Return to home</a>`,
);

/** GET — show a confirmation page so security scanners don't accidentally unsubscribe users */
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const subscriberId = searchParams.get("subscriberId")?.trim();

  if (!subscriberId) {
    return new NextResponse(PAGE_NOT_FOUND, {
      status: 404,
      headers: { "Content-Type": "text/html; charset=utf-8" },
    });
  }

  try {
    const subscriber = await prisma.subscriber.findUnique({
      where: { id: subscriberId },
      select: { id: true, status: true },
    });

    if (!subscriber) {
      return new NextResponse(PAGE_NOT_FOUND, {
        status: 404,
        headers: { "Content-Type": "text/html; charset=utf-8" },
      });
    }

    if (subscriber.status === "unsubscribed") {
      return new NextResponse(PAGE_ALREADY, {
        status: 200,
        headers: { "Content-Type": "text/html; charset=utf-8" },
      });
    }

    return new NextResponse(PAGE_CONFIRM(subscriberId), {
      status: 200,
      headers: { "Content-Type": "text/html; charset=utf-8" },
    });
  } catch {
    return new NextResponse(PAGE_NOT_FOUND, {
      status: 500,
      headers: { "Content-Type": "text/html; charset=utf-8" },
    });
  }
}

/** POST — perform the actual unsubscribe after user confirms */
export async function POST(request: Request) {
  let subscriberId: string | null = null;

  try {
    const contentType = request.headers.get("content-type") ?? "";
    if (contentType.includes("application/json")) {
      const body = (await request.json()) as { subscriberId?: string };
      subscriberId = body.subscriberId ?? null;
    } else {
      // HTML form submission
      const form = await request.formData();
      subscriberId = (form.get("subscriberId") as string | null) ?? null;
    }
  } catch {
    /* ignore parse errors */
  }

  if (!subscriberId?.trim()) {
    return new NextResponse(PAGE_NOT_FOUND, {
      status: 400,
      headers: { "Content-Type": "text/html; charset=utf-8" },
    });
  }

  try {
    const subscriber = await prisma.subscriber.findUnique({
      where: { id: subscriberId },
      select: { id: true, status: true },
    });

    if (!subscriber) {
      return new NextResponse(PAGE_NOT_FOUND, {
        status: 404,
        headers: { "Content-Type": "text/html; charset=utf-8" },
      });
    }

    if (subscriber.status !== "unsubscribed") {
      await prisma.subscriber.update({
        where: { id: subscriberId },
        data: { status: "unsubscribed", unsubscribedAt: new Date() },
      });
    }

    return new NextResponse(PAGE_SUCCESS, {
      status: 200,
      headers: { "Content-Type": "text/html; charset=utf-8" },
    });
  } catch {
    return new NextResponse(PAGE_NOT_FOUND, {
      status: 500,
      headers: { "Content-Type": "text/html; charset=utf-8" },
    });
  }
}
