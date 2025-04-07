"use server";

import { auth } from "@/auth";
import { getDiscordToken } from "@/app/lib/discordTokenService";
import { Stream, StreamDataResponse } from "@/components/Streams/types";
import { revalidatePath } from "next/cache";
import { prisma } from "@/app/lib/db";
import { getDecryptedTokens } from "../lib/twitchTokenService";

const TWITCH_CLIENT_ID = process.env.TWITCH_CLIENT_ID;
const TWITCH_CLIENT_SECRET = process.env.TWITCH_CLIENT_SECRET;
const TWITCH_REDIRECT_URI = process.env.TWITCH_REDIRECT_URI!;

async function getBotAuthToken() {
  try {
    const params = new URLSearchParams({
      client_id: TWITCH_CLIENT_ID || "",
      client_secret: TWITCH_CLIENT_SECRET || "",
      grant_type: "client_credentials",
    });

    const response = await fetch("https://id.twitch.tv/oauth2/token", {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: params,
    });

    if (response.ok) {
      const data = await response.json();
      return data.access_token;
    } else {
      const errorText = await response.text();
      console.error("Error response:", errorText);
      throw new Error(
        `Failed to get auth token. Status code: ${response.status}`
      );
    }
  } catch (error) {
    console.error("Error getting auth token:", error);
    throw error;
  }
}

export async function findTwitchIdAction(twitchUserId: string) {
  try {
    let token = await getBotAuthToken();

    const response = await fetch(
      `https://api.twitch.tv/helix/users?id=${twitchUserId}`,
      {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
          "Client-Id": TWITCH_CLIENT_ID || "",
        },
      }
    );

    if (response.ok) {
      const data = await response.json();
      return data;
    } else {
      const errorText = await response.text();
      console.error("Error response:", errorText);
      throw new Error(
        `Failed to get Twitch user. Status code: ${response.status}`
      );
    }
  } catch (error) {
    console.error("Error getting Twitch user by ID:", error);
    throw error;
  }
}

export async function findTwitchNameAction(twitchUserName: string) {
  try {
    let token = await getBotAuthToken();

    const response = await fetch(
      `https://api.twitch.tv/helix/users?login=${twitchUserName}`,
      {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
          "Client-Id": TWITCH_CLIENT_ID || "",
        },
      }
    );

    if (response.ok) {
      const data = await response.json();
      return data;
    } else {
      const errorText = await response.text();
      console.error("Error response:", errorText);
      throw new Error(
        `Failed to get Twitch user. Status code: ${response.status}`
      );
    }
  } catch (error) {
    console.error("Error getting Twitch user by ID:", error);
    throw error;
  }
}

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
        data: null,
      };
    }

    // Get the Discord token from server-side storage
    const token = await getDiscordToken(session.user.id);
    if (!token) {
      return {
        response: "ERROR",
        message: "Unauthorized: Discord token not found",
        data: null,
      };
    }

    // Check if the user has permission for this guild
    const { isAllowedGuild } = await import("@/app/lib/auth");
    const hasPermission = await isAllowedGuild(token, guildId);
    if (!hasPermission) {
      return {
        response: "FORBIDDEN",
        message: "User does not have admin permission for this guild",
        data: null,
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
        data: null,
      };
    }

    // Convert stream date to Date object if it's a string timestamp
    let streamStartTime: string;
    if (typeof stream.stream_date === "string") {
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
        data: null,
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
      data: null,
    };
  }
}

export async function guildHasAuthTokens(guildId: string) {
  try {
    const authTokenCount = await prisma.encryptedToken.count({
      where: { guildId: guildId },
    });

    return authTokenCount >= 2;
  } catch (error) {
    console.error("Error getting Twitch user by ID:", error);
    throw error;
  }
}

export async function getAuthUrl(state: string, guildId: string) {
  try {
    // Define the scopes you need
    const scopes = [
      "user:read:email",
      "channel:manage:schedule",
      // Add other required scopes here
    ].join(" ");

    // Build the authorization URL
    const authUrl = new URL("https://id.twitch.tv/oauth2/authorize");
    authUrl.searchParams.append("client_id", TWITCH_CLIENT_ID!);
    authUrl.searchParams.append("redirect_uri", TWITCH_REDIRECT_URI);
    authUrl.searchParams.append("response_type", "code");
    authUrl.searchParams.append("scope", scopes);
    authUrl.searchParams.append("state", state);

    await prisma.auth_state.create({
      data: {
        state: state,
        guild_id: guildId || "", // Store empty string if no guildId provided
        expires_at: new Date(Date.now() + 10 * 60 * 1000), // 10 minutes
      },
    });

    return authUrl.toString();
  } catch (error) {
    console.error("Error generating auth URL:", error);
  }
}
