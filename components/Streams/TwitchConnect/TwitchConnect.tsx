"use client";
import React, { useState } from "react";
import { Streamer } from "../types";
import { TwitchUserSearch } from "./TwitchUserSearch";
import { Session } from "next-auth";
import ConnectedTwitchUser from "./ConnectedTwitch";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { AlertCircle } from "lucide-react";

export const TwitchConnect = ({
  streamer,
  session,
  hasTwitchAuth,
  setHasTwitchAuth,
  setTwitchBroadcasterId,
  setIsLoading,
  setLoadingMessage,
  apiBaseUrl,
}: {
  streamer: Streamer;
  session: Session;
  hasTwitchAuth: boolean;
  setHasTwitchAuth: (hasAuth: boolean) => void;
  setTwitchBroadcasterId: (id: string | undefined) => void;
  setIsLoading: (isLoading: boolean) => void;
  setLoadingMessage: (message: string) => void;
  apiBaseUrl: string;
}) => {
  const [error, setError] = useState<string | null>(null);

  // Handle Twitch connection success
  const handleTwitchConnected = (twitchId: string) => {
    setTwitchBroadcasterId(twitchId);
    setHasTwitchAuth(true);
  };

  return (
    <div className="space-y-6">
      {error && (
        <Alert variant="destructive" className="mb-4">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {hasTwitchAuth ? (
        <div>
          <ConnectedTwitchUser
            streamer={streamer}
            session={session}
            setIsLoading={setIsLoading}
            setLoadingMessage={setLoadingMessage}
            setError={setError}
            apiBaseUrl={apiBaseUrl}
          />
        </div>
      ) : (
        <div>
          <div className="bg-amber-50 dark:bg-amber-900/20 rounded-lg border border-amber-100 dark:border-amber-800 p-4 mb-6">
            <div className="flex gap-2">
              <AlertCircle className="h-5 w-5 text-amber-500 flex-shrink-0 mt-0.5" />
              <div>
                <h4 className="font-medium text-amber-900 dark:text-amber-300">
                  Connect Twitch Account
                </h4>
                <p className="text-sm text-amber-700 dark:text-amber-400 mt-1">
                  This server needs to connect a Twitch account to enable
                  schedule integration. Search for a Twitch username below to
                  connect.
                </p>
              </div>
            </div>
          </div>

          <TwitchUserSearch
            streamer={streamer}
            session={session}
            setIsLoading={setIsLoading}
            setLoadingMessage={setLoadingMessage}
            onTwitchConnected={handleTwitchConnected}
            setError={setError}
            apiBaseUrl={apiBaseUrl}
          />
        </div>
      )}
    </div>
  );
};

export default TwitchConnect;
