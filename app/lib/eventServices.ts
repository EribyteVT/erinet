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
          Authorization: `Bot ${process.env.DISCORD_BOT_TOKEN}`,
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

export async function updateDiscordEvent(
  guildId: string,
  eventId: string,
  name: string,
  startTime: string,
  endTime: string
): Promise<boolean> {
  try {
    const response = await fetch(
      `https://discord.com/api/v10/guilds/${guildId}/scheduled-events/${eventId}`,
      {
        method: "PATCH",
        headers: {
          Authorization: `Bot ${process.env.DISCORD_BOT_TOKEN}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name,
          scheduled_start_time: startTime,
          scheduled_end_time: endTime,
          entity_type: 3, // External event
          privacy_level: 2, // Guild only
          entity_metadata: {
            location: "https://twitch.tv/EribyteVT",
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

export async function deleteTwitchSegment(
  broadcasterId: string,
  segmentId: string,
  accessToken: string
): Promise<boolean> {
  try {
    const response = await fetch(
      `https://api.twitch.tv/helix/schedule/segment?broadcaster_id=${broadcasterId}&id=${segmentId}`,
      {
        method: "DELETE",
        headers: {
          "Client-Id": process.env.TWITCH_CLIENT_ID!,
          Authorization: `Bearer ${accessToken}`,
          "Content-Type": "application/json",
        },
      }
    );

    return response.ok;
  } catch (error) {
    console.error("Error deleting Twitch segment:", error);
    return false;
  }
}

export async function updateTwitchSegment(
  broadcasterId: string,
  segmentId: string,
  title: string,
  startTime: string,
  durationMinutes: number,
  accessToken: string
): Promise<boolean> {
  try {
    // First, create a new segment with updated information
    const response = await fetch(
      `https://api.twitch.tv/helix/schedule/segment?broadcaster_id=${broadcasterId}&id=${segmentId}`,
      {
        method: "PATCH",
        headers: {
          "Client-Id": process.env.TWITCH_CLIENT_ID!,
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
      console.error("Twitch API error creating segment:", errorData);
      return false;
    }

    const createData = await response.json();
    const newSegmentId = createData.data.segments[0].id;

    // Update the segment ID in the database
    await updateSegmentIdInDatabase(segmentId, newSegmentId);

    return true;
  } catch (error) {
    console.error("Error updating Twitch segment:", error);
    return false;
  }
}

/**
 * Helper function to update the segment ID in the database
 */
async function updateSegmentIdInDatabase(
  oldId: string,
  newId: string
): Promise<void> {
  try {
    const { prisma } = await import("@/app/lib/db");

    await prisma.stream_table_tied.updateMany({
      where: { twitch_segment_id: oldId },
      data: { twitch_segment_id: newId },
    });
  } catch (error) {
    console.error("Error updating segment ID in database:", error);
    throw error;
  }
}
