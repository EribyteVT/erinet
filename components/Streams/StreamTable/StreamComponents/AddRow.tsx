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
import type { Session } from "next-auth";
import ErinetCrudWrapper from "@/components/Adapter/erinetCrudWrapper";

// Helper function to send stream to Discord
async function sendToDiscord(
  stream: Stream,
  authToken: string,
  guild: string,
  apiBaseUrl: string,
  twitchName: string
) {
  try {
    const wrapper = ErinetCrudWrapper(apiBaseUrl);
    const response = await wrapper.addEventToGuild(
      stream,
      authToken,
      guild,
      twitchName
    );
    return response.data.event_id;
  } catch (error) {
    console.error("Error sending to Discord:", error);
    return null;
  }
}

// Helper function to send stream to Twitch
async function sendToTwitch(
  stream: Stream,
  discordAuthToken: string,
  broadcasterId: string,
  guild: string,
  apiBaseUrl: string
) {
  try {
    const wrapper = ErinetCrudWrapper(apiBaseUrl);
    const response = await wrapper.addEventToTwitch(
      stream,
      discordAuthToken,
      broadcasterId,
      guild
    );
    return response.data.twitch_segment_id;
  } catch (error) {
    console.error("Error sending to Twitch:", error);
    return null;
  }
}

export const AddRow: React.FC<{
  guild: string;
  session: Session;
  onStreamAdded: (stream: Stream) => void;
  setIsLoading: (loading: boolean) => void;
  streamer: Streamer;
  hasTwitchAuth: boolean;
  apiBaseUrl: string;
  twitchName: string;
}> = ({
  guild,
  session,
  onStreamAdded,
  setIsLoading,
  streamer,
  hasTwitchAuth,
  apiBaseUrl,
  twitchName,
}) => {
  const [date, setDate] = React.useState(new Date());
  const [time, setTime] = React.useState(dayjs());
  const [name, setName] = React.useState("");
  const [duration, setDuration] = React.useState("150");
  const { addStream } = useStreams(guild, streamer.streamer_id, apiBaseUrl);

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
        accessToken: session.user.discordAccount?.access_token!,
      });

      if (result.success && result.data) {
        let updatedStream = result.data;

        // Auto-create Discord event if enabled
        if (streamer.auto_discord_event === "Y") {
          const eventId = await sendToDiscord(
            updatedStream,
            session.user.discordAccount?.access_token!,
            guild,
            apiBaseUrl,
            twitchName
          );
          if (eventId) {
            updatedStream.event_id = eventId;
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
            session.user.discordAccount?.access_token!,
            streamer.twitch_user_id,
            guild,
            apiBaseUrl
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
