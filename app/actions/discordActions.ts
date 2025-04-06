"use server";

import { auth } from "@/auth";
import { getDiscordToken } from "@/app/lib/discordTokenService";
import { GuildData } from "@/components/Streams/types";
import { isAllowedGuild } from "../lib/auth";
import  { createDiscordEvent } from "@/app/lib/discord-api";
import { prisma } from "@/app/lib/db";
import { cache } from "@/app/lib/cache"; // Import the singleton cache instance


// Cache duration for Discord guilds (5 minutes)
const GUILD_CACHE_DURATION = 5 * 60 * 1000;

export async function fetchUserGuilds(): Promise<GuildData[]> {
  const session = await auth();
  if (!session?.user?.id) {
    throw new Error("User not authenticated");
  }
  
  // Create a cache key based on the user ID
  const cacheKey = `user_guilds:${session.user.id}`;
  
  // Check if we have cached data for this user
  const cachedGuilds = cache.get<GuildData[]>(cacheKey);
  if (cachedGuilds) {
    return cachedGuilds;
  }
  
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
  
  return guilds;
}

export async function fetchSpecificUserGuild(
  guildId: string
): Promise<GuildData | null> {
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
    return cachedGuild;
  }
  
  // Check if we have all guilds cached
  let guilds = cache.get<GuildData[]>(allGuildsCacheKey);
  
  // If not in cache, fetch from Discord API
  if (!guilds) {
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
    
    guilds = await response.json();
    
    // Cache all guilds
    cache.set(allGuildsCacheKey, guilds, GUILD_CACHE_DURATION);
  }
  
  let guild = null;

  guilds!.forEach((element: GuildData) => {
    if (guildId == element.id) {
      guild = element;
    }
  });
  
  // Cache the result for this specific guild (even if null)
  cache.set(specificGuildCacheKey, guild, GUILD_CACHE_DURATION);
  
  return guild;
}

export async function checkGuildPermission(guildId: string) {
  // Get the authenticated user's session
  const session = await auth();
  if (!session?.user?.id) {
    return { hasPermission: false };
  }

  // Get the token from the database
  const token = await getDiscordToken(session.user.id);
  if (!token) {
    return { hasPermission: false };
  }

  try {
    const guilds = await fetch("https://discord.com/api/v10/users/@me/guilds", {
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
    }).then((res) => res.json());

    for (const guild of guilds) {
      if (guildId === guild.id) {
        // Check for ADMINISTRATOR permission (0x08)
        const permissions = BigInt(guild.permissions);
        return {
          hasPermission: (permissions & BigInt(0x08)) !== BigInt(0),
        };
      }
    }

    return { hasPermission: false };
  } catch (error) {
    console.error("Error checking guild permissions:", error);
    return { hasPermission: false, error: "Failed to check permissions" };
  }
}



export async function createDiscordEventAction(
  streamId: string,
  guildId: string,
  name: string,
  startTime: string,
  endTime: string,
  location: string = "https://twitch.tv/EribyteVT"
): Promise<{ success: boolean; eventId?: string; message?: string }> {
  try {
    // Get the current user session
    const session = await auth();
    if (!session?.user?.id) {
      return { 
        success: false, 
        message: "Unauthorized: User not authenticated" 
      };
    }

    // Get the Discord token from server-side storage
    const token = await getDiscordToken(session.user.id);
    if (!token) {
      return { 
        success: false, 
        message: "Unauthorized: Discord token not found" 
      };
    }

    // Check if the user has permission for this guild
    const hasPermission = await isAllowedGuild(null, guildId);
    if (!hasPermission) {
      return { 
        success: false, 
        message: "User does not have admin permission for this guild" 
      };
    }

    // Call the Discord API to create the event
    
    const eventData = await createDiscordEvent(
      guildId,
      name,
      startTime,
      endTime,
      location
    );

    console.log("DOODILY DOO")

    console.log(eventData)

    const updatedStream = await prisma.stream_table_tied.update({
        where: { stream_id: parseInt(streamId) },
        data: { event_id: eventData.id },
      });

    return {
      success: true,
      eventId: eventData.id
    };
  } catch (error) {
    console.error("Error creating Discord event:", error);
    return { 
      success: false, 
      message: "An error occurred while creating the Discord event" 
    };
  }
}