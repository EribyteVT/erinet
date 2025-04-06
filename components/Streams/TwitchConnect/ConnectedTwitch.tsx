"use client";
import React, { useState, useEffect } from "react";
import { Streamer, TwitchUser } from "../types";
import ErinetCrudWrapper from "@/components/Adapter/erinetCrudWrapper";
import { Card, CardContent } from "@/components/ui/card";

interface ConnectedTwitchUserProps {
  streamer: Streamer;
  setIsLoading: (isLoading: boolean) => void;
  setLoadingMessage: (message: string) => void;
  setError: (error: string | null) => void;
  apiBaseUrl: string;
}

export const ConnectedTwitchUser: React.FC<ConnectedTwitchUserProps> = ({
  streamer,
  setIsLoading,
  setLoadingMessage,
  setError,
  apiBaseUrl,
}) => {
  const [twitchUser, setTwitchUser] = useState<TwitchUser | null>(null);
  const wrapper = ErinetCrudWrapper(apiBaseUrl);

  useEffect(() => {
    async function fetchTwitchUserById() {
      if (!streamer.twitch_user_id) return;

      try {
        setIsLoading(true);
        setLoadingMessage("Loading Twitch account information...");
        setError(null);

        const result = await wrapper.findTwitchId(streamer.twitch_user_id);

        if (result.status === "OKAY" && result.data?.data?.length > 0) {
          setTwitchUser(result.data.data[0]);
        } else {
          setError("Could not retrieve Twitch user information");
        }
      } catch (error) {
        console.error("Error fetching Twitch user:", error);
        setError("Failed to load Twitch user information");
      } finally {
        setIsLoading(false);
      }
    }

    fetchTwitchUserById();
  }, [streamer.twitch_user_id]);

  if (!twitchUser) {
    return (
      <div className="p-4">
        <p className="text-gray-500 dark:text-gray-400">
          Connected to Twitch account (ID: {streamer.twitch_user_id}), but
          unable to fetch details.
        </p>
      </div>
    );
  }

  return (
    <Card className="mt-4 border border-purple-200 dark:border-purple-800">
      <CardContent className="pt-6 flex flex-col space-y-4">
        <div className="flex items-center space-x-4">
          {twitchUser.profile_image_url && (
            <img
              src={twitchUser.profile_image_url}
              alt={`${twitchUser.display_name}'s profile`}
              className="w-16 h-16 rounded-full"
            />
          )}
          <div>
            <h3 className="text-lg font-bold">{twitchUser.display_name}</h3>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              {twitchUser.description ? (
                twitchUser.description
              ) : (
                <span className="italic">No channel description</span>
              )}
            </p>
            {twitchUser.broadcaster_type && (
              <span className="inline-block mt-1 text-xs px-2 py-1 bg-purple-100 dark:bg-purple-900 text-purple-800 dark:text-purple-200 rounded-full">
                {twitchUser.broadcaster_type.charAt(0).toUpperCase() +
                  twitchUser.broadcaster_type.slice(1)}{" "}
                Broadcaster
              </span>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default ConnectedTwitchUser;
