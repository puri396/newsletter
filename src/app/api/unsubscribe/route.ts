import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

const HTML_OK = `<!DOCTYPE html>
<html lang="en">
<head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>Unsubscribed</title></head>
<body style="font-family:system-ui,sans-serif;max-width:32rem;margin:4rem auto;padding:1rem;color:#333;">
  <h1 style="font-size:1.25rem;">You have been unsubscribed</h1>
  <p>You will no longer receive newsletters from us.</p>
  <p><a href="/" style="color:#2563eb;">Return to home</a></p>
</body>
</html>`;

const HTML_NOT_FOUND = `<!DOCTYPE html>
<html lang="en">
<head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>Not found</title></head>
<body style="font-family:system-ui,sans-serif;max-width:32rem;margin:4rem auto;padding:1rem;color:#333;">
  <h1 style="font-size:1.25rem;">Subscriber not found</h1>
  <p>This link may have expired or is invalid.</p>
  <p><a href="/" style="color:#2563eb;">Return to home</a></p>
</body>
</html>`;

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const subscriberId = searchParams.get("subscriberId")?.trim();

  if (!subscriberId) {
    return new NextResponse(HTML_NOT_FOUND, {
      status: 404,
      headers: { "Content-Type": "text/html; charset=utf-8" },
    });
  }

  try {
    const subscriber = await prisma.subscriber.findUnique({
      where: { id: subscriberId },
    });

    if (!subscriber) {
      return new NextResponse(HTML_NOT_FOUND, {
        status: 404,
        headers: { "Content-Type": "text/html; charset=utf-8" },
      });
    }

    await prisma.subscriber.update({
      where: { id: subscriberId },
      data: {
        status: "unsubscribed",
        unsubscribedAt: new Date(),
      },
    });

    return new NextResponse(HTML_OK, {
      status: 200,
      headers: { "Content-Type": "text/html; charset=utf-8" },
    });
  } catch {
    return new NextResponse(HTML_NOT_FOUND, {
      status: 404,
      headers: { "Content-Type": "text/html; charset=utf-8" },
    });
  }
}
