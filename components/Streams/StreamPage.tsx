"use client";

import Link from "next/link";
import { Globe, Undo2 } from "lucide-react";
import { useEffect, useState } from "react";

import { StreamTable } from "@/components/Streams/StreamTable/streamTable";
import { TwitchConnect } from "@/components/Streams/TwitchConnect/TwitchConnect";
import { GuildOptions } from "@/components/Streams/GuildOptions/GuildOptions";
import { DiscordScheduleSender } from "@/components/Streams/GuildOptions/DiscordScheduleSender";
import { GuildHeader } from "@/components/Streams/GuildHeader/GuildHeader";
import { GuildData, Streamer, Stream } from "@/components/Streams/types";
import { PageContainer } from "@/components/ui/page-container";
import { SectionHeader } from "@/components/ui/selection-header";
import { Button } from "@/components/ui/button";
import { LoadingIndicator } from "@/components/ui/loading-indicator";
import { WebsiteGenerator } from "@/components/websiteGenerator/WebsiteGeneratorButton";
import { fetchStreamsAction } from "@/app/actions/streamActions";
import { guildHasAuthTokens } from "@/app/actions/twitchActions";

export default function StreamPage({
  guild,
  streamer_pass,
  apiTwitchUrl,
  crudUrl,
  avatarUrl,
}: {
  guild: GuildData;
  streamer_pass: Streamer;
  apiTwitchUrl: string;
  crudUrl: string;
  avatarUrl: string | undefined;
}) {
  // Main state
  const [streamer, setStreamer] = useState<Streamer>(streamer_pass);
  const [streams, setStreams] = useState<Stream[]>([]);

  const [twitchBroadcasterId, setTwitchBroadcasterId] = useState<
    string | null | undefined
  >(streamer.twitch_user_id);
  const [hasTwitchAuth, setHasTwitchAuth] = useState<boolean>(false);

  // Shared loading state
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [loadingMessage, setLoadingMessage] = useState<string>("Loading...");

  // Fetch Twitch auth status once, share with child components
  useEffect(() => {
    const checkTwitchIntegration = async () => {
      try {
        setIsLoading(true);
        setLoadingMessage("Checking Twitch integration...");

        const hasAuth = await guildHasAuthTokens(guild.id);
        setHasTwitchAuth(hasAuth);

        if (streamer.twitch_user_id) {
          setTwitchBroadcasterId(streamer.twitch_user_id);
        }

        const streamData = await fetchStreamsAction(
          streamer.streamer_id.toString(),
          new Date()
        );

        if (streamData.data) {
          setStreams(streamData.data);
        }
      } catch (error) {
        console.error("Error checking Twitch integration:", error);
      } finally {
        setIsLoading(false);
      }
    };

    checkTwitchIntegration();
  }, [guild.id, streamer.twitch_user_id]);

  return (
    <PageContainer maxWidth="full">
      {isLoading && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-background rounded-lg p-6 shadow-xl flex items-center gap-3">
            <LoadingIndicator text={loadingMessage} />
          </div>
        </div>
      )}

      {/* Header with back button and guild info */}
      <div className="mb-6">
        <div className="flex items-center gap-4">
          <Link href="/guilds">
            <Button
              variant="ghost"
              size="icon"
              className="rounded-full"
              aria-label="Back to guild list"
            >
              <Undo2 className="h-5 w-5" />
            </Button>
          </Link>
          <GuildHeader guild={guild} />
        </div>

        <div className="mt-2 border-b border-border" />
      </div>

      <WebsiteGenerator
        streamer={streamer}
        discordAvatar={avatarUrl}
        crudUrl={crudUrl}
      />

      {/* Stream table */}
      <div className="mb-8">
        <StreamTable
          guild={guild.id}
          streamer={streamer}
          hasTwitchAuth={hasTwitchAuth}
          twitchBroadcasterId={twitchBroadcasterId}
          setIsLoading={setIsLoading}
          isLoading={isLoading}
          setLoadingMessage={setLoadingMessage}
          loadingMessage={loadingMessage}
        />
      </div>

      {/* Settings sections */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="space-y-6">
          <SectionHeader
            title="Twitch Connection"
            description="Connect and manage Twitch integration"
          />
          <div className="bg-background border border-border rounded-lg p-4">
            <TwitchConnect
              streamer={streamer}
              hasTwitchAuth={hasTwitchAuth}
              setHasTwitchAuth={setHasTwitchAuth}
              setTwitchBroadcasterId={setTwitchBroadcasterId}
              setIsLoading={setIsLoading}
              setLoadingMessage={setLoadingMessage}
              apiTwitchUrl={apiTwitchUrl}
            />
          </div>
        </div>

        <div className="space-y-6">
          <SectionHeader
            title="Guild Options"
            description="Configure server-specific settings"
          />
          <div className="bg-background border border-border rounded-lg p-4">
            <GuildOptions
              streamer={streamer}
              setStreamer={setStreamer}
              hasTwitchAuth={hasTwitchAuth}
              setIsLoading={setIsLoading}
              setLoadingMessage={setLoadingMessage}
            />
          </div>
        </div>

        {/* New Discord Schedule section */}
        <div className="space-y-6">
          <SectionHeader
            title="Discord Schedule"
            description="Share your schedule to Discord"
          />
          <div className="bg-background border border-border rounded-lg p-4">
            <DiscordScheduleSender
              streamer={streamer}
              setIsLoading={setIsLoading}
              setLoadingMessage={setLoadingMessage}
            />
          </div>
        </div>
      </div>
    </PageContainer>
  );
}
