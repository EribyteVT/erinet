// app/actions/twitchActions.ts
"use server"

import { auth } from "@/auth";
import { getDiscordToken } from "@/app/lib/discordTokenService";
import { Stream, StreamDataResponse } from "@/components/Streams/types";
import { revalidatePath } from "next/cache";
import { prisma } from "@/app/lib/db";
import { getDecryptedTokens } from "../lib/twitchTokenService";

/**
 * Server action to add a stream event to Twitch
 * Uses server-side authentication and token management
 */
export async function addEventToTwitchAction(
  stream: Stream,
  broadcastId: string,
  guildId: string
): Promise<StreamDataResponse> {
  try {
    // Get the current user session
    const session = await auth();
    if (!session?.user?.id) {
      return { 
        response: "ERROR", 
        message: "Unauthorized: User not authenticated",
        data: null
      };
    }

    // Get the Discord token from server-side storage
    const token = await getDiscordToken(session.user.id);
    if (!token) {
      return { 
        response: "ERROR", 
        message: "Unauthorized: Discord token not found",
        data: null
      };
    }

    // Check if the user has permission for this guild
    const { isAllowedGuild } = await import("@/app/lib/auth");
    const hasPermission = await isAllowedGuild(token, guildId);
    if (!hasPermission) {
      return { 
        response: "FORBIDDEN", 
        message: "User does not have admin permission for this guild",
        data: null
      };
    }

    // Get a valid Twitch access token
    let twitchAccessToken;
    try {
      twitchAccessToken = (await getDecryptedTokens(guildId)).accessToken;
    } catch (error) {
      console.error("Failed to get valid Twitch access token:", error);
      return { 
        response: "ERROR", 
        message: "Twitch authentication not available",
        data: null
      };
    }

    // Convert stream date to Date object if it's a string timestamp
    let streamStartTime: string;
    if (typeof stream.stream_date === 'string') {
      // Check if it's a timestamp
      if (/^\d+$/.test(stream.stream_date)) {
        const date = new Date(parseInt(stream.stream_date) * 1000);
        streamStartTime = date.toISOString();
      } else {
        // It's already a date string
        streamStartTime = stream.stream_date;
      }
    } else {
      // It's already a Date object
      streamStartTime = new Date(stream.stream_date).toISOString();
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
          title: stream.stream_name,
          start_time: streamStartTime,
          duration: parseInt(stream.duration?.toString() || "120"),
          timezone: "Etc/UTC",
        }),
      }
    );

    if (!twitchResponse.ok) {
      const errorData = await twitchResponse.json();
      console.error("Error from Twitch API:", errorData);
      return { 
        response: "ERROR", 
        message: errorData,
        data: null
      };
    }

    const eventData = await twitchResponse.json();
    const segmentId = eventData.data.segments[0].id;

    // Update stream with segment ID
    const updatedStream = await prisma.stream_table_tied.update({
      where: { stream_id: stream.stream_id },
      data: { twitch_segment_id: segmentId },
    });

    // Revalidate the streams page to refresh data
    revalidatePath(`/${guildId}/manage`);

    return {
      response: "OKAY",
      data: updatedStream,
      message: "Twitch event created successfully",
    };
  } catch (error) {
    console.error("Error creating Twitch event:", error);
    return { 
      response: "ERROR", 
      message: "An unexpected error occurred",
      data: null
    };
  }
}