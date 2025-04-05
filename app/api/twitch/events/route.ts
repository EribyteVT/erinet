// app/api/twitch/events/route.ts
import { NextResponse } from "next/server";
import { prisma } from "@/app/lib/db";
import { isAllowedGuild } from "@/app/lib/auth";
import { getValidAccessToken } from "@/app/lib/twitchTokenService";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const {
      discordAuthToken,
      guildId,
      streamId,
      broadcastId,
      name,
      startTime,
      duration,
    } = body;

    // Check Discord permissions
    const isAllowed = await isAllowedGuild(discordAuthToken, guildId);
    if (!isAllowed) {
      return NextResponse.json({ response: "FORBIDDEN" }, { status: 403 });
    }

    // Get the valid Twitch access token for this guild
    let twitchAccessToken;
    try {
      twitchAccessToken = await getValidAccessToken(guildId);
    } catch (error) {
      console.error("Failed to get valid Twitch access token:", error);
      return NextResponse.json(
        { response: "ERROR", message: "Twitch authentication not available" },
        { status: 401 }
      );
    }

    // Create Twitch event
    const twitchResponse = await fetch(
      `https://api.twitch.tv/helix/schedule/segment?broadcaster_id=${broadcastId}`,
      {
        method: "POST",
        headers: {
          "Client-Id": process.env.TWITCH_CLIENT_ID!,
          Authorization: `Bearer ${twitchAccessToken}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          title: name,
          start_time: new Date(startTime).toISOString(),
          duration: parseInt(duration),
          timezone: "Etc/UTC",
        }),
      }
    );

    if (!twitchResponse.ok) {
      const errorData = await twitchResponse.json();
      console.error("Error from Twitch API:", errorData);
      return NextResponse.json(
        {
          response: "ERROR",
          message: "Failed to create Twitch event",
          details: errorData,
        },
        { status: 500 }
      );
    }

    const eventData = await twitchResponse.json();
    const segmentId = eventData.data.segments[0].id;

    // Update stream with segment ID
    const updatedStream = await prisma.stream_table_tied.update({
      where: { stream_id: parseInt(streamId) },
      data: { twitch_segment_id: segmentId },
    });

    return NextResponse.json({
      response: "OKAY",
      data: updatedStream,
    });
  } catch (error) {
    console.error("Error creating Twitch event:", error);
    return NextResponse.json(
      {
        response: "ERROR",
        message: "An unexpected error occurred",
      },
      { status: 500 }
    );
  }
}
