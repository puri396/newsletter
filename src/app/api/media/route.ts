import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { generateAltText } from "@/lib/ai/alt-text";

export async function GET() {
  const media = await prisma.media.findMany({
    orderBy: { createdAt: "desc" },
    select: {
      id: true,
      name: true,
      mimeType: true,
      size: true,
      altText: true,
      createdAt: true,
      // Do NOT return dataUrl here — it can be megabytes of base64.
      // Components should use /api/media/[id] as the image src instead.
    },
  });

  // Attach a stable URL for each item so the client can render thumbnails
  // without loading the full base64 payload.
  const APP_URL =
    process.env.APP_URL?.replace(/\/$/, "") ??
    process.env.NEXT_PUBLIC_APP_URL?.replace(/\/$/, "") ??
    "";

  const items = media.map((m) => ({
    ...m,
    url: `${APP_URL}/api/media/${m.id}`,
  }));

  return NextResponse.json({ media: items });
}

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const file = formData.get("file") as File | null;

    if (!file) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 });
    }

    const allowedTypes = ["image/jpeg", "image/png", "image/gif", "image/webp", "image/svg+xml"];
    if (!allowedTypes.includes(file.type)) {
      return NextResponse.json(
        { error: "Unsupported file type. Allowed: JPEG, PNG, GIF, WebP, SVG" },
        { status: 400 },
      );
    }

    const maxSize = 5 * 1024 * 1024; // 5 MB
    if (file.size > maxSize) {
      return NextResponse.json({ error: "File too large. Max size is 5 MB" }, { status: 400 });
    }

    const arrayBuffer = await file.arrayBuffer();
    const base64 = Buffer.from(arrayBuffer).toString("base64");
    const dataUrl = `data:${file.type};base64,${base64}`;

    const media = await prisma.media.create({
      data: {
        name: file.name,
        mimeType: file.type,
        size: file.size,
        dataUrl,
      },
    });

    // Fire-and-forget background alt-text generation (non-blocking)
    const APP_URL =
      process.env.APP_URL?.replace(/\/$/, "") ??
      process.env.NEXT_PUBLIC_APP_URL?.replace(/\/$/, "") ??
      "http://localhost:3000";
    const imageUrl = `${APP_URL}/api/media/${media.id}`;
    void generateAltText(imageUrl, file.name)
      .then((altText) =>
        prisma.media.update({ where: { id: media.id }, data: { altText } }),
      )
      .catch(() => {});

    return NextResponse.json({ media }, { status: 201 });
  } catch (err) {
    console.error("[POST /api/media]", err);
    return NextResponse.json({ error: "Upload failed" }, { status: 500 });
  }
}
