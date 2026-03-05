import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { isValidEmail } from "@/lib/subscribers";

interface BulkBody {
  emails?: string;
}

function parseEmails(raw: string): string[] {
  const parts = raw.split(/[\n,]/).map((s) => s.trim()).filter(Boolean);
  const normalized = parts.map((e) => e.toLowerCase());
  return [...new Set(normalized)];
}

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as BulkBody;
    const raw = typeof body.emails === "string" ? body.emails : "";

    if (!raw.trim()) {
      return NextResponse.json(
        { error: "emails (string) is required." },
        { status: 400 },
      );
    }

    const uniqueEmails = parseEmails(raw);
    let invalid = 0;
    const validEmails: string[] = [];

    for (const email of uniqueEmails) {
      if (isValidEmail(email)) {
        validEmails.push(email);
      } else {
        invalid += 1;
      }
    }

    const existing = await prisma.subscriber.findMany({
      where: { email: { in: validEmails } },
      select: { email: true },
    });
    const existingSet = new Set(existing.map((r) => r.email));
    const toInsert = validEmails.filter((e) => !existingSet.has(e));
    const skipped = validEmails.length - toInsert.length;

    if (toInsert.length > 0) {
      await prisma.subscriber.createMany({
        data: toInsert.map((email) => ({
          email,
          status: "active" as const,
        })),
        skipDuplicates: true,
      });
    }

    const added = toInsert.length;

    return NextResponse.json(
      { added, skipped, invalid },
      { status: 200 },
    );
  } catch {
    return NextResponse.json(
      { error: "Failed to import subscribers." },
      { status: 500 },
    );
  }
}
