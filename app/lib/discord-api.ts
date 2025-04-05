"use server";

import { auth } from "@/auth";
import { getDiscordToken } from "./discordTokenService";

const DISCORD_BOT_TOKEN = process.env.DISCORD_BOT_TOKEN;

export async function createDiscordEvent(
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

/**
 * Updates an existing Discord scheduled event
 */
export async function updateDiscordEvent(
  guildId: string,
  eventId: string,
  name: string,
  startTime: string,
  endTime: string,
  location: string = "https://twitch.tv/EribyteVT"
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

export async function getBotGuilds(): Promise<any[]> {
  try {
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

    return await response.json();
  } catch (error) {
    console.error("Error fetching bot guilds:", error);
    throw error;
  }
}

export async function getUserGuilds(): Promise<any[]> {
  console.log("HERE");
  // Get the authenticated user's session
  const session = await auth();

  if (!session?.user?.id) {
    throw new Error("User not authenticated");
  }

  // Get the token from the database
  const token = await getDiscordToken(session.user.id);
  if (!token) {
    throw new Error("Discord token not found or expired");
  }

  // Perform the API call
  const response = await fetch("https://discord.com/api/v10/users/@me/guilds", {
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
  });

  console.log(response);

  if (!response.ok) {
    throw new Error(`Discord API error: ${response.status}`);
  }

  return await response.json();
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

export async function formatApiResponse(data: any, status: string = "OK") {
  return {
    response: status,
    data,
  };
}

export async function formatApiError(message: string, status: number = 500) {
  return {
    response: "ERROR",
    message,
    status,
  };
}
