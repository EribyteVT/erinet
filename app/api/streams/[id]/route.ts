import { NextResponse } from "next/server";
import { prisma } from "@/app/lib/db";
import { isAllowedGuild } from "@/app/lib/auth";
import {
  updateDiscordEvent,
  deleteDiscordEvent,
  updateTwitchSegment,
  deleteTwitchSegment,
} from "@/app/lib/eventServices";
import { getValidAccessToken } from "@/app/lib/tokenService";

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const resolvedParams = await Promise.resolve(params);
    const { id } = resolvedParams;

    const body = await request.json();
    const { authToken, guildId, newTimestamp, newName, newDuration } = body;

    // Check Discord permissions
    const isAllowed = await isAllowedGuild(authToken, guildId);
    if (!isAllowed) {
      return NextResponse.json({ response: "FORBIDDEN" }, { status: 403 });
    }

    // Check if stream exists
    const existingStream = await prisma.stream_table_tied.findUnique({
      where: { stream_id: parseInt(id) },
    });

    if (!existingStream) {
      return NextResponse.json({ response: "NOT_FOUND" }, { status: 404 });
    }

    // Convert timestamp to Date object for database and event updates
    const streamDate = new Date(parseInt(newTimestamp) * 1000);

    // Update stream in database
    const updatedStream = await prisma.stream_table_tied.update({
      where: { stream_id: parseInt(id) },
      data: {
        stream_date: streamDate,
        stream_name: newName,
        duration: newDuration,
      },
    });

    // Get the streamer info for Twitch updates if needed
    let twitchUserId = null;
    if (existingStream.twitch_segment_id) {
      const streamer = await prisma.streamer_lookup.findFirst({
        where: { streamer_id: parseInt(existingStream.streamer_id) },
      });
      twitchUserId = streamer?.twitch_user_id;
    }

    // Calculate end time for Discord event (in ISO format)
    const endTime = new Date(streamDate);
    endTime.setMinutes(endTime.getMinutes() + newDuration);

    // Update associated Discord event if it exists
    if (existingStream.event_id) {
      try {
        await updateDiscordEvent(
          guildId,
          existingStream.event_id,
          newName,
          streamDate.toISOString(),
          endTime.toISOString()
        );
      } catch (error) {
        console.error("Failed to update Discord event:", error);
        // Continue with response even if Discord update fails
      }
    }

    // Update associated Twitch segment if it exists
    if (existingStream.twitch_segment_id && twitchUserId) {
      try {
        // Get a valid Twitch access token
        const twitchAccessToken = await getValidAccessToken(guildId);
        await updateTwitchSegment(
          twitchUserId,
          existingStream.twitch_segment_id,
          newName,
          streamDate.toISOString(),
          newDuration,
          twitchAccessToken
        );
      } catch (error) {
        console.error("Failed to update Twitch segment:", error);
        // Continue with response even if Twitch update fails
      }
    }

    return NextResponse.json({
      response: "OKAY",
      data: updatedStream,
    });
  } catch (error) {
    console.error("Error updating stream:", error);
    return NextResponse.json({ response: "ERROR" }, { status: 500 });
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const resolvedParams = await Promise.resolve(params);
    const { id } = resolvedParams;

    const body = await request.json();
    const { authToken, guildId } = body;

    // Check Discord permissions
    const isAllowed = await isAllowedGuild(authToken, guildId);
    if (!isAllowed) {
      return NextResponse.json({ response: "FORBIDDEN" }, { status: 403 });
    }

    // Check if stream exists and get its event IDs
    const existingStream = await prisma.stream_table_tied.findUnique({
      where: { stream_id: parseInt(id) },
    });

    if (!existingStream) {
      return NextResponse.json({ response: "NOT_FOUND" }, { status: 404 });
    }

    // Get the streamer info to find the Twitch user ID if needed
    let twitchUserId = null;
    if (existingStream.twitch_segment_id) {
      const streamer = await prisma.streamer_lookup.findFirst({
        where: { streamer_id: parseInt(existingStream.streamer_id) },
      });
      twitchUserId = streamer?.twitch_user_id;
    }

    // Delete associated Discord event if it exists
    if (existingStream.event_id) {
      await deleteDiscordEvent(guildId, existingStream.event_id);
    }

    // Delete associated Twitch segment if it exists
    if (existingStream.twitch_segment_id && twitchUserId) {
      try {
        // Get a valid Twitch access token
        const twitchAccessToken = await getValidAccessToken(guildId);
        await deleteTwitchSegment(
          twitchUserId,
          existingStream.twitch_segment_id,
          twitchAccessToken
        );
      } catch (error) {
        console.error("Failed to delete Twitch segment:", error);
        // Continue with stream deletion even if Twitch deletion fails
      }
    }

    // Delete stream
    await prisma.stream_table_tied.delete({
      where: { stream_id: parseInt(id) },
    });

    return NextResponse.json({ response: "OKAY" });
  } catch (error) {
    console.error("Error deleting stream:", error);
    return NextResponse.json({ response: "ERROR" }, { status: 500 });
  }
}
