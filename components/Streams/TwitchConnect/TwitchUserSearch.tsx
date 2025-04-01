"use client";
import React, { useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import ErinetCrudWrapper from "@/components/Adapter/erinetCrudWrapper";
import { Card, CardContent } from "@/components/ui/card";
import { Streamer, TwitchUser } from "../types";
import { Session } from "next-auth";

export const TwitchUserSearch = ({
  streamer,
  session,
  setIsLoading,
  setLoadingMessage,
  onTwitchConnected,
  setError,
  apiBaseUrl,
}: {
  streamer: Streamer;
  session: Session;
  setIsLoading: (isLoading: boolean) => void;
  setLoadingMessage: (message: string) => void;
  onTwitchConnected: (twitchId: string) => void;
  setError: (error: string | null) => void;
  apiBaseUrl: string;
}) => {
  const wrapper = ErinetCrudWrapper(apiBaseUrl);
  const [twitchName, setTwitchName] = useState("");
  const [twitchUser, setTwitchUser] = useState<TwitchUser | null>(null);
  const [searching, setSearching] = useState(false);
  const [authenticating, setAuthenticating] = useState(false);

  async function initiateAuth() {
    try {
      setIsLoading(true);
      setLoadingMessage("Authenticating with Twitch...");
      setAuthenticating(true);

      await wrapper.setStreamerTwitch(
        streamer.streamer_id,
        twitchUser?.id!,
        streamer.guild,
        session.user.discordAccount?.access_token!
      );

      const state =
        Math.random().toString(36).substring(2, 15) +
        Math.random().toString(36).substring(2, 15);

      localStorage.setItem("twitch_auth_state", state);

      if (twitchUser) {
        localStorage.setItem("twitch_user_info", JSON.stringify(twitchUser));
        onTwitchConnected(twitchUser.id);
      }

      const guildId = streamer.guild;

      // Get the OAuth URL from our backend
      const response = await fetch("/api/twitch/auth-url", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ state, guildId }),
      });

      const data = await response.json();

      if (data.url) {
        // Redirect to Twitch for authentication
        window.location.href = data.url;
      } else {
        throw new Error("Failed to get authorization URL");
      }
    } catch (error) {
      console.error("Error initiating Twitch auth:", error);
      setError("Failed to authenticate with Twitch. Please try again.");
      setAuthenticating(false);
      setIsLoading(false);
    }
  }

  async function findTwitchUser() {
    try {
      setSearching(true);
      setIsLoading(true);
      setLoadingMessage("Searching for Twitch user...");
      setError(null);

      const response = await wrapper.findTwitchUser(twitchName);

      console.log(response);

      if (response.data.data && response.data.data.length > 0) {
        setTwitchUser(response.data.data[0]);
      } else {
        setTwitchUser(null);
        setError(`No Twitch user found with name "${twitchName}"`);
      }
    } catch (error) {
      console.error("Error finding Twitch user:", error);
      setError("Error searching for Twitch user. Please try again.");
      setTwitchUser(null);
    } finally {
      setSearching(false);
      setIsLoading(false);
    }
  }

  return (
    <>
      <div className="space-y-4">
        <div className="flex space-x-2">
          <Input
            placeholder="Input twitch username"
            value={twitchName}
            onChange={(e) => setTwitchName(e.target.value)}
          />
          <Button
            onClick={findTwitchUser}
            disabled={searching || !twitchName.trim()}
          >
            {searching ? "Searching..." : "Search!"}
          </Button>
        </div>

        {twitchUser && (
          <Card className="mt-4">
            <CardContent className="pt-6 flex flex-col space-y-4">
              <div className="flex items-center space-x-4">
                <img
                  src={twitchUser.profile_image_url}
                  alt={`${twitchUser.display_name}'s profile`}
                  className="w-16 h-16 rounded-full"
                />
                <div>
                  <h3 className="text-lg font-bold">
                    {twitchUser.display_name}
                  </h3>
                  <p className="text-sm text-gray-500">
                    {twitchUser.description || "No description available"}
                  </p>
                </div>
              </div>

              <Button
                onClick={initiateAuth}
                disabled={authenticating}
                className="w-full bg-purple-600 hover:bg-purple-700"
              >
                {authenticating
                  ? "Authenticating..."
                  : "Authenticate as this User"}
              </Button>
            </CardContent>
          </Card>
        )}
      </div>
    </>
  );
};

export default TwitchUserSearch;
