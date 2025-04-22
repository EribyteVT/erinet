"use server";

import { auth } from "@/auth";
import { getDiscordToken } from "@/app/lib/discordTokenService";
import { GuildData, Stream } from "@/components/Streams/types";
import { isAllowedGuild } from "../lib/auth";
import { prisma } from "@/app/lib/db";
import { cache } from "@/app/lib/cache";
import {
  errorResponse,
  NormalizedResponse,
  successResponse,
} from "../lib/api-utils";
import { createRateLimitedStructuredAction } from "../lib/actionRegistry";

// Configuration
const DISCORD_BOT_TOKEN = process.env.DISCORD_BOT_TOKEN;
const GUILD_CACHE_DURATION = 30 * 60 * 1000; // 30 minutes, users shouldn't join many guilds
const BOT_GUILDS_CACHE_KEY = "botGuilds";
const BOT_GUILDS_CACHE_EXPIRATION = 5 * 60 * 1000; // 5 minutes

// Discord Event Management
async function createDiscordEvent(
  guildId: string,
  name: string,
  startTime: string,
  endTime: string,
  location: string
): Promise<any> {
  try {
    const response = await fetch(
      `https://discord.com/api/v10/guilds/${guildId}/scheduled-events`,
      {
        method: "POST",
        headers: {
          Authorization: `Bot ${DISCORD_BOT_TOKEN}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name,
          scheduled_start_time: startTime,
          scheduled_end_time: endTime,
          entity_type: 3, // External event
          privacy_level: 2, // Guild only (only option for now)
          entity_metadata: {
            location,
          },
        }),
      }
    );

    if (!response.ok) {
      const errorData = await response.json();
      console.error("Discord API error:", errorData);
      throw new Error(
        `Failed to create Discord event: ${JSON.stringify(errorData)}`
      );
    }

    return await response.json();
  } catch (error) {
    console.error("Error creating Discord event:", error);
    throw error;
  }
}

export async function updateDiscordEvent(
  guildId: string,
  eventId: string,
  name: string,
  startTime: string,
  endTime: string,
  location: string
): Promise<boolean> {
  try {
    const response = await fetch(
      `https://discord.com/api/v10/guilds/${guildId}/scheduled-events/${eventId}`,
      {
        method: "PATCH",
        headers: {
          Authorization: `Bot ${DISCORD_BOT_TOKEN}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name,
          scheduled_start_time: startTime,
          scheduled_end_time: endTime,
          entity_type: 3, // External event
          privacy_level: 2, // Guild only
          entity_metadata: {
            location,
          },
        }),
      }
    );

    if (!response.ok) {
      const errorData = await response.json();
      console.error("Discord API error:", errorData);
      return false;
    }

    return true;
  } catch (error) {
    console.error("Error updating Discord event:", error);
    return false;
  }
}

export async function deleteDiscordEvent(
  guildId: string,
  eventId: string
): Promise<boolean> {
  try {
    const response = await fetch(
      `https://discord.com/api/v10/guilds/${guildId}/scheduled-events/${eventId}`,
      {
        method: "DELETE",
        headers: {
          Authorization: `Bot ${DISCORD_BOT_TOKEN}`,
          "Content-Type": "application/json",
        },
      }
    );

    return response.ok;
  } catch (error) {
    console.error("Error deleting Discord event:", error);
    return false;
  }
}

// Guild Management
async function getBotGuildsImpl(): Promise<NormalizedResponse<GuildData[]>> {
  try {
    // Try to get from cache first
    let guilds: any[] | null = cache.get(BOT_GUILDS_CACHE_KEY);

    // If not in cache, fetch fresh data
    if (!guilds) {
      console.log("Cache miss for botGuilds, fetching from Discord API");
      const response = await fetch(
        "https://discord.com/api/v10/users/@me/guilds",
        {
          headers: {
            Authorization: `Bot ${DISCORD_BOT_TOKEN}`,
            "Content-Type": "application/json",
          },
        }
      );

      if (!response.ok) {
        throw new Error(`Discord API error: ${response.status}`);
      }

      guilds = await response.json();

      // Cache the result
      cache.set(BOT_GUILDS_CACHE_KEY, guilds, BOT_GUILDS_CACHE_EXPIRATION);
    } else {
      console.log("Cache hit for botGuilds");
    }

    return successResponse(guilds, "OKAY");
  } catch (error) {
    console.error("Error fetching bot guilds:", error);
    throw error;
  }
}

export const getBotGuilds = createRateLimitedStructuredAction(
  "getBotGuilds",
  getBotGuildsImpl,
  "discord"
);

async function fetchUserGuildsImpl(): Promise<NormalizedResponse<GuildData[]>> {
  const session = await auth();
  if (!session?.user?.id) {
    throw new Error("User not authenticated");
  }

  // Create a cache key based on the user ID
  const cacheKey = `user_guilds:${session.user.id}`;

  // Check if we have cached data for this user
  const cachedGuilds = cache.get<GuildData[]>(cacheKey);

  if (cachedGuilds) {
    console.log(`cache hit for ${cacheKey}`);
    return successResponse(cachedGuilds, "OKAY");
  }

  console.log(`cache miss for ${cacheKey}`);

  // If not in cache, fetch from Discord API
  const token = await getDiscordToken(session.user.id);
  if (!token) {
    throw new Error("Discord token not found or expired");
  }

  const response = await fetch("https://discord.com/api/v10/users/@me/guilds", {
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
  });

  if (!response.ok) {
    throw new Error(`Discord API error: ${response.status}`);
  }

  // Get the guilds data
  const guilds: GuildData[] = await response.json();

  // Store in cache for future use
  cache.set(cacheKey, guilds, GUILD_CACHE_DURATION);

  return successResponse(guilds, "OKAY");
}

export const fetchUserGuilds = createRateLimitedStructuredAction(
  "fetchUserGuilds",
  fetchUserGuildsImpl,
  "discord"
);

async function fetchSpecificUserGuildImpl(
  guildId: string
): Promise<NormalizedResponse<GuildData | null>> {
  const MAX_RETRIES = 3;
  const RETRY_DELAY = 1000; // 1 second delay between retries

  const session = await auth();
  if (!session?.user?.id) {
    throw new Error("User not authenticated");
  }

  // Create cache keys
  const specificGuildCacheKey = `specific_guild:${session.user.id}:${guildId}`;
  const allGuildsCacheKey = `user_guilds:${session.user.id}`;

  // Check if we have the specific guild cached
  const cachedGuild = cache.get<GuildData | null>(specificGuildCacheKey);
  if (cachedGuild !== null) {
    console.log("CACHED GUILD");
    return successResponse(cachedGuild, "OKAY");
  }

  // Check if we have all guilds cached
  let guilds = cache.get<GuildData[]>(allGuildsCacheKey);

  // If not in cache, fetch from Discord API with retry logic
  if (!guilds) {
    for (let attempt = 0; attempt < MAX_RETRIES; attempt++) {
      try {
        const token = await getDiscordToken(session.user.id);
        if (!token) {
          throw new Error("Discord token not found or expired");
        }

        const response = await fetch(
          "https://discord.com/api/v10/users/@me/guilds",
          {
            headers: {
              Authorization: `Bearer ${token}`,
              "Content-Type": "application/json",
            },
          }
        );

        if (!response.ok) {
          const errorStatus = response.status;
          console.error(
            `Discord API error on attempt ${attempt + 1}: ${errorStatus}`
          );

          // Check if we should retry based on status code
          if (
            errorStatus === 429 ||
            (errorStatus >= 500 && errorStatus < 600)
          ) {
            // Rate limit or server error - worth retrying
            if (attempt < MAX_RETRIES - 1) {
              console.log(`Waiting ${RETRY_DELAY}ms before retry...`);
              await new Promise((resolve) => setTimeout(resolve, RETRY_DELAY));
              continue;
            }
          }

          throw new Error(`Discord API error: ${errorStatus}`);
        }

        guilds = await response.json();

        // Cache all guilds
        cache.set(allGuildsCacheKey, guilds, GUILD_CACHE_DURATION);

        // Success, break out of retry loop
        break;
      } catch (error) {
        if (attempt === MAX_RETRIES - 1) {
          // This was our last attempt, rethrow the error
          console.error(
            `Failed to fetch guilds after ${MAX_RETRIES} attempts:`,
            error
          );
          throw error;
        }

        console.log(
          `Attempt ${attempt + 1} failed, retrying after ${RETRY_DELAY}ms`
        );
        await new Promise((resolve) => setTimeout(resolve, RETRY_DELAY));
      }
    }
  }

  let guild = null;

  guilds!.forEach((element: GuildData) => {
    if (guildId == element.id) {
      guild = element;
    }
  });

  // Cache the result for this specific guild (even if null)
  cache.set(specificGuildCacheKey, guild, GUILD_CACHE_DURATION);

  return successResponse(guild, "OKAY");
}

export const fetchSpecificUserGuild = createRateLimitedStructuredAction(
  "fetchSpecificUserGuild",
  fetchSpecificUserGuildImpl,
  "discord"
);

async function createDiscordEventActionImpl(
  streamId: string,
  guildId: string,
  name: string,
  startTime: string,
  endTime: string,
  location: string
): Promise<NormalizedResponse<Stream>> {
  try {
    // Get the current user session
    const session = await auth();
    if (!session?.user?.id) {
      return errorResponse("ERROR");
    }

    // Get the Discord token from server-side storage
    const token = await getDiscordToken(session.user.id);
    if (!token) {
      return errorResponse("ERROR");
    }

    // Check if the user has permission for this guild
    const hasPermission = await isAllowedGuild(null, guildId);
    if (!hasPermission) {
      return errorResponse("FORBIDDEN");
    }

    // Call the Discord API to create the event
    const eventData = await createDiscordEvent(
      guildId,
      name,
      startTime,
      endTime,
      location
    );

    const updatedStream = await prisma.stream_table_tied.update({
      where: { stream_id: parseInt(streamId) },
      data: { event_id: eventData.id },
    });

    return successResponse(updatedStream, "OKAY");
  } catch (error) {
    console.error("Error creating Discord event:", error);
    return errorResponse("ERROR");
  }
}

export const createDiscordEventAction = createRateLimitedStructuredAction(
  "createDiscordEventAction",
  createDiscordEventActionImpl,
  "discord"
);

async function fetchGuildChannelsImpl(
  guildId: string
): Promise<NormalizedResponse<any[]>> {
  try {
    // Get the current user session
    const session = await auth();
    if (!session?.user?.id) {
      return errorResponse("Unauthorized: User not authenticated");
    }

    // Get the Discord token from server-side storage
    const token = await getDiscordToken(session.user.id);
    if (!token) {
      return errorResponse("Unauthorized: Discord token not found");
    }

    // Check if the user has permission for this guild
    const hasPermission = await isAllowedGuild(null, guildId);
    if (!hasPermission) {
      return errorResponse(
        "Forbidden: User does not have admin permission for this guild"
      );
    }

    // Call Discord API to get channels
    const response = await fetch(
      `https://discord.com/api/v10/guilds/${guildId}/channels`,
      {
        headers: {
          Authorization: `Bot ${DISCORD_BOT_TOKEN}`,
          "Content-Type": "application/json",
        },
      }
    );

    if (!response.ok) {
      console.error(`Discord API error: ${response.status}`);
      return errorResponse(`Failed to fetch channels: ${response.statusText}`);
    }

    const channels = await response.json();

    // Filter to only text channels (type 0)
    const textChannels = channels.filter((channel: any) => channel.type === 0);

    return successResponse(textChannels, "Channels fetched successfully");
  } catch (error) {
    console.error("Error fetching guild channels:", error);
    return errorResponse("An unexpected error occurred");
  }
}

export const fetchGuildChannels = createRateLimitedStructuredAction(
  "fetchGuildChannels",
  fetchGuildChannelsImpl,
  "discord"
);

async function sendScheduleMessageImpl(
  guildId: string,
  channelId: string,
  streamerId: number
): Promise<NormalizedResponse<any>> {
  try {
    // Get the current user session
    const session = await auth();
    if (!session?.user?.id) {
      return errorResponse("Unauthorized: User not authenticated");
    }

    // Get the Discord token from server-side storage
    const token = await getDiscordToken(session.user.id);
    if (!token) {
      return errorResponse("Unauthorized: Discord token not found");
    }

    // Check if the user has permission for this guild
    const hasPermission = await isAllowedGuild(null, guildId);
    if (!hasPermission) {
      return errorResponse(
        "Forbidden: User does not have admin permission for this guild"
      );
    }

    // Get the streamer info
    const streamer = await prisma.streamer_lookup.findFirst({
      where: { streamer_id: streamerId },
    });

    if (!streamer) {
      return errorResponse("Streamer not found");
    }

    // Get streams for the next week
    const today = new Date();
    const nextWeek = new Date();
    nextWeek.setDate(today.getDate() + 7);

    const streams = await prisma.stream_table_tied.findMany({
      where: {
        streamer_id: streamerId.toString(),
        stream_date: {
          gte: today,
          lt: nextWeek,
        },
      },
      orderBy: {
        stream_date: "asc",
      },
    });

    // Format message
    let messageContent = `# ${streamer.streamer_name}'s Stream Schedule\n\n`;

    if (streams.length === 0) {
      messageContent += "No streams scheduled for the coming week.";
    } else {
      messageContent += "Upcoming streams:\n\n";

      for (const stream of streams) {
        const date = new Date(stream.stream_date);

        let timestamp = date.getTime() / 1000;

        const duration = stream.duration ? `(${stream.duration} minutes)` : "";

        messageContent += `- **${stream.stream_name}** at <t:${timestamp}:f> (<t:${timestamp}:R>)\n`;
      }
    }

    // Add a footer
    messageContent +=
      "\n-# *This schedule was posted via [Eribot](https://eri.bot)*";

    // Send message to Discord
    const response = await fetch(
      `https://discord.com/api/v10/channels/${channelId}/messages`,
      {
        method: "POST",
        headers: {
          Authorization: `Bot ${DISCORD_BOT_TOKEN}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          content: messageContent,
        }),
      }
    );

    if (!response.ok) {
      const errorData = await response.json();
      console.error("Discord API error:", errorData);
      return errorResponse(
        `Failed to send message: ${JSON.stringify(errorData)}`
      );
    }

    const messageData = await response.json();

    // Update the streamer_lookup table with the message ID
    await prisma.streamer_lookup.update({
      where: { streamer_id: streamerId },
      data: { schedule_message_id: messageData.id },
    });

    return successResponse(messageData, "Schedule message sent successfully");
  } catch (error) {
    console.error("Error sending schedule message:", error);
    return errorResponse("An unexpected error occurred");
  }
}

export const sendScheduleMessage = createRateLimitedStructuredAction(
  "sendScheduleMessage",
  sendScheduleMessageImpl,
  "discord"
);
