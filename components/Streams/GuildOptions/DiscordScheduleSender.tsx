"use client";

import React, { useState, useEffect } from "react";
import { Streamer } from "../types";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { StatusBadge } from "@/components/ui/status-badge";
import { Send, Loader2 } from "lucide-react";
import {
  fetchGuildChannels,
  sendScheduleMessage,
} from "@/app/actions/discordActions";

interface DiscordScheduleSenderProps {
  streamer: Streamer;
  setIsLoading: (isLoading: boolean) => void;
  setLoadingMessage: (message: string) => void;
}

export const DiscordScheduleSender: React.FC<DiscordScheduleSenderProps> = ({
  streamer,
  setIsLoading,
  setLoadingMessage,
}) => {
  const [channels, setChannels] = useState<any[]>([]);
  const [selectedChannel, setSelectedChannel] = useState<string>("");
  const [isLoadingChannels, setIsLoadingChannels] = useState<boolean>(false);
  const [sendStatus, setSendStatus] = useState<{
    type: "success" | "error" | null;
    message: string;
  }>({
    type: null,
    message: "",
  });
  const [isSending, setIsSending] = useState<boolean>(false);

  useEffect(() => {
    const loadChannels = async () => {
      if (!streamer.guild) return;

      setIsLoadingChannels(true);

      try {
        const response = await fetchGuildChannels(streamer.guild);

        if (response.success && response.data) {
          setChannels(response.data);
        }
      } catch (error) {
        console.error("Error loading channels:", error);
      } finally {
        setIsLoadingChannels(false);
      }
    };

    loadChannels();
  }, [streamer.guild]);

  const handleSendScheduleMessage = async () => {
    if (!selectedChannel) {
      setSendStatus({
        type: "error",
        message: "Please select a channel first",
      });
      return;
    }

    setSendStatus({ type: null, message: "" });
    setIsSending(true);
    setIsLoading(true);
    setLoadingMessage("Sending schedule to Discord...");

    try {
      const response = await sendScheduleMessage(
        streamer.guild,
        selectedChannel,
        streamer.streamer_id
      );

      if (response.success) {
        setSendStatus({
          type: "success",
          message: "Schedule sent successfully!",
        });
      } else {
        setSendStatus({
          type: "error",
          message: response.message || "Failed to send schedule",
        });
      }
    } catch (error) {
      console.error("Error sending schedule:", error);
      setSendStatus({
        type: "error",
        message: "An error occurred while sending the schedule",
      });
    } finally {
      setIsSending(false);
      setIsLoading(false);

      // Clear success message after 5 seconds
      if (sendStatus.type === "success") {
        setTimeout(() => {
          setSendStatus({ type: null, message: "" });
        }, 5000);
      }
    }
  };

  return (
    <div className="space-y-4">
      <div className="space-y-3">
        <h3 className="text-lg font-medium">Discord Schedule</h3>
        <p className="text-sm text-muted-foreground">
          Send your stream schedule to a Discord channel
        </p>
      </div>

      <Separator />

      <div className="space-y-4 pt-2">
        <div className="space-y-2">
          <Select
            value={selectedChannel}
            onValueChange={setSelectedChannel}
            disabled={isLoadingChannels}
          >
            <SelectTrigger className="w-full">
              <SelectValue
                placeholder={
                  isLoadingChannels ? "Loading channels..." : "Select a channel"
                }
              />
            </SelectTrigger>
            <SelectContent>
              {channels.map((channel) => (
                <SelectItem key={channel.id} value={channel.id}>
                  # {channel.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="flex items-center justify-between">
          <div>
            {sendStatus.type === "success" && (
              <StatusBadge status="success" text={sendStatus.message} />
            )}
            {sendStatus.type === "error" && (
              <StatusBadge status="error" text={sendStatus.message} />
            )}
          </div>

          <Button
            onClick={handleSendScheduleMessage}
            disabled={!selectedChannel || isSending || isLoadingChannels}
          >
            {isSending ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Sending...
              </>
            ) : (
              <>
                <Send className="mr-2 h-4 w-4" />
                Send Schedule Message
              </>
            )}
          </Button>
        </div>
      </div>
    </div>
  );
};

export default DiscordScheduleSender;
