import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/app/lib/db";
import { storeEncryptedTokens } from "@/app/lib/twitchTokenService";
import { redirect } from "next/navigation";

// Set these in your environment variables
const TWITCH_CLIENT_ID = process.env.TWITCH_CLIENT_ID!;
const TWITCH_CLIENT_SECRET = process.env.TWITCH_CLIENT_SECRET!;
const TWITCH_REDIRECT_URI = process.env.TWITCH_REDIRECT_URI!;
const DEFAULT_REDIRECT_URL = process.env.DEFAULT_REDIRECT_URL || "/";

export async function GET(request: NextRequest) {
  try {
    // Get the code and state from query parameters
    const url = new URL(request.url);
    const code = url.searchParams.get("code");
    const state = url.searchParams.get("state");

    if (!code) {
      throw new Error("Authorization code is missing");
    }

    if (!state) {
      throw new Error("State parameter is missing");
    }

    // Look up the state in the database and verify it exists and hasn't expired
    const storedAuthState = await prisma.auth_state.findUnique({
      where: { state },
    });

    if (!storedAuthState) {
      throw new Error("Invalid state parameter");
    }

    if (storedAuthState.expires_at < new Date()) {
      // Clean up the expired state
      await prisma.auth_state.delete({
        where: { state },
      });
      throw new Error("Auth state has expired, please try again");
    }

    const guildId = storedAuthState.guild_id;

    const tokenResponse = await fetch("https://id.twitch.tv/oauth2/token", {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: new URLSearchParams({
        client_id: TWITCH_CLIENT_ID,
        client_secret: TWITCH_CLIENT_SECRET,
        code,
        grant_type: "authorization_code",
        redirect_uri: TWITCH_REDIRECT_URI,
      }),
    });

    const tokenData = await tokenResponse.json();

    if (!tokenResponse.ok) {
      throw new Error("Failed to exchange code for tokens");
    }

    await storeEncryptedTokens(guildId, {
      accessToken: tokenData.access_token,
      refreshToken: tokenData.refresh_token,
      expiresIn: tokenData.expires_in,
    });

    await prisma.auth_state.delete({
      where: { state },
    });

    const successRedirectUrl = guildId
      ? DEFAULT_REDIRECT_URL + `/${guildId}/manage`
      : DEFAULT_REDIRECT_URL;

    return NextResponse.redirect(new URL(successRedirectUrl, request.url));
  } catch (error) {
    console.error("Error in Twitch callback:", error);
    // Redirect to error page or main page with error param
    return NextResponse.redirect(
      new URL(`${DEFAULT_REDIRECT_URL}?auth_error=true`, request.url)
    );
  }
}
