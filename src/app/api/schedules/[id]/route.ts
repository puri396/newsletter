import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export async function PATCH(
  _request: Request,
  context: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await context.params;
    if (!id) {
      return NextResponse.json(
        { error: "Schedule ID is required." },
        { status: 400 },
      );
    }

    const schedule = await prisma.schedule.findUnique({
      where: { id },
    });
    if (!schedule) {
      return NextResponse.json(
        { error: "Schedule not found." },
        { status: 404 },
      );
    }
    if (schedule.status !== "pending") {
      return NextResponse.json(
        { error: "Only pending schedules can be cancelled." },
        { status: 400 },
      );
    }

    await prisma.schedule.update({
      where: { id },
      data: {
        status: "failed",
        errorMessage: "Cancelled",
      },
    });

    return NextResponse.json({ success: true }, { status: 200 });
  } catch {
    return NextResponse.json(
      { error: "Failed to cancel schedule." },
      { status: 500 },
    );
  }
}
