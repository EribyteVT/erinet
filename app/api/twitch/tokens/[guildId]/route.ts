import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/app/lib/db";

// Set these in your environment variables
const TWITCH_CLIENT_ID = process.env.TWITCH_CLIENT_ID!;
const TWITCH_REDIRECT_URI = process.env.TWITCH_REDIRECT_URI!;

export async function GET(
  request: NextRequest,
  { params }: { params: { guildId: string } }
) {
  try {
    const resolvedParams = await Promise.resolve(params);
    const { guildId } = resolvedParams;

    let data = await prisma.encryptedToken.findMany({
      where: {
        guildId: guildId,
      },
    });

    //has to be 2 for auth and refresh
    return NextResponse.json({
      response: "OK",
      data: data.length >= 2,
    });
  } catch (error) {
    console.error("Error generating auth URL:", error);
    return NextResponse.json(
      { error: "Failed to generate authorization URL" },
      { status: 500 }
    );
  }
}
