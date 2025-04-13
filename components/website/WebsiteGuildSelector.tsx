"use client";
import { fetchUserGuilds, getBotGuilds } from "@/app/actions/discordActions";
import { GuildData } from "../Streams/types";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import Link from "next/link";
import { Globe, ArrowRight } from "lucide-react";
import { useEffect, useState } from "react";
import { LoadingIndicator } from "../ui/loading-indicator";

export default function WebsiteGuildSelector() {
  const [guilds, setGuilds] = useState<GuildData[]>([]);
  const [botGuildIds, setBotGuildIds] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function loadGuilds() {
      try {
        setIsLoading(true);

        // Get user guilds
        const userGuildsResponse = await fetchUserGuilds();
        if (!userGuildsResponse.success) {
          throw new Error("Failed to fetch guilds");
        }

        // Get bot guilds
        const botGuildsResponse = await getBotGuilds();
        if (!botGuildsResponse.success) {
          throw new Error("Failed to fetch bot guilds");
        }

        // Filter guilds where user has admin permissions
        const filteredGuilds = userGuildsResponse.data.filter(
          (guild: GuildData) => {
            return (parseInt(guild.permissions) & 0x0000000000000008) !== 0;
          }
        );

        // Get IDs of guilds the bot is in
        const botIds = botGuildsResponse.data.map(
          (guild: GuildData) => guild.id
        );

        // Sort guilds - bot guilds first
        filteredGuilds.sort((a: GuildData, b: GuildData) => {
          const aHasBot = botIds.includes(a.id) ? -1 : 0;
          const bHasBot = botIds.includes(b.id) ? -1 : 0;
          return aHasBot - bHasBot;
        });

        setGuilds(filteredGuilds);
        setBotGuildIds(botIds);
      } catch (err) {
        console.error("Error loading guilds:", err);
        setError("Failed to load servers. Please try again later.");
      } finally {
        setIsLoading(false);
      }
    }

    loadGuilds();
  }, []);

  // Get guild initials for the fallback avatar
  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((word) => word[0])
      .join("")
      .slice(0, 2)
      .toUpperCase();
  };

  // Get color from guild ID for consistent avatar colors
  const getColorFromId = (id: string) => {
    const colors = [
      "bg-red-500",
      "bg-orange-500",
      "bg-amber-500",
      "bg-yellow-500",
      "bg-lime-500",
      "bg-violet-500",
      "bg-emerald-500",
      "bg-teal-500",
      "bg-cyan-500",
      "bg-sky-500",
      "bg-blue-500",
      "bg-indigo-500",
      "bg-green-500",
      "bg-purple-500",
      "bg-fuchsia-500",
      "bg-pink-500",
      "bg-rose-500",
    ];

    const num = parseInt(id.slice(-4), 16) || 0;
    return colors[num % colors.length];
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-[200px]">
        <LoadingIndicator text="Loading servers..." />
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center p-8 border rounded-lg bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400">
        {error}
      </div>
    );
  }

  if (guilds.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>No Servers Found</CardTitle>
          <CardDescription>
            You don't have any Discord servers where you have administrator
            permissions.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <p>
            You need a Discord server with admin permissions to use the website
            generator.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
      {guilds.map((guild) => {
        const botInGuild = botGuildIds.includes(guild.id);
        const hasIcon = guild.icon && guild.icon !== null;
        const initials = getInitials(guild.name);
        const fallbackColor = getColorFromId(guild.id);

        // For website generator, we link directly to the manage page
        const linkDestination = `/${guild.id}/website`;

        // Only show guilds where the bot is in the server (required for website generation)
        if (!botInGuild) {
          return (
            <Card
              key={guild.id}
              className="border border-dashed border-slate-300 dark:border-slate-700 opacity-70"
            >
              <CardHeader className="items-center pt-8">
                <Avatar className="w-20 h-20 border-4 border-white dark:border-slate-800 shadow-md mb-4">
                  {hasIcon ? (
                    <AvatarImage
                      src={`https://cdn.discordapp.com/icons/${guild.id}/${guild.icon}.png?size=512`}
                      alt={guild.name}
                    />
                  ) : null}
                  <AvatarFallback
                    className={`text-white text-xl ${fallbackColor}`}
                  >
                    {initials}
                  </AvatarFallback>
                </Avatar>
                <CardTitle className="text-center">{guild.name}</CardTitle>
                <CardDescription className="text-center text-amber-600 dark:text-amber-400 flex items-center justify-center mt-1">
                  Bot not in server
                </CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-center text-sm text-muted-foreground">
                  You need to set up Eribot in this server first
                </p>
                <div className="flex justify-center mt-4">
                  <Link
                    href={`/${guild.id}/onboarding`}
                    className="text-blue-600 dark:text-blue-400 flex items-center text-sm"
                  >
                    Set up Eribot <ArrowRight className="ml-1 h-3 w-3" />
                  </Link>
                </div>
              </CardContent>
            </Card>
          );
        }

        return (
          <Link href={linkDestination} key={guild.id}>
            <Card className="w-full transition-all duration-200 hover:shadow-md overflow-hidden border-green-200 dark:border-green-800 dark:bg-green-800/10">
              <CardHeader className="items-center pt-8">
                <Avatar className="w-20 h-20 border-4 border-white dark:border-slate-800 shadow-md mb-4">
                  {hasIcon ? (
                    <AvatarImage
                      src={`https://cdn.discordapp.com/icons/${guild.id}/${guild.icon}.png?size=512`}
                      alt={guild.name}
                    />
                  ) : null}
                  <AvatarFallback
                    className={`text-white text-xl ${fallbackColor}`}
                  >
                    {initials}
                  </AvatarFallback>
                </Avatar>
                <CardTitle className="text-center">{guild.name}</CardTitle>
                <CardDescription className="text-center text-green-600 dark:text-green-400 flex items-center justify-center mt-1">
                  <Globe className="mr-1 h-4 w-4" />
                  Create Website
                </CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-center text-sm text-muted-foreground">
                  Generate a custom website for this server
                </p>
              </CardContent>
            </Card>
          </Link>
        );
      })}
    </div>
  );
}
