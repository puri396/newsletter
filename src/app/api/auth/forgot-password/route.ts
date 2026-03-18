import { NextResponse } from "next/server";
import { randomBytes } from "crypto";
import { z } from "zod";
import { prisma } from "@/lib/db";
import { resendProvider, getFromEmail } from "@/lib/email/provider-resend";
import { render } from "@react-email/render";
import React from "react";
import { PasswordResetEmailTemplate } from "@/emails/PasswordResetEmailTemplate";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

const BodySchema = z.object({
  email: z.string().email(),
});

const APP_URL =
  process.env.APP_URL?.replace(/\/$/, "") ??
  process.env.NEXT_PUBLIC_APP_URL?.replace(/\/$/, "") ??
  "http://localhost:3000";

export async function POST(request: Request) {
  try {
    const raw = await request.json().catch(() => ({}));
    const parsed = BodySchema.safeParse(raw);
    if (!parsed.success) {
      // Always return 200 to prevent email enumeration
      return NextResponse.json({ success: true });
    }

    const { email } = parsed.data;
    const user = await prisma.user.findUnique({
      where: { email: email.toLowerCase() },
      select: { id: true, email: true, firstName: true },
    });

    // Always return success even if user not found (prevent enumeration)
    if (!user || !user.email) {
      return NextResponse.json({ success: true });
    }

    // Invalidate any existing tokens for this user
    await prisma.passwordResetToken.updateMany({
      where: { userId: user.id, usedAt: null },
      data: { usedAt: new Date() },
    });

    // Create new token valid for 1 hour
    const token = randomBytes(32).toString("hex");
    const expiresAt = new Date(Date.now() + 60 * 60 * 1000);

    await prisma.passwordResetToken.create({
      data: { userId: user.id, token, expiresAt },
    });

    const resetUrl = `${APP_URL}/reset-password?token=${token}`;

    const html = await render(
      React.createElement(PasswordResetEmailTemplate, { resetUrl }),
    );

    await resendProvider.send({
      from: getFromEmail(),
      to: user.email,
      subject: "Reset your GenContent AI password",
      html,
      text: `Reset your password by visiting: ${resetUrl}\n\nThis link expires in 1 hour.`,
    });

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("[forgot-password]", err);
    // Still return success to prevent enumeration
    return NextResponse.json({ success: true });
  }
}
