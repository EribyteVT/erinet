"use client";
import React, { useState } from "react";
import { Button } from "../../../ui/button";
import { Stream } from "../../types";
import ErinetCrudWrapper from "@/components/Adapter/erinetCrudWrapper";
import { Check, AlertCircle, Loader2 } from "lucide-react";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

export const SendStreamTwitchButton = ({
  stream,
  discordAuthToken,
  broadcasterId,
  guild,
  hasTwitchAuth,
  apiBaseUrl,
}: {
  stream: Stream;
  discordAuthToken: string;
  broadcasterId: string | null | undefined;
  guild: string;
  hasTwitchAuth: boolean;
  apiBaseUrl: string;
}) => {
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  // If the stream already has a Twitch segment ID, it's already been sent
  if (stream.twitch_segment_id) {
    return <Check className="text-green-500" />;
  }

  // If there's no Twitch auth for this guild, show a disabled button with tooltip
  if (!hasTwitchAuth) {
    return (
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant="outline"
              size="sm"
              disabled
              className="cursor-not-allowed"
            >
              <AlertCircle className="h-4 w-4 mr-1 text-amber-500" />
              Connect Twitch
            </Button>
          </TooltipTrigger>
          <TooltipContent>
            <p>The server needs to connect a Twitch account first</p>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    );
  }

  // If there's no broadcaster ID, we can't create an event
  if (!broadcasterId) {
    return (
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant="outline"
              size="sm"
              disabled
              className="cursor-not-allowed"
            >
              <AlertCircle className="h-4 w-4 mr-1 text-amber-500" />
              No Broadcaster
            </Button>
          </TooltipTrigger>
          <TooltipContent>
            <p>No Twitch broadcaster ID found for this streamer</p>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    );
  }

  async function sendToTwitch() {
    setIsLoading(true);
    try {
      const wrapper = ErinetCrudWrapper(apiBaseUrl);

      // We don't need to pass the twitchAuthToken anymore - it will be retrieved server-side
      const response = await wrapper.addEventToTwitch(
        stream,
        discordAuthToken,
        broadcasterId!,
        guild
      );

      if (response.response === "OKAY") {
        setIsSuccess(true);
      }
    } catch (error) {
      console.error("Error sending to Twitch:", error);
    } finally {
      setIsLoading(false);
    }
  }

  if (isSuccess) {
    return <Check className="text-green-500" />;
  }

  return (
    <Button
      onClick={sendToTwitch}
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
        "Send to Twitch"
      )}
    </Button>
  );
};

export default SendStreamTwitchButton;
