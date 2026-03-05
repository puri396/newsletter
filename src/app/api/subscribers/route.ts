import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import {
  isValidEmail,
  toSubscriberDto,
  type SubscriberDto,
} from "@/lib/subscribers";

interface CreateSubscriberBody {
  email?: string;
  name?: string;
}

function normalizeString(value: unknown): string {
  if (typeof value === "string") return value.trim();
  return "";
}

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as CreateSubscriberBody;
    const email = normalizeString(body.email);
    const name = normalizeString(body.name) || null;

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

    const existing = await prisma.subscriber.findUnique({
      where: { email: email.toLowerCase() },
    });

    if (existing) {
      return NextResponse.json(
        { error: "Email already subscribed." },
        { status: 409 },
      );
    }

    const created = await prisma.subscriber.create({
      data: {
        email: email.toLowerCase(),
        name,
        status: "active",
      },
    });

    const dto: SubscriberDto = toSubscriberDto(created);
    return NextResponse.json({ data: dto }, { status: 201 });
  } catch {
    return NextResponse.json(
      { error: "Failed to add subscriber." },
      { status: 500 },
    );
  }
}
