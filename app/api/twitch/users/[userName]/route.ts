// app/api/twitch/users/[userName]/route.ts
import { NextRequest, NextResponse } from "next/server";
import { getTwitchUserByLogin } from "@/app/lib/twitch-api";
import { successResponse, withErrorHandling } from "@/app/lib/api-utils";

export const GET = withErrorHandling(
  async (
    request: NextRequest,
    { params }: { params: Promise<{ userName: string }> }
  ) => {
    const resolvedParams = await Promise.resolve(params);
    const { userName } = resolvedParams;

    const userData = await getTwitchUserByLogin(userName);
    return successResponse({ status: "OKAY", data: userData });
  }
);
