"use server";

import { auth } from "@/auth";
import { getDiscordToken } from "@/app/lib/discordTokenService";
import { revalidatePath } from "next/cache";
import { prisma } from "@/app/lib/db";
import { Streamer } from "@/components/Streams/types";

export async function setAutosAction(
  streamerId: number,
  guildId: string,
  setDiscord: string,
  setTwitch: string
): Promise<Streamer | null> {
  try {
    // Get the current user session
    const session = await auth();
    if (!session?.user?.id) {
      return null;
      // return {
      //   response: "ERROR",
      //   message: "Unauthorized: User not authenticated"
      // };
    }

    // Get the Discord token from server-side storage
    const token = await getDiscordToken(session.user.id);
    if (!token) {
      return null;
      // return {
      //   response: "ERROR",
      //   message: "Unauthorized: Discord token not found"
      // };
    }

    // Check if the user has permission for this guild
    const { isAllowedGuild } = await import("@/app/lib/auth");
    const hasPermission = await isAllowedGuild(token, guildId);
    if (!hasPermission) {
      return null;
      // return {
      //   response: "FORBIDDEN",
      //   message: "User does not have admin permission for this guild"
      // };
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

    return streamer;
  } catch (error) {
    console.error("Error updating streamer auto settings:", error);
    throw new Error("Failed to update auto settings");
  }
}

export async function setStreamerTwitchAction(
  streamerId: number,
  twitchId: string,
  guildId: string
) {
  try {
    // Get the current user session
    const session = await auth();
    if (!session?.user?.id) {
      return {
        response: "ERROR",
        message: "Unauthorized: User not authenticated",
      };
    }

    // Get the Discord token from server-side storage
    const token = await getDiscordToken(session.user.id);
    if (!token) {
      return {
        response: "ERROR",
        message: "Unauthorized: Discord token not found",
      };
    }

    // Check if the user has permission for this guild
    const { isAllowedGuild } = await import("@/app/lib/auth");
    const hasPermission = await isAllowedGuild(token, guildId);
    if (!hasPermission) {
      return {
        response: "FORBIDDEN",
        message: "User does not have admin permission for this guild",
      };
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

    return {
      response: "OK",
      data: streamer,
    };
  } catch (error) {
    console.error("Error adding Twitch to streamer:", error);
    return {
      response: "ERROR",
      message: "An error occurred while updating the streamer",
    };
  }
}

export async function createStreamerAction(
  streamerName: string,
  levelSystem: string,
  timezone: string,
  guildId: string
) {
  try {
    // Get the current user session
    const session = await auth();
    if (!session?.user?.id) {
      return {
        response: "ERROR",
        message: "Unauthorized: User not authenticated",
      };
    }

    // Get the Discord token from server-side storage
    const token = await getDiscordToken(session.user.id);
    if (!token) {
      return {
        response: "ERROR",
        message: "Unauthorized: Discord token not found",
      };
    }

    // Check if the user has permission for this guild
    const { isAllowedGuild } = await import("@/app/lib/auth");
    const hasPermission = await isAllowedGuild(token, guildId);
    if (!hasPermission) {
      return {
        response: "FORBIDDEN",
        message: "User does not have admin permission for this guild",
      };
    }

    const existingStreamer = await prisma.streamer_lookup.findFirst({
      where: { guild: guildId },
    });

    if (existingStreamer) {
      return {
        response: "ERROR",
        message: "A streamer already exists for this guild",
      };
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

    // Revalidate the streams page to refresh data
    revalidatePath(`/${guildId}/onboarding`);

    return {
      response: "OKAY",
      data: newStreamer,
    };
  } catch (error) {
    console.error("Error adding Twitch to streamer:", error);
    return {
      response: "ERROR",
      message: "An error occurred while updating the streamer",
    };
  }
}
