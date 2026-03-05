import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { toSubscriberDto, type SubscriberDto } from "@/lib/subscribers";

interface PatchSubscriberBody {
  status?: string;
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

    if (!status) {
      return NextResponse.json(
        { error: "Valid status (active or unsubscribed) is required." },
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

    const updated = await prisma.subscriber.update({
      where: { id },
      data: {
        status,
        unsubscribedAt:
          status === "unsubscribed" ? new Date() : null,
      },
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
