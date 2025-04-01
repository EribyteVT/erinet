const DISCORD_BOT_TOKEN = process.env.DISCORD_BOT_TOKEN;

export async function createDiscordEvent(
  guildId: string,
  name: string,
  startTime: string,
  endTime: string,
  location: string = "https://twitch.tv/EribyteVT"
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

export async function getUserGuilds(authToken: string): Promise<any[]> {
  try {
    const response = await fetch(
      "https://discord.com/api/v10/users/@me/guilds",
      {
        headers: {
          Authorization: authToken,
          "Content-Type": "application/json",
        },
      }
    );

    if (!response.ok) {
      throw new Error(`Discord API error: ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    console.error("Error fetching user guilds:", error);
    throw error;
  }
}

export function formatApiResponse(data: any, status: string = "OK") {
  return {
    response: status,
    data,
  };
}

export function formatApiError(message: string, status: number = 500) {
  return {
    response: "ERROR",
    message,
    status,
  };
}
