import { NextResponse } from "next/server";
import { prisma } from "@/app/lib/db";

export async function GET(
  request: Request,
  { params }: { params: { guildId: string } }
) {
  try {
    // If params is a Promise, await it first
    const resolvedParams = await Promise.resolve(params);
    const { guildId } = resolvedParams;

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
