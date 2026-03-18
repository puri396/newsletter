import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { errorResponse, ERROR_CODES } from "@/lib/api/error-response";
import { log } from "@/lib/logger";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const tab = searchParams.get("tab") ?? "all";

    type WhereClause =
      | { contentType?: { equals: string } }
      | { contentType?: { in: string[] } }
      | { OR?: { contentType: string | null }[] };
    let where: WhereClause = {};
    if (tab !== "all") {
      if (tab === "newsletter") {
        where = { OR: [{ contentType: "newsletter" }, { contentType: null }] };
      } else if (["blog", "image", "video"].includes(tab)) {
        where = { contentType: { equals: tab } };
      }
    }

    const content = await prisma.newsletter.findMany({
      where: Object.keys(where).length > 0 ? (where as object) : undefined,
      orderBy: { createdAt: "desc" },
      take: 100,
      include: { author: { select: { name: true } } },
    });

    const items = content.map((n) => ({
      id: n.id,
      title: n.shortTitle ?? n.subject,
      authorName: n.authorName ?? n.author?.name ?? null,
      date: n.createdAt.toISOString(),
      status: n.status,
      description: n.description ?? "",
      contentType: n.contentType ?? "newsletter",
    }));

    return NextResponse.json({ data: items }, { status: 200 });
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    log("error", "Failed to list EPIC content", {
      context: "api/epic/content GET",
      errorMessage: message,
    });
    return errorResponse(
      ERROR_CODES.DATABASE_ERROR,
      "Failed to load content.",
      500,
    );
  }
}
