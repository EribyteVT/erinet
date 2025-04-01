import { NextResponse } from "next/server";
import { prisma } from "@/app/lib/db";

export async function GET(
  request: Request,
  params: { params: Promise<{ guildId: string }> }
) {
  try {
    const { guildId } = await params.params;

    const streamer = await prisma.streamer_lookup.findFirst({
      where: { guild: guildId },
    });

    return NextResponse.json({
      response: "OK",
      data: streamer,
    });
  } catch (error) {
    console.error("Error fetching streamer:", error);
    return NextResponse.json({ response: "ERROR" }, { status: 500 });
  }
}
