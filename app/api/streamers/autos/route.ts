// app/api/streamers/autos/route.ts
import { NextResponse } from "next/server";
import { prisma } from "@/app/lib/db";
import { isAllowedGuild } from "@/app/lib/auth";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { streamerId, authToken, guildId, setDiscord, setTwitch } = body;

    // Check Discord permissions
    const isAllowed = await isAllowedGuild(authToken, guildId);
    if (!isAllowed) {
      return NextResponse.json({ response: "FORBIDDEN" }, { status: 403 });
    }

    // Update streamer
    const streamer = await prisma.streamer_lookup.update({
      where: { streamer_id: streamerId },
      data: {
        auto_discord_event: setDiscord,
        auto_twitch_schedule: setTwitch,
      },
    });

    return NextResponse.json({
      response: "OK",
      data: streamer,
    });
  } catch (error) {
    console.error("Error updating streamer auto settings:", error);
    return NextResponse.json({ response: "ERROR" }, { status: 500 });
  }
}
