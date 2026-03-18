import { NextResponse } from "next/server";
import { z } from "zod";
import { auth } from "@/auth";
import { prisma } from "@/lib/db";
import { generateAltText } from "@/lib/ai/alt-text";

const BodySchema = z
  .object({
    mediaId: z.string().optional(),
    imageUrl: z.string().url().optional(),
  })
  .refine((d) => d.mediaId || d.imageUrl, {
    message: "Either mediaId or imageUrl is required",
  });

const APP_URL =
  process.env.APP_URL?.replace(/\/$/, "") ??
  process.env.NEXT_PUBLIC_APP_URL?.replace(/\/$/, "") ??
  "http://localhost:3000";

export async function POST(request: Request) {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const raw = await request.json().catch(() => ({}));
  const parsed = BodySchema.safeParse(raw);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten().formErrors[0] ?? "Invalid input." }, { status: 400 });
  }

  const { mediaId, imageUrl } = parsed.data;

  let resolvedUrl = imageUrl ?? "";
  let filename: string | undefined;

  if (mediaId) {
    const media = await prisma.media.findUnique({
      where: { id: mediaId },
      select: { name: true },
    });
    if (!media) {
      return NextResponse.json({ error: "Media not found" }, { status: 404 });
    }
    resolvedUrl = `${APP_URL}/api/media/${mediaId}`;
    filename = media.name;
  }

  const altText = await generateAltText(resolvedUrl, filename);

  if (mediaId) {
    await prisma.media.update({
      where: { id: mediaId },
      data: { altText },
    });
  }

  return NextResponse.json({ altText });
}
