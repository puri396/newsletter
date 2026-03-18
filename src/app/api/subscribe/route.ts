import { NextResponse } from "next/server";
import { randomBytes } from "crypto";
import { render } from "@react-email/render";
import React from "react";
import { prisma } from "@/lib/db";
import { getClientId, checkRateLimit } from "@/lib/rate-limit";
import { normalizeToE164 } from "@/lib/phone";
import { isValidEmail } from "@/lib/subscribers";
import { log } from "@/lib/logger";
import { sendWelcomeEmail } from "@/lib/email/send-welcome";
import { resendProvider, getFromEmail } from "@/lib/email/provider-resend";
import { ConfirmSubscriptionTemplate } from "@/emails/ConfirmSubscriptionTemplate";

const APP_URL =
  process.env.APP_URL?.replace(/\/$/, "") ??
  process.env.NEXT_PUBLIC_APP_URL?.replace(/\/$/, "") ??
  "http://localhost:3000";

const DOUBLE_OPT_IN = process.env.DOUBLE_OPT_IN === "true";

async function sendConfirmationEmail(email: string, name: string | null, token: string) {
  const confirmUrl = `${APP_URL}/api/subscribe/confirm?token=${token}`;
  const html = await render(
    React.createElement(ConfirmSubscriptionTemplate, { confirmUrl, subscriberName: name }),
  );
  await resendProvider.send({
    from: getFromEmail(),
    to: email,
    subject: "Please confirm your subscription",
    html,
    text: `Confirm your subscription by visiting: ${confirmUrl}`,
  });
}

interface SubscribeBody {
  email?: string;
  name?: string;
  /** Optional E.164 or parseable phone; required when whatsappOptIn is true. */
  phone?: string;
  /** If true, phone is required and must be valid E.164; subscriber will receive WhatsApp notifications when enabled. */
  whatsappOptIn?: boolean;
  /** Honeypot: must be absent or empty. If set, reject (bot). */
  website?: string;
}

function normalizeString(value: unknown): string {
  if (typeof value === "string") return value.trim();
  return "";
}

export async function POST(request: Request) {
  try {
    const clientId = getClientId(request);
    if (!checkRateLimit(clientId)) {
      return NextResponse.json(
        { error: "Too many subscription attempts. Please try again in a minute." },
        { status: 429 },
      );
    }

    const body = (await request.json()) as SubscribeBody;
    if (normalizeString(body.website)) {
      return NextResponse.json(
        { error: "Invalid request." },
        { status: 400 },
      );
    }

    const email = normalizeString(body.email);
    const name = normalizeString(body.name) || null;
    const whatsappOptIn = Boolean(body.whatsappOptIn);
    const rawPhone = normalizeString(body.phone);

    if (!email) {
      return NextResponse.json(
        { error: "Email is required." },
        { status: 400 },
      );
    }

    if (!isValidEmail(email)) {
      return NextResponse.json(
        { error: "Invalid email format." },
        { status: 400 },
      );
    }

    let phone: string | null = null;
    if (whatsappOptIn) {
      if (!rawPhone) {
        return NextResponse.json(
          { error: "Phone is required when opting in to WhatsApp notifications." },
          { status: 400 },
        );
      }
      const normalized = normalizeToE164(rawPhone);
      if (!normalized.ok) {
        return NextResponse.json(
          { error: normalized.error },
          { status: 400 },
        );
      }
      phone = normalized.e164;
    } else if (rawPhone) {
      const normalized = normalizeToE164(rawPhone);
      phone = normalized.ok ? normalized.e164 : null;
    }

    const existing = await prisma.subscriber.findUnique({
      where: { email: email.toLowerCase() },
    });

    if (existing) {
      return NextResponse.json(
        { message: "Already subscribed." },
        { status: 200 },
      );
    }

    if (phone) {
      const existingPhone = await prisma.subscriber.findUnique({
        where: { phone },
      });
      if (existingPhone) {
        return NextResponse.json(
          { error: "This phone number is already subscribed." },
          { status: 400 },
        );
      }
    }

    if (DOUBLE_OPT_IN) {
      // Create subscriber as 'pending' and send confirmation email
      const confirmToken = randomBytes(32).toString("hex");
      await prisma.subscriber.create({
        data: {
          email: email.toLowerCase(),
          name,
          phone,
          whatsappOptIn: phone ? whatsappOptIn : false,
          status: "pending",
          confirmToken,
          confirmSentAt: new Date(),
        },
      });

      void sendConfirmationEmail(email, name, confirmToken).catch((error) => {
        const message =
          error instanceof Error ? error.message : "Unknown confirmation email error";
        log("error", "sendConfirmationEmail threw in subscribe route", {
          route: "api/subscribe",
          errorMessage: message,
        });
      });

      return NextResponse.json(
        { message: "Please check your email to confirm your subscription." },
        { status: 201 },
      );
    }

    await prisma.subscriber.create({
      data: {
        email: email.toLowerCase(),
        name,
        phone,
        whatsappOptIn: phone ? whatsappOptIn : false,
        status: "active",
      },
    });

    // Fire-and-forget welcome email; subscription should succeed even if this fails.
    void sendWelcomeEmail({ email, name }).catch((error) => {
      const message =
        error instanceof Error ? error.message : "Unknown welcome email error";
      log("error", "sendWelcomeEmail threw in subscribe route", {
        route: "api/subscribe",
        errorMessage: message,
      });
    });

    return NextResponse.json(
      { message: "Subscribed successfully." },
      { status: 201 },
    );
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    log("error", "Subscribe failed", {
      route: "api/subscribe",
      errorMessage: message,
    });
    return NextResponse.json(
      { error: "Failed to subscribe." },
      { status: 500 },
    );
  }
}
