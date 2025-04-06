"use server";

import { auth } from "@/auth";
import { getDiscordToken } from "@/app/lib/discordTokenService";
import { GuildData } from "@/components/Streams/types";
import { isAllowedGuild } from "../lib/auth";
import  { createDiscordEvent } from "@/app/lib/discord-api";

export async function fetchUserGuilds(): Promise<GuildData[]> {
  const session = await auth();

  if (!session?.user?.id) {
    throw new Error("User not authenticated");
  }

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

  return await response.json();
}

export async function fetchSpecificUserGuild(
  guildId: string
): Promise<GuildData | null> {
  const session = await auth();

  if (!session?.user?.id) {
    throw new Error("User not authenticated");
  }

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

  let guilds = await response.json();

  let guild = null;

  guilds.forEach((element: GuildData) => {
    if (guildId == element.id) {
      guild = element;
    }
  });

  if (!response.ok) {
    throw new Error(`Discord API error: ${response.status}`);
  }


  return guild;

  //   return await response.json();
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
    const hasPermission = await isAllowedGuild(token, guildId);
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