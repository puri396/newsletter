import { NextResponse } from "next/server";
import { renderNewsletterToHtml } from "@/lib/email/render-newsletter";
import { resendProvider, getFromEmail } from "@/lib/email/provider-resend";

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

// Simple in-memory rate limiter: max 10 previews per IP per minute.
const sendCounts = new Map<string, { count: number; resetAt: number }>();

function checkRateLimit(ip: string): boolean {
  const now = Date.now();
  const entry = sendCounts.get(ip);
  if (!entry || now > entry.resetAt) {
    sendCounts.set(ip, { count: 1, resetAt: now + 60_000 });
    return true;
  }
  if (entry.count >= 10) return false;
  entry.count += 1;
  return true;
}

export async function POST(request: Request) {
  const ip =
    request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ??
    "unknown";

  if (!checkRateLimit(ip)) {
    return NextResponse.json(
      { error: "Too many preview sends. Please wait a minute and try again." },
      { status: 429 },
    );
  }

  let body: {
    subject?: string;
    description?: string;
    body?: string;
    bannerImageUrl?: string;
    toEmail?: string;
  };

  try {
    body = (await request.json()) as typeof body;
  } catch {
    return NextResponse.json({ error: "Invalid JSON body." }, { status: 400 });
  }

  const { toEmail, subject, description, body: bodyText, bannerImageUrl } = body;

  if (!toEmail || typeof toEmail !== "string" || !EMAIL_RE.test(toEmail)) {
    return NextResponse.json(
      { error: "A valid recipient email address is required." },
      { status: 400 },
    );
  }

  const newsletterSubject = (subject ?? "").trim() || "Newsletter Preview";
  const newsletterBody = (bodyText ?? "").trim();

  try {
    const { html, text } = await renderNewsletterToHtml({
      newsletter: {
        id: "preview",
        subject: newsletterSubject,
        description: description ?? null,
        body: newsletterBody,
        bannerImageUrl: bannerImageUrl ?? null,
      },
      subscriber: {
        id: "preview",
        email: toEmail,
        name: null,
      },
    });

    const from = getFromEmail();
    await resendProvider.send({
      from,
      to: toEmail,
      subject: `[Preview] ${newsletterSubject}`,
      html,
      text,
    });

    return NextResponse.json({ success: true }, { status: 200 });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Failed to send preview email.";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
