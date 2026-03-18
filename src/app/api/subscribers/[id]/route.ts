import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { toSubscriberDto, type SubscriberDto } from "@/lib/subscribers";
import { normalizeToE164 } from "@/lib/phone";

interface PatchSubscriberBody {
  status?: string;
  whatsappOptIn?: boolean;
  phone?: string;
}

function parseStatus(value: string | undefined): "active" | "unsubscribed" | null {
  if (!value) return null;
  const normalized = value.toLowerCase();
  if (normalized === "active" || normalized === "unsubscribed") {
    return normalized;
  }
  return null;
}

export async function PATCH(
  request: Request,
  context: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await context.params;
    if (!id) {
      return NextResponse.json(
        { error: "Subscriber ID is required." },
        { status: 400 },
      );
    }

    const body = (await request.json()) as PatchSubscriberBody;
    const status = parseStatus(body.status);
    const whatsappOptIn = body.whatsappOptIn;
    const rawPhone = typeof body.phone === "string" ? body.phone.trim() : undefined;

    const hasStatus = status !== null;
    const hasWhatsappOptIn = typeof whatsappOptIn === "boolean";
    const hasPhone = rawPhone !== undefined;

    if (!hasStatus && !hasWhatsappOptIn && !hasPhone) {
      return NextResponse.json(
        { error: "Provide at least one of: status, whatsappOptIn, phone." },
        { status: 400 },
      );
    }

    const existing = await prisma.subscriber.findUnique({
      where: { id },
    });

    if (!existing) {
      return NextResponse.json(
        { error: "Subscriber not found." },
        { status: 404 },
      );
    }

    const data: {
      status?: "active" | "unsubscribed";
      unsubscribedAt?: Date | null;
      whatsappOptIn?: boolean;
      phone?: string | null;
    } = {};

    if (hasStatus) {
      data.status = status!;
      data.unsubscribedAt = status === "unsubscribed" ? new Date() : null;
    }

    if (hasPhone) {
      if (rawPhone === "") {
        data.phone = null;
        if (hasWhatsappOptIn && whatsappOptIn) {
          data.whatsappOptIn = false;
        }
      } else {
        const normalized = normalizeToE164(rawPhone!);
        if (!normalized.ok) {
          return NextResponse.json(
            { error: normalized.error },
            { status: 400 },
          );
        }
        const other = await prisma.subscriber.findUnique({
          where: { phone: normalized.e164 },
        });
        if (other && other.id !== id) {
          return NextResponse.json(
            { error: "This phone number is already used by another subscriber." },
            { status: 400 },
          );
        }
        data.phone = normalized.e164;
      }
    }

    if (hasWhatsappOptIn) {
      data.whatsappOptIn = whatsappOptIn;
      if (whatsappOptIn && !data.phone && !existing.phone) {
        return NextResponse.json(
          { error: "Phone is required to opt in to WhatsApp. Set phone first." },
          { status: 400 },
        );
      }
    }

    const updated = await prisma.subscriber.update({
      where: { id },
      data,
    });

    const dto: SubscriberDto = toSubscriberDto(updated);
    return NextResponse.json({ data: dto }, { status: 200 });
  } catch {
    return NextResponse.json(
      { error: "Failed to update subscriber." },
      { status: 500 },
    );
  }
}
