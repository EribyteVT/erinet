// app/api/discord/events/route.ts
import { NextRequest } from "next/server";
import { prisma } from "@/app/lib/db";
import { isAllowedGuild } from "@/app/lib/auth";
import { createDiscordEvent } from "@/app/lib/discord-api";
import {
  successResponse,
  errorResponse,
  forbiddenResponse,
  withErrorHandling,
  extractParams,
} from "@/app/lib/api-utils";

export const POST = withErrorHandling(async (request: NextRequest) => {
  const body = await request.json();

  // Extract and validate required parameters
  const params = extractParams(body, [
    "authToken",
    "guildId",
    "streamId",
    "name",
    "startTime",
    "endTime",
  ]);

  if (!params) {
    return errorResponse("Missing required parameters", 400);
  }

  const { authToken, guildId, streamId, name, startTime, endTime } = params;

  // Check Discord permissions
  const isAllowed = await isAllowedGuild(authToken, guildId);
  if (!isAllowed) {
    return forbiddenResponse();
  }

  // Create Discord event
  const eventData = await createDiscordEvent(guildId, name, startTime, endTime);
  const eventId = eventData.id;

  // Update stream with event ID
  const updatedStream = await prisma.stream_table_tied.update({
    where: { stream_id: parseInt(streamId) },
    data: { event_id: eventId.toString() },
  });

  return successResponse(updatedStream);
});
