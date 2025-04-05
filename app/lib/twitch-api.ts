import { getValidAccessToken } from "./twitchTokenService";

const TWITCH_CLIENT_ID = process.env.TWITCH_CLIENT_ID;
const TWITCH_CLIENT_SECRET = process.env.TWITCH_CLIENT_SECRET;

export async function getBotAuthToken(): Promise<string> {
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

export async function getTwitchUserByLogin(login: string): Promise<any> {
  try {
    const token = await getBotAuthToken();

    const response = await fetch(
      `https://api.twitch.tv/helix/users?login=${login}`,
      {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
          "Client-Id": TWITCH_CLIENT_ID || "",
        },
      }
    );

    if (response.ok) {
      return await response.json();
    } else {
      const errorText = await response.text();
      console.error("Error response:", errorText);
      throw new Error(
        `Failed to get Twitch user. Status code: ${response.status}`
      );
    }
  } catch (error) {
    console.error("Error getting Twitch user by login:", error);
    throw error;
  }
}

export async function getTwitchUserById(userId: string): Promise<any> {
  try {
    const token = await getBotAuthToken();

    const response = await fetch(
      `https://api.twitch.tv/helix/users?id=${userId}`,
      {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
          "Client-Id": TWITCH_CLIENT_ID || "",
        },
      }
    );

    if (response.ok) {
      return await response.json();
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

export async function createTwitchScheduleEvent(
  guildId: string,
  broadcasterId: string,
  title: string,
  startTime: string,
  durationMinutes: number
): Promise<any> {
  try {
    // Get a valid user access token for this guild
    const accessToken = await getValidAccessToken(guildId);

    const response = await fetch(
      `https://api.twitch.tv/helix/schedule/segment?broadcaster_id=${broadcasterId}`,
      {
        method: "POST",
        headers: {
          "Client-Id": TWITCH_CLIENT_ID!,
          Authorization: `Bearer ${accessToken}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          title,
          start_time: new Date(startTime).toISOString(),
          duration: parseInt(String(durationMinutes)),
          timezone: "Etc/UTC",
        }),
      }
    );

    if (!response.ok) {
      const errorData = await response.json();
      console.error("Error from Twitch API:", errorData);
      throw new Error(
        `Failed to create Twitch event: ${JSON.stringify(errorData)}`
      );
    }

    return await response.json();
  } catch (error) {
    console.error("Error creating Twitch event:", error);
    throw error;
  }
}

export async function updateTwitchScheduleEvent(
  guildId: string,
  broadcasterId: string,
  segmentId: string,
  title: string,
  startTime: string,
  durationMinutes: number
): Promise<any> {
  try {
    // Get a valid user access token for this guild
    const accessToken = await getValidAccessToken(guildId);

    const response = await fetch(
      `https://api.twitch.tv/helix/schedule/segment?broadcaster_id=${broadcasterId}&id=${segmentId}`,
      {
        method: "PATCH",
        headers: {
          "Client-Id": TWITCH_CLIENT_ID!,
          Authorization: `Bearer ${accessToken}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          title,
          start_time: startTime,
          duration: durationMinutes,
          timezone: "Etc/UTC",
          is_recurring: false,
        }),
      }
    );

    if (!response.ok) {
      const errorData = await response.json();
      console.error("Error from Twitch API:", errorData);
      throw new Error(
        `Failed to update Twitch event: ${JSON.stringify(errorData)}`
      );
    }

    return await response.json();
  } catch (error) {
    console.error("Error updating Twitch event:", error);
    throw error;
  }
}

export async function deleteTwitchScheduleEvent(
  guildId: string,
  broadcasterId: string,
  segmentId: string
): Promise<boolean> {
  try {
    const accessToken = await getValidAccessToken(guildId);

    const response = await fetch(
      `https://api.twitch.tv/helix/schedule/segment?broadcaster_id=${broadcasterId}&id=${segmentId}`,
      {
        method: "DELETE",
        headers: {
          "Client-Id": TWITCH_CLIENT_ID!,
          Authorization: `Bearer ${accessToken}`,
        },
      }
    );

    return response.ok;
  } catch (error) {
    console.error("Error deleting Twitch segment:", error);
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
