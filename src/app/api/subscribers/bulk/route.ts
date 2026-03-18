import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { isValidEmail } from "@/lib/subscribers";
import { normalizeToE164 } from "@/lib/phone";

interface SubscriberRow {
  email: string;
  name?: string | null;
  phone?: string | null;
}

/** Parse a plain comma/newline-separated email list */
function parseEmailList(raw: string): SubscriberRow[] {
  return raw
    .split(/[\n,]/)
    .map((s) => s.trim())
    .filter(Boolean)
    .map((email) => ({ email: email.toLowerCase() }));
}

/** Parse a CSV string with optional header row.
 *  Accepted column names (case-insensitive): email, name, phone / mobile.
 */
function parseCsv(raw: string): SubscriberRow[] {
  const lines = raw
    .split(/\r?\n/)
    .map((l) => l.trim())
    .filter(Boolean);
  if (lines.length === 0) return [];

  // Detect if first row is a header (contains "email" as a word)
  const firstLower = lines[0].toLowerCase();
  const hasHeader = firstLower.includes("email");

  let emailIdx = 0;
  let nameIdx = -1;
  let phoneIdx = -1;

  if (hasHeader) {
    const headers = lines[0].split(",").map((h) => h.trim().toLowerCase());
    emailIdx = headers.findIndex((h) => h === "email");
    nameIdx = headers.findIndex((h) => h === "name" || h === "full name");
    phoneIdx = headers.findIndex(
      (h) => h === "phone" || h === "mobile" || h === "phone number",
    );
    if (emailIdx === -1) emailIdx = 0;
  }

  const dataLines = hasHeader ? lines.slice(1) : lines;
  return dataLines.map((line) => {
    const cols = line.split(",").map((c) => c.trim().replace(/^"|"$/g, ""));
    return {
      email: (cols[emailIdx] ?? "").toLowerCase(),
      name: nameIdx >= 0 ? cols[nameIdx] || null : null,
      phone: phoneIdx >= 0 ? cols[phoneIdx] || null : null,
    };
  });
}

export async function POST(request: Request) {
  try {
    const contentType = request.headers.get("content-type") ?? "";
    let rows: SubscriberRow[] = [];

    if (contentType.includes("multipart/form-data")) {
      // CSV file upload
      const form = await request.formData();
      const file = form.get("file") as File | null;
      if (!file) {
        return NextResponse.json({ error: "No file provided." }, { status: 400 });
      }
      const text = await file.text();
      rows = parseCsv(text);
    } else {
      // JSON body with `emails` string (backward-compatible)
      const body = (await request.json()) as { emails?: string; csv?: string };
      const raw = body.csv ?? body.emails ?? "";
      if (!raw.trim()) {
        return NextResponse.json(
          { error: "Provide either a CSV file or an emails string." },
          { status: 400 },
        );
      }
      // Auto-detect: if the string has commas that look like CSV columns or has a header
      rows = raw.toLowerCase().includes("email,") ? parseCsv(raw) : parseEmailList(raw);
    }

    let invalid = 0;
    const validRows: SubscriberRow[] = [];

    for (const row of rows) {
      if (!isValidEmail(row.email)) {
        invalid += 1;
        continue;
      }
      // Normalize phone if provided
      let phone: string | null = null;
      if (row.phone) {
        const normalized = normalizeToE164(row.phone);
        phone = normalized.ok ? normalized.e164 : null;
      }
      validRows.push({ ...row, email: row.email.toLowerCase(), phone });
    }

    // De-duplicate by email within the batch
    const seenEmails = new Set<string>();
    const uniqueRows: SubscriberRow[] = [];
    for (const r of validRows) {
      if (!seenEmails.has(r.email)) {
        seenEmails.add(r.email);
        uniqueRows.push(r);
      }
    }

    // Find already-existing emails
    const existing = await prisma.subscriber.findMany({
      where: { email: { in: uniqueRows.map((r) => r.email) } },
      select: { email: true },
    });
    const existingSet = new Set(existing.map((r) => r.email));
    const toInsert = uniqueRows.filter((r) => !existingSet.has(r.email));
    const skipped = uniqueRows.length - toInsert.length;

    if (toInsert.length > 0) {
      await prisma.subscriber.createMany({
        data: toInsert.map((r) => ({
          email: r.email,
          name: r.name ?? null,
          phone: r.phone ?? null,
          status: "active" as const,
        })),
        skipDuplicates: true,
      });
    }

    return NextResponse.json(
      { added: toInsert.length, skipped, invalid },
      { status: 200 },
    );
  } catch (err) {
    console.error("[bulk import]", err);
    return NextResponse.json(
      { error: "Failed to import subscribers." },
      { status: 500 },
    );
  }
}
