"use client";
import React, { useState } from "react";
import { Button } from "../../../ui/button";
import { Stream } from "../../types";
import ErinetCrudWrapper from "@/components/Adapter/erinetCrudWrapper";
import { Check, Loader2 } from "lucide-react";

export const SendStreamDiscordButton = ({
  stream,
  authToken,
  guild,
  apiBaseUrl,
}: {
  stream: Stream;
  authToken: string;
  guild: string;
  apiBaseUrl: string;
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
      const wrapper = ErinetCrudWrapper(apiBaseUrl);
      const response = await wrapper.addEventToGuild(stream, authToken, guild);

      if (response.response === "OKAY") {
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
