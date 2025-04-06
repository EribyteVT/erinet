import { NextResponse } from "next/server";
import { cache } from "@/app/lib/cache";
import { getBotGuilds } from "@/app/lib/discord-api";

const CACHE_KEY = "botGuilds";
const CACHE_EXPIRATION = 5 * 60 * 1000; // 5 minutes in milliseconds

export async function GET(request: Request) {
  try {
    // Try to get from cache first
    let guilds = cache.get(CACHE_KEY);

    // If not in cache, fetch fresh data
    if (!guilds) {
      console.log("Cache miss for botGuilds, fetching from Discord API");
      guilds = await getBotGuilds();

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
