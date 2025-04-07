"use server";

import { auth } from "@/auth";
import { getDiscordToken } from "@/app/lib/discordTokenService";
import { revalidatePath } from "next/cache";
import { prisma } from "@/app/lib/db";
import { Streamer } from "@/components/Streams/types";
import { createRateLimitedStructuredAction } from "../lib/actionRegistry";
import {
  errorResponse,
  NormalizedResponse,
  successResponse,
} from "../lib/api-utils";

async function setAutosActionImpl(
  streamerId: number,
  guildId: string,
  setDiscord: string,
  setTwitch: string
): Promise<NormalizedResponse<Streamer | null>> {
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
    const { isAllowedGuild } = await import("@/app/lib/auth");
    const hasPermission = await isAllowedGuild(token, guildId);
    if (!hasPermission) {
      return errorResponse("FORBIDDEN");
    }

    // Update streamer auto settings
    const streamer = await prisma.streamer_lookup.update({
      where: { streamer_id: streamerId },
      data: {
        auto_discord_event: setDiscord,
        auto_twitch_schedule: setTwitch,
      },
    });

    // Revalidate the streams page to refresh data
    revalidatePath(`/${guildId}/manage`);

    return successResponse(streamer, "OKAY");
  } catch (error) {
    console.error("Error updating streamer auto settings:", error);
    throw new Error("Failed to update auto settings");
  }
}

export const setAutosAction = createRateLimitedStructuredAction(
  "setAutosAction",
  setAutosActionImpl,
  "stream"
);

async function setStreamerTwitchActionImpl(
  streamerId: number,
  twitchId: string,
  guildId: string
) {
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
    const { isAllowedGuild } = await import("@/app/lib/auth");
    const hasPermission = await isAllowedGuild(token, guildId);
    if (!hasPermission) {
      return errorResponse("FORBIDDEN");
    }

    // Update streamer with Twitch ID
    const streamer = await prisma.streamer_lookup.update({
      where: { streamer_id: streamerId },
      data: {
        twitch_user_id: twitchId,
      },
    });

    // Revalidate the streams page to refresh data
    revalidatePath(`/${guildId}/manage`);

    return successResponse(streamer, "OKAY");
  } catch (error) {
    console.error("Error adding Twitch to streamer:", error);
    return errorResponse("ERROR: " + error);
  }
}

export const setStreamerTwitchAction = createRateLimitedStructuredAction(
  "setStreamerTwitchAction",
  setStreamerTwitchActionImpl,
  "stream"
);

async function createStreamerActionImpl(
  streamerName: string,
  levelSystem: string,
  timezone: string,
  guildId: string,
  streamerLink: string
) {
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
    const { isAllowedGuild } = await import("@/app/lib/auth");
    const hasPermission = await isAllowedGuild(token, guildId);
    if (!hasPermission) {
      return errorResponse("FORBIDDEN");
    }

    const existingStreamer = await prisma.streamer_lookup.findFirst({
      where: { guild: guildId },
    });

    if (existingStreamer) {
      return errorResponse("DUPLICATE");
    }

    // Create the new streamer
    const newStreamer = await prisma.streamer_lookup.create({
      data: {
        streamer_name: streamerName,
        timezone: timezone || "UTC", // Use provided timezone or fall back to UTC
        guild: guildId,
        level_system: levelSystem || "N",
        streamer_link: streamerLink,
      },
    });

    // Revalidate the streams page to refresh data
    revalidatePath(`/${guildId}/onboarding`);

    return successResponse(newStreamer, "OKAY");
  } catch (error) {
    console.error("Error adding Twitch to streamer:", error);
    return errorResponse("ERROR");
  }
}

export const createStreamerAction = createRateLimitedStructuredAction(
  "createStreamerAction",
  createStreamerActionImpl,
  "stream"
);

async function getStreamerByGuildActionImpl(guildId: string) {
  try {
    let streamer = await prisma.streamer_lookup.findFirst({
      where: { guild: guildId },
    });

    return successResponse(streamer, "OKAY");
  } catch (error) {
    console.error("Error adding Twitch to streamer:", error);
    return errorResponse("ERROR");
  }
}

export const getStreamerByGuildAction = createRateLimitedStructuredAction(
  "getStreamerByGuildAction",
  getStreamerByGuildActionImpl,
  "stream"
);
