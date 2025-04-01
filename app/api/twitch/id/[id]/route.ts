import { NextRequest, NextResponse } from "next/server";

const TWITCH_CLIENT_ID = process.env.TWITCH_CLIENT_ID;
const TWITCH_CLIENT_SECRET = process.env.TWITCH_CLIENT_SECRET;

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

async function getTwitchUserById(twitchUserId: string, authToken: string) {
  try {
    const response = await fetch(
      `https://api.twitch.tv/helix/users?id=${twitchUserId}`,
      {
        method: "GET",
        headers: {
          Authorization: `Bearer ${authToken}`,
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

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const resolvedParams = await Promise.resolve(params);
    const { id } = resolvedParams;

    const token = await getBotAuthToken();
    const userData = await getTwitchUserById(id, token);

    return NextResponse.json({
      status: "OKAY",
      data: userData,
    });
  } catch (error) {
    console.error("Error in getTwitchUserById API route:", error);

    return NextResponse.json(
      {
        status: "ERROR",
        message:
          error instanceof Error ? error.message : "An unknown error occurred",
      },
      { status: 500 }
    );
  }
}
