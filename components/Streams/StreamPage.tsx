"use client";

import { Session } from "next-auth";
import { redirect } from "next/navigation";
import Link from "next/link";
import { Globe, Undo2 } from "lucide-react";
import { useEffect, useState } from "react";
import ErinetCrudWrapper from "@/components/Adapter/erinetCrudWrapper";

import { StreamTable } from "@/components/Streams/StreamTable/streamTable";
import { TwitchConnect } from "@/components/Streams/TwitchConnect/TwitchConnect";
import { GuildOptions } from "@/components/Streams/GuildOptions/GuildOptions";
import { GuildHeader } from "@/components/Streams/GuildHeader/GuildHeader";
import { GuildData, Streamer, Stream } from "@/components/Streams/types";
import { PageContainer } from "@/components/ui/page-container";
import { SectionHeader } from "@/components/ui/selection-header";
import { Button } from "@/components/ui/button";
import { LoadingIndicator } from "@/components/ui/loading-indicator";
import WebsiteGenerator from "../WebsiteGenerator/WebsiteGenerator";

export default function StreamPage({
  session,
  guild,
  streamer_pass,
  apiBaseUrl,
}: {
  session: Session;
  guild: GuildData;
  streamer_pass: Streamer;
  apiBaseUrl: string;
}) {
  // Main state
  const [streamer, setStreamer] = useState<Streamer>(streamer_pass);
  const [streams, setStreams] = useState<Stream[]>([]);

  const [twitchBroadcasterId, setTwitchBroadcasterId] = useState<
    string | null | undefined
  >(streamer.twitch_user_id);
  const [hasTwitchAuth, setHasTwitchAuth] = useState<boolean>(false);

  // Website generator modal state

  // Shared loading state
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [loadingMessage, setLoadingMessage] = useState<string>("Loading...");

  const wrapper = ErinetCrudWrapper(apiBaseUrl);

  // Fetch Twitch auth status once, share with child components
  useEffect(() => {
    const checkTwitchIntegration = async () => {
      try {
        setIsLoading(true);
        setLoadingMessage("Checking Twitch integration...");

        const hasAuth = await wrapper.guildHasAuthTokens(guild.id);
        setHasTwitchAuth(hasAuth);

        if (streamer.twitch_user_id) {
          setTwitchBroadcasterId(streamer.twitch_user_id);
        }

        const streamData = await wrapper.getStreams(
          streamer.streamer_id,
          Date.now().toString()
        );

        if (streamData?.data) {
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

  // Redirect if not authenticated or no guild
  if (!session?.user?.discordAccount?.access_token) redirect("/");
  if (!guild) redirect("/");

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
        streams={streams}
        apiBaseUrl={apiBaseUrl}
        discordAvatar={session.user.discordAccount.avatar!}
      />

      {/* Stream table */}
      <div className="mb-8">
        <StreamTable
          session={session}
          guild={guild.id}
          streamer={streamer}
          hasTwitchAuth={hasTwitchAuth}
          twitchBroadcasterId={twitchBroadcasterId}
          setIsLoading={setIsLoading}
          isLoading={isLoading}
          setLoadingMessage={setLoadingMessage}
          loadingMessage={loadingMessage}
          apiBaseUrl={apiBaseUrl}
        />
      </div>

      {/* Settings sections */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-6">
          <SectionHeader
            title="Twitch Connection"
            description="Connect and manage Twitch integration"
          />
          <div className="bg-background border border-border rounded-lg p-4">
            <TwitchConnect
              streamer={streamer}
              session={session}
              hasTwitchAuth={hasTwitchAuth}
              setHasTwitchAuth={setHasTwitchAuth}
              setTwitchBroadcasterId={setTwitchBroadcasterId}
              setIsLoading={setIsLoading}
              setLoadingMessage={setLoadingMessage}
              apiBaseUrl={apiBaseUrl}
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
              session={session}
              setStreamer={setStreamer}
              hasTwitchAuth={hasTwitchAuth}
              setIsLoading={setIsLoading}
              setLoadingMessage={setLoadingMessage}
              apiBaseUrl={apiBaseUrl}
            />
          </div>
        </div>
      </div>
    </PageContainer>
  );
}
