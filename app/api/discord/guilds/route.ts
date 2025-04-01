import { NextResponse } from "next/server";
import { cache } from "@/app/lib/cache";

const CACHE_KEY = "botGuilds";
const CACHE_EXPIRATION = 5 * 60 * 1000; // 5 minutes in milliseconds

async function getUsersGuilds(authToken: string) {
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
    console.error("Error fetching bot guilds:", error);
    throw error;
  }
}

export async function GET(request: Request) {
  try {
    // Try to get from cache first
    let guilds = cache.get(CACHE_KEY);

    // If not in cache, fetch fresh data
    if (!guilds) {
      console.log("Cache miss for botGuilds, fetching from Discord API");
      guilds = await getUsersGuilds(`Bot ${process.env.DISCORD_BOT_TOKEN}`);

      // Cache the result
      cache.set(CACHE_KEY, guilds, CACHE_EXPIRATION);
    } else {
      console.log("Cache hit for botGuilds");
    }

    return NextResponse.json(guilds);
  } catch (error) {
    console.error("Error in getBotGuilds:", error);
    return NextResponse.json({ response: "ERROR" }, { status: 500 });
  }
}
