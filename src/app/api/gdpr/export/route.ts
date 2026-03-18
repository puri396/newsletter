import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/db";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

/**
 * GET /api/gdpr/export
 * Returns a JSON export of the authenticated user's personal data.
 * GDPR Article 20 — Right to data portability.
 */
export async function GET() {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const userId = session.user.id as string;

  const [user, newsletters] = await Promise.all([
    prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        email: true,
        name: true,
        firstName: true,
        lastName: true,
        createdAt: true,
        updatedAt: true,
      },
    }),
    prisma.newsletter.findMany({
      where: { authorId: userId },
      select: {
        id: true,
        subject: true,
        description: true,
        status: true,
        contentType: true,
        tags: true,
        createdAt: true,
        publishedAt: true,
      },
      orderBy: { createdAt: "desc" },
    }),
  ]);

  const exportData = {
    exportedAt: new Date().toISOString(),
    user,
    newsletters,
    note: "This export contains all personal data associated with your account. To request deletion, email privacy@gencontent.ai.",
  };

  return new NextResponse(JSON.stringify(exportData, null, 2), {
    status: 200,
    headers: {
      "Content-Type": "application/json",
      "Content-Disposition": `attachment; filename="gencontent-data-export-${Date.now()}.json"`,
    },
  });
}
