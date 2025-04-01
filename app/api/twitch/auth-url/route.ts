import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/app/lib/db";

// Set these in your environment variables
const TWITCH_CLIENT_ID = process.env.TWITCH_CLIENT_ID!;
const TWITCH_REDIRECT_URI = process.env.TWITCH_REDIRECT_URI!;

export async function POST(request: NextRequest) {
  try {
    const { state, guildId } = await request.json();

    // Define the scopes you need
    const scopes = [
      "user:read:email",
      "channel:manage:schedule",
      // Add other required scopes here
    ].join(" ");

    // Build the authorization URL
    const authUrl = new URL("https://id.twitch.tv/oauth2/authorize");
    authUrl.searchParams.append("client_id", TWITCH_CLIENT_ID);
    authUrl.searchParams.append("redirect_uri", TWITCH_REDIRECT_URI);
    authUrl.searchParams.append("response_type", "code");
    authUrl.searchParams.append("scope", scopes);
    authUrl.searchParams.append("state", state);

    await prisma.auth_state.create({
      data: {
        state: state,
        guild_id: guildId || "", // Store empty string if no guildId provided
        expires_at: new Date(Date.now() + 10 * 60 * 1000), // 10 minutes
      },
    });

    return NextResponse.json({ url: authUrl.toString() });
  } catch (error) {
    console.error("Error generating auth URL:", error);
    return NextResponse.json(
      { error: "Failed to generate authorization URL" },
      { status: 500 }
    );
  }
}
