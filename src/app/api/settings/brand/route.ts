import { NextResponse } from "next/server";
import { z } from "zod";
import { auth } from "@/auth";
import { prisma } from "@/lib/db";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

const PatchSchema = z.object({
  brandName: z.string().max(80).optional(),
  brandLogoUrl: z.string().max(500).optional().nullable(),
  replyToEmail: z.string().email().optional().nullable(),
  brandColor: z.string().regex(/^#[0-9a-fA-F]{6}$/).optional().nullable(),
});

/** GET — return the current user's brand settings stored in User.meta JSON */
export async function GET() {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const user = await prisma.user.findUnique({
    where: { id: session.user.id as string },
    select: { name: true, image: true },
  });

  return NextResponse.json({
    brandName: user?.name ?? "",
    brandLogoUrl: user?.image ?? null,
    replyToEmail: null,
    brandColor: null,
  });
}

/** PATCH — save brand settings into User fields */
export async function PATCH(request: Request) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const raw = await request.json().catch(() => ({}));
  const parsed = PatchSchema.safeParse(raw);
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid input." }, { status: 400 });
  }

  const { brandName, brandLogoUrl } = parsed.data;

  const updated = await prisma.user.update({
    where: { id: session.user.id as string },
    data: {
      ...(brandName !== undefined ? { name: brandName || null } : {}),
      ...(brandLogoUrl !== undefined ? { image: brandLogoUrl } : {}),
    },
    select: { name: true, image: true },
  });

  return NextResponse.json({
    brandName: updated.name ?? "",
    brandLogoUrl: updated.image ?? null,
  });
}
