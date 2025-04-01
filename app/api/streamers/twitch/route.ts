// app/api/streamers/twitch/route.ts
import { NextResponse } from "next/server";
import { prisma } from "@/app/lib/db";
import { isAllowedGuild } from "@/app/lib/auth";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { streamerId, twitchId, guild_id, authToken } = body;

    const isAllowed = isAllowedGuild(authToken, guild_id);

    if (!isAllowed) {
      return NextResponse.json({ response: "FORBIDDEN" }, { status: 403 });
    }

    // Update streamer
    const streamer = await prisma.streamer_lookup.update({
      where: { streamer_id: streamerId },
      data: {
        twitch_user_id: twitchId,
      },
    });

    return NextResponse.json({
      response: "OK",
      data: streamer,
    });
  } catch (error) {
    console.error("Error adding Twitch to streamer:", error);
    return NextResponse.json({ response: "ERROR" }, { status: 500 });
  }
}
