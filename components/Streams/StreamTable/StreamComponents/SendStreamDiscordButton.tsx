"use client";
import React, { useState } from "react";
import { Button } from "../../../ui/button";
import { Stream } from "../../types";
import { Check, Loader2 } from "lucide-react";
import { createDiscordEventAction } from "@/app/actions/discordActions";
import dayjs from "dayjs";

export const SendStreamDiscordButton = ({
  stream,
  guild,
  apiBaseUrl,
  twitchName,
}: {
  stream: Stream;
  guild: string;
  apiBaseUrl: string;
  twitchName: string;
}) => {
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  // If the stream already has an event ID, it's already been sent
  if (stream.event_id) {
    return <Check className="text-green-500" />;
  }

  async function sendToDiscord() {
    setIsLoading(true);
    try {
      const endDate = dayjs(new Date(stream.stream_date)).add(
        stream.duration!,
        "minutes"
      );

      const response = await createDiscordEventAction(
        stream.stream_id.toString(),
        guild,
        stream.stream_name,
        new Date(stream.stream_date).toISOString(),
        endDate.toISOString(),
        `https://twitch.tv/${twitchName}`
      );

      console.log(response);

      if (response.success) {
        setIsSuccess(true);
      }
    } catch (error) {
      console.error("Error sending to Discord:", error);
    } finally {
      setIsLoading(false);
    }
  }

  if (isSuccess) {
    return <Check className="text-green-500" />;
  }

  return (
    <Button
      onClick={sendToDiscord}
      disabled={isLoading}
      size="sm"
      variant="outline"
    >
      {isLoading ? (
        <>
          <Loader2 className="h-4 w-4 mr-1 animate-spin" />
          Sending...
        </>
      ) : (
        "Send to Discord"
      )}
    </Button>
  );
};

export default SendStreamDiscordButton;
