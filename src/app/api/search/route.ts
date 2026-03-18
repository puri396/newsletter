import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { auth } from "@/auth";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export async function GET(request: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { searchParams } = request.nextUrl;
  const q = searchParams.get("q")?.trim();

  if (!q || q.length < 2) {
    return NextResponse.json({ results: [] });
  }

  // Limit scope to reasonable size
  const limit = 5;

  const [newsletters, subscribers] = await Promise.all([
    prisma.newsletter.findMany({
      where: {
        OR: [
          { subject: { contains: q, mode: "insensitive" } },
          { description: { contains: q, mode: "insensitive" } },
        ],
      },
      orderBy: { createdAt: "desc" },
      take: limit,
      select: {
        id: true,
        subject: true,
        status: true,
        contentType: true,
        createdAt: true,
      },
    }),
    prisma.subscriber.findMany({
      where: {
        OR: [
          { email: { contains: q, mode: "insensitive" } },
          { name: { contains: q, mode: "insensitive" } },
        ],
      },
      orderBy: { createdAt: "desc" },
      take: limit,
      select: {
        id: true,
        email: true,
        name: true,
        status: true,
      },
    }),
  ]);

  const results = [
    ...newsletters.map((n) => ({
      type: (n.contentType ?? "newsletter") as string,
      id: n.id,
      title: n.subject,
      subtitle: n.status,
      href:
        n.contentType === "blog"
          ? `/epic/view/${n.id}`
          : `/newsletters/edit/${n.id}`,
    })),
    ...subscribers.map((s) => ({
      type: "subscriber",
      id: s.id,
      title: s.email,
      subtitle: s.name ?? s.status,
      href: `/subscribers`,
    })),
  ];

  return NextResponse.json({ results });
}
