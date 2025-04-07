"use server";

import { auth } from "@/auth";
import { getDiscordToken } from "@/app/lib/discordTokenService";
import {
  Stream,
  StreamDataResponse,
  StreamsDataResponse,
} from "@/components/Streams/types";
import { prisma } from "@/app/lib/db";
import { isAllowedGuild } from "@/app/lib/auth";
import { revalidatePath } from "next/cache";
import { getDecryptedTokens } from "../lib/twitchTokenService";
import {
  deleteTwitchSegment,
  updateTwitchSegment,
} from "@/app/lib/eventServices";
import {
  deleteDiscordEvent,
  updateDiscordEvent,
} from "../actions/discordActions";
import { createRateLimitedStructuredAction } from "../lib/actionRegistry";
import {
  errorResponse,
  NormalizedResponse,
  successResponse,
} from "../lib/api-utils";

async function addStreamActionImpl(
  streamerId: number,
  timestamp: string,
  streamName: string,
  duration: string,
  guildId: string
): Promise<NormalizedResponse<Stream>> {
  try {
    console.log(`DURATION: ${duration}`);
    console.log(`GUILD: ${guildId}`);
    // Get the current user session
    const session = await auth();
    if (!session?.user?.id) {
      return errorResponse("UNAUTHORIZED");
    }

    // Get the Discord token from server-side storage
    const token = await getDiscordToken(session.user.id);
    if (!token) {
      return errorResponse("UNAUTHORIZED");
    }

    // Check if the user has permission for this guild
    const hasPermission = await isAllowedGuild(token, guildId);
    if (!hasPermission) {
      return errorResponse("FORBIDDEN");
    }

    // Create a new stream entry
    const newStream = await prisma.stream_table_tied.create({
      data: {
        streamer_id: streamerId.toString(),
        stream_name: streamName,
        stream_date: new Date(parseInt(timestamp) * 1000),
        duration: parseInt(duration),
      },
    });

    // Revalidate the streams page to refresh data
    revalidatePath(`/${guildId}/manage`);

    return successResponse(newStream, "OKAY");
  } catch (error) {
    console.error("Error adding stream:", error);
    return errorResponse("ERROR");
  }
}

export const addStreamAction = createRateLimitedStructuredAction(
  "addStream",
  addStreamActionImpl,
  "stream"
);

async function deleteStreamActionImpl(
  streamId: string,
  guildId: string
): Promise<NormalizedResponse<Stream>> {
  try {
    // Get the current user session
    const session = await auth();
    if (!session?.user?.id) {
      return errorResponse("UNAUTHORIZED");
    }

    // Get the Discord token from server-side storage
    const token = await getDiscordToken(session.user.id);
    if (!token) {
      return errorResponse("UNAUTHORIZED");
    }

    // Check if user has permission for this guild
    const hasPermission = await isAllowedGuild(token, guildId);
    if (!hasPermission) {
      return errorResponse("FORBIDDEN");
    }

    // Check if stream exists and get its event IDs
    const existingStream = await prisma.stream_table_tied.findUnique({
      where: { stream_id: parseInt(streamId) },
    });

    if (!existingStream) {
      return errorResponse("NOT FOUND");
    }

    // Delete associated Discord event if it exists
    if (existingStream.event_id) {
      await deleteDiscordEvent(guildId, existingStream.event_id);
    }

    // Delete associated Twitch segment if it exists
    if (existingStream.twitch_segment_id) {
      // Get the streamer info to find the Twitch user ID
      const streamer = await prisma.streamer_lookup.findFirst({
        where: { streamer_id: parseInt(existingStream.streamer_id) },
      });

      if (streamer?.twitch_user_id) {
        try {
          // Get a valid Twitch access token
          const twitchAccessToken = await getDecryptedTokens(guildId);
          await deleteTwitchSegment(
            streamer.twitch_user_id,
            existingStream.twitch_segment_id,
            twitchAccessToken.accessToken
          );
        } catch (error) {
          console.error("Failed to delete Twitch segment:", error);
        }
      }
    }

    // Delete the stream
    await prisma.stream_table_tied.delete({
      where: { stream_id: parseInt(streamId) },
    });

    // Revalidate the streams page to refresh data
    revalidatePath(`/${guildId}/manage`);

    return successResponse(null, "UNAUTHORIZED");
  } catch (error) {
    console.error("Error deleting stream:", error);
    return errorResponse("ERROR");
  }
}

export const deleteStreamAction = createRateLimitedStructuredAction(
  "deleteStream",
  deleteStreamActionImpl,
  "stream"
);

async function fetchStreamsActionImpl(
  streamerId: string,
  dateStart: Date,
  dateEnd?: Date
): Promise<NormalizedResponse<Stream[]>> {
  try {
    // Create start date from timestamp
    const date1 = dateStart;

    // Handle the case where dateEnd is provided vs. calculating a week
    let date2;
    if (dateEnd) {
      // If dateEnd is provided, use it directly
      date2 = dateEnd;
    } else {
      // If not, default to one week from dateStart
      const oneWeek = 604800000; // One week in milliseconds
      date2 = new Date(date1.getTime() + oneWeek);
    }

    // Query streams within the date range for the specific streamer
    const streams = await prisma.stream_table_tied.findMany({
      where: {
        streamer_id: streamerId,
        stream_date: {
          gte: date1,
          lt: date2,
        },
      },
    });

    return successResponse(streams, "OKAY");
  } catch (error) {
    console.error("Error fetching streams:", error);
    return errorResponse("ERROR");
  }
}

export const fetchStreamsAction = createRateLimitedStructuredAction(
  "fetchStreams",
  fetchStreamsActionImpl,
  "stream"
);

async function editStreamActionImpl(
  streamId: string,
  guildId: string,
  newName: string,
  newTime: string,
  newDuration: number
): Promise<NormalizedResponse<Stream>> {
  try {
    // Get the current user session
    const session = await auth();
    if (!session?.user?.id) {
      return errorResponse("UNAUTHORIZED");
    }

    // Get the Discord token from server-side storage
    const token = await getDiscordToken(session.user.id);
    if (!token) {
      return errorResponse("UNAUTHORIZED");
    }

    // Check if the user has permission for this guild
    const hasPermission = await isAllowedGuild(token, guildId);
    if (!hasPermission) {
      return errorResponse("UNAUTHORIZED");
    }

    // Check if stream exists
    const existingStream = await prisma.stream_table_tied.findUnique({
      where: { stream_id: parseInt(streamId) },
    });

    if (!existingStream) {
      return errorResponse("NOT FOUND");
    }

    // Convert timestamp to Date object for database and event updates
    const streamDate = new Date(parseInt(newTime) * 1000);

    // Update stream in database
    const updatedStream = await prisma.stream_table_tied.update({
      where: { stream_id: parseInt(streamId) },
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
        const twitchAccessToken = (await getDecryptedTokens(guildId))
          .accessToken;
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

    // Revalidate the streams page to refresh data
    revalidatePath(`/${guildId}/manage`);

    return successResponse(updatedStream, "OKAY");
  } catch (error) {
    console.error("Error updating stream:", error);
    return errorResponse("UNAUTHORIZED");
  }
}

export const editStreamAction = createRateLimitedStructuredAction(
  "editStream",
  editStreamActionImpl,
  "stream"
);
