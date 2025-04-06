"use client";
import React, { useState } from "react";
import { Checkbox } from "@/components/ui/checkbox";
import { Streamer } from "../types";
import { Button } from "@/components/ui/button";
import ErinetCrudWrapper from "@/components/Adapter/erinetCrudWrapper";
import { Session } from "next-auth";
import { CheckedState } from "@radix-ui/react-checkbox";
import { StatusBadge } from "@/components/ui/status-badge";
import { setAutosAction } from "@/app/actions/streameractions";

export const GuildOptions = ({
  streamer,
  setStreamer,
  hasTwitchAuth,
  setIsLoading,
  setLoadingMessage,
  apiBaseUrl,
}: {
  streamer: Streamer;
  setStreamer: (streamer: Streamer) => void;
  hasTwitchAuth: boolean;
  setIsLoading: (isLoading: boolean) => void;
  setLoadingMessage: (message: string) => void;
  apiBaseUrl: string;
}) => {
  const [isDiscordAuto, setIsDiscordAuto] = useState<CheckedState>(
    streamer.auto_discord_event === "Y"
  );
  const [isTwitchAuto, setIsTwitchAuto] = useState<CheckedState>(
    streamer.auto_twitch_schedule === "Y"
  );
  const [saveStatus, setSaveStatus] = useState<{
    type: "success" | "error" | null;
    message: string;
  }>({
    type: null,
    message: "",
  });

  async function save() {
    setIsLoading(true);
    setLoadingMessage("Saving guild options...");
    setSaveStatus({ type: null, message: "" });

    try {
      
      const updatedStreamer = await setAutosAction(
        streamer.streamer_id,
        streamer.guild,
        isDiscordAuto ? "Y" : "N",
        isTwitchAuto ? "Y" : "N"
      );

      setStreamer(updatedStreamer!);


      setSaveStatus({
        type: "success",
        message: "Settings saved successfully!",
      });

      // Clear success message after a delay
      setTimeout(() => {
        setSaveStatus({ type: null, message: "" });
      }, 3000);
    } catch (error) {
      console.error("Error saving options:", error);
      setSaveStatus({
        type: "error",
        message: "Failed to save settings. Please try again.",
      });
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <div className="space-y-6">
      <div className="space-y-4">
        <div className="space-y-3">
          <h3 className="text-lg font-medium">Auto-Publish Settings</h3>
          <p className="text-sm text-muted-foreground">
            Configure automatic event publishing when creating a new stream.
          </p>
        </div>

        <div className="space-y-4 pt-2">
          <div className="flex items-center gap-2">
            <Checkbox
              checked={isDiscordAuto}
              onCheckedChange={(checked) => setIsDiscordAuto(checked)}
              id="discord-auto"
              className="data-[state=checked]:bg-primary data-[state=checked]:text-primary-foreground"
            />
            <label
              htmlFor="discord-auto"
              className="text-sm font-medium leading-none cursor-pointer peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
            >
              Auto Publish Discord Event
            </label>
          </div>

          <div className="flex items-center gap-2">
            <Checkbox
              checked={isTwitchAuto}
              onCheckedChange={(checked) => setIsTwitchAuto(checked)}
              disabled={!hasTwitchAuth}
              id="twitch-auto"
              className="data-[state=checked]:bg-primary data-[state=checked]:text-primary-foreground"
            />
            <label
              htmlFor="twitch-auto"
              className={`text-sm font-medium leading-none cursor-pointer ${
                !hasTwitchAuth ? "opacity-50" : ""
              }`}
            >
              Auto Publish Twitch Event
            </label>
            {!hasTwitchAuth && (
              <span className="text-xs text-amber-500 ml-2">
                (Requires Twitch connection)
              </span>
            )}
          </div>
        </div>
      </div>

      <div className="flex items-center justify-between pt-2">
        <div>
          {saveStatus.type === "success" && (
            <StatusBadge status="success" text={saveStatus.message} />
          )}
          {saveStatus.type === "error" && (
            <StatusBadge status="error" text={saveStatus.message} />
          )}
        </div>

        <Button
          onClick={save}
          className="bg-primary hover:bg-primary/90 text-primary-foreground transition-colors"
        >
          Save Settings
        </Button>
      </div>
    </div>
  );
};

export default GuildOptions;
