"use client";
import React from "react";
import dayjs from "dayjs";
import { useStreams } from "../utils/useStreams";
import { Input } from "@/components/ui/input";
import { DateTimePicker } from "../../../ui/DateTimePicker";
import { TableRow, TableCell } from "@/components/ui/table";
import { Stream, Streamer } from "../../types";
import { Button } from "../../../ui/button";
import { Plus } from "lucide-react";
import { createDiscordEventAction } from "@/app/actions/discordActions";
import { addEventToTwitchAction } from "@/app/actions/twitchActions";

// Helper function to send stream to Discord
async function sendToDiscord(
  stream: Stream,
  guild: string,
  streamerLink: string,
  maxRetries = 3
): Promise<string | null> {
  for (let attempt = 0; attempt < maxRetries; attempt++) {
    try {
      const endDate = dayjs(new Date(stream.stream_date)).add(
        stream.duration!,
        "minutes"
      );

      const response: any = await createDiscordEventAction(
        stream.stream_id.toString(),
        guild,
        stream.stream_name,
        new Date(stream.stream_date).toISOString(),
        endDate.toISOString(),
        streamerLink
      );

      // If successful, return the event ID
      if (response.success) {
        return response.data?.event_id;
      }

      // If we get an error response, throw it to trigger retry logic
      throw new Error(response.message || "Discord API error");
    } catch (error) {
      console.error(
        `Discord event creation attempt ${attempt + 1}/${maxRetries} failed:`,
        error
      );

      // Check if we've reached max retries
      if (attempt >= maxRetries - 1) {
        console.error("Max retries exceeded for Discord event creation");
        return null;
      }

      console.warn(`Retrying Discord event creation...`);
    }
  }

  return null;
}

// Helper function to send stream to Twitch
async function sendToTwitch(
  stream: Stream,
  broadcasterId: string,
  guild: string
) {
  try {
    const response = await addEventToTwitchAction(stream, broadcasterId, guild);
    return response.data!.twitch_segment_id;
  } catch (error) {
    console.error("Error sending to Twitch:", error);
    return null;
  }
}

export const AddRow: React.FC<{
  guild: string;
  onStreamAdded: (stream: Stream) => void;
  setIsLoading: (loading: boolean) => void;
  streamer: Streamer;
  hasTwitchAuth: boolean;
  twitchName: string;
}> = ({
  guild,
  onStreamAdded,
  setIsLoading,
  streamer,
  hasTwitchAuth,
  twitchName,
}) => {
  const [date, setDate] = React.useState(new Date());
  const [time, setTime] = React.useState(dayjs());
  const [name, setName] = React.useState("");
  const [duration, setDuration] = React.useState("150");
  const { addStream } = useStreams(guild, streamer.streamer_id);

  const handleSubmit = async () => {
    if (!name.trim()) {
      alert("Please enter a stream name");
      return;
    }

    setIsLoading(true);
    try {
      // Configure date for submission
      date.setHours(0);
      date.setMinutes(0);
      date.setSeconds(0);
      date.setMilliseconds(0);

      const fullTime =
        Math.floor(date.getTime() / 1000) +
        time.hour() * 3600 +
        time.minute() * 60;

      // Add the stream
      const result = await addStream({
        name,
        time: fullTime.toString(),
        duration,
        guild,
      });

      if (result.success && result.data) {
        let updatedStream = result.data;

        // Auto-create Discord event if enabled
        if (streamer.auto_discord_event === "Y") {
          try {
            setIsLoading(true);
            const eventId = await sendToDiscord(
              updatedStream,
              guild,
              streamer.streamer_link!
            );
            if (eventId) {
              updatedStream.event_id = eventId;
            }

            // Add a small delay before any subsequent API calls
            await new Promise((resolve) => setTimeout(resolve, 500));
          } catch (error) {
            console.error("Error creating Discord event:", error);
            // You could add a toast notification here if desired
          }
        }

        // Auto-create Twitch schedule if enabled
        if (
          streamer.auto_twitch_schedule === "Y" &&
          hasTwitchAuth &&
          streamer.twitch_user_id
        ) {
          const segmentId = await sendToTwitch(
            updatedStream,
            streamer.twitch_user_id,
            guild
          );
          if (segmentId) {
            updatedStream.twitch_segment_id = segmentId;
          }
        }

        onStreamAdded(updatedStream);
        setName("");
      }
    } catch (error) {
      console.error("Error adding stream:", error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <TableRow>
      {/* <TableCell></TableCell> */}
      <TableCell>
        <Button
          onClick={handleSubmit}
          size="sm"
          className="bg-green-500 hover:bg-green-600 text-white"
        >
          <Plus />
        </Button>
      </TableCell>

      <TableCell>
        <Input
          placeholder="Stream Name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="max-w-sm"
        />
      </TableCell>
      <TableCell>
        <DateTimePicker
          date={date}
          setDate={setDate}
          time={time}
          setTime={setTime}
        />
      </TableCell>
      <TableCell>
        <Input
          placeholder="Duration (seconds)"
          value={duration}
          onChange={(e) => setDuration(e.target.value)}
          className="max-w-[120px]"
        />
      </TableCell>
      <TableCell>-</TableCell>
      <TableCell>-</TableCell>
      <TableCell></TableCell>
    </TableRow>
  );
};

export default AddRow;
