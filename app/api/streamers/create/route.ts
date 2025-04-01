import { NextResponse } from "next/server";
import { prisma } from "@/app/lib/db";
import { isAllowedGuild } from "@/app/lib/auth";
import { getBotGuilds } from "@/app/lib/discord-api";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { streamerName, levelSystem, timezone, guildId, authToken } = body;

    // Validate required parameters
    if (!streamerName || !guildId || !authToken) {
      return NextResponse.json(
        {
          response: "ERROR",
          message: "Missing required parameters",
        },
        { status: 400 }
      );
    }

    // Check if the user has admin permissions in the guild
    const isAllowed = await isAllowedGuild(authToken, guildId);
    if (!isAllowed) {
      return NextResponse.json(
        {
          response: "FORBIDDEN",
          message:
            "You don't have permission to create a streamer for this guild",
        },
        { status: 403 }
      );
    }

    // Check if the bot is actually in the guild
    const botGuilds = await getBotGuilds();
    const botInGuild = botGuilds.some((guild) => guild.id === guildId);

    if (!botInGuild) {
      return NextResponse.json(
        {
          response: "ERROR",
          message: "The bot is not in this guild. Please add the bot first.",
        },
        { status: 400 }
      );
    }

    // Check if a streamer already exists for this guild
    const existingStreamer = await prisma.streamer_lookup.findFirst({
      where: { guild: guildId },
    });

    if (existingStreamer) {
      return NextResponse.json(
        {
          response: "ERROR",
          message: "A streamer already exists for this guild",
        },
        { status: 400 }
      );
    }

    // Create the new streamer
    const newStreamer = await prisma.streamer_lookup.create({
      data: {
        streamer_name: streamerName,
        timezone: timezone || "UTC", // Use provided timezone or fall back to UTC
        guild: guildId,
        level_system: levelSystem || "N",
      },
    });

    return NextResponse.json(
      { response: "OKAY", data: newStreamer },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error creating streamer:", error);
    return NextResponse.json(
      {
        response: "ERROR",
        message: "An unexpected error occurred",
      },
      { status: 500 }
    );
  }
}
