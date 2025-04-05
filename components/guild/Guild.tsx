"use client";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import Link from "next/link";
import { Bot, ArrowRight } from "lucide-react";

export default function Guild(props: any) {
  const botGuilds = props.botGuilds;
  const guild = props.guild;

  // Check if the bot is in this guild
  const botInGuild = botGuilds.includes(guild.id);

  // Determine link destination - onboarding if bot not in guild, manage if it is
  const linkDestination = botInGuild
    ? `/${guild.id}/manage`
    : `/${guild.id}/onboarding`;

  // if in guild green, else slate
  const cardClass = `w-full justify-center center transition-all duration-200 hover:shadow-md overflow-hidden ${
    botInGuild ? "dark:bg-green-800/50" : " dark:bg-slate-800/50 border-dashed"
  }`;

  // Get guild initials for the fallback avatar
  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((word) => word[0])
      .join("")
      .slice(0, 2)
      .toUpperCase();
  };

  // Check if guild has an icon or banner
  const hasIcon = guild.icon && guild.icon !== null;
  const hasBanner = guild.banner && guild.banner !== null;

  // Get guild avatar color based on guild id (for consistent colors)
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

    // Use the last characters of the id as a simple hash
    const num = parseInt(id.slice(-4), 16) || 0;
    return colors[num % colors.length];
  };

  // Generate gradient colors based on guild id
  const getGradientColors = (id: string) => {
    const baseColor = getColorFromId(id);
    // Map the base color to a darker and lighter variant for gradient
    const colorMap: Record<string, [string, string]> = {
      "bg-red-500": ["from-red-400", "to-red-600"],
      "bg-orange-500": ["from-orange-400", "to-orange-600"],
      "bg-amber-500": ["from-amber-400", "to-amber-600"],
      "bg-yellow-500": ["from-yellow-400", "to-yellow-600"],
      "bg-lime-500": ["from-lime-400", "to-lime-600"],
      "bg-purple-500": ["from-purple-400", "to-purple-600"],
      "bg-emerald-500": ["from-emerald-400", "to-emerald-600"],
      "bg-teal-500": ["from-teal-400", "to-teal-600"],
      "bg-cyan-500": ["from-cyan-400", "to-cyan-600"],
      "bg-sky-500": ["from-sky-400", "to-sky-600"],
      "bg-blue-500": ["from-blue-400", "to-blue-600"],
      "bg-indigo-500": ["from-indigo-400", "to-indigo-600"],
      "bg-green-500": ["from-green-400", "to-green-600"],
      "bg-violet-500": ["from-violet-400", "to-violet-600"],
      "bg-fuchsia-500": ["from-fuchsia-400", "to-fuchsia-600"],
      "bg-pink-500": ["from-pink-400", "to-pink-600"],
      "bg-rose-500": ["from-rose-400", "to-rose-600"],
    };

    return colorMap[baseColor] || ["from-blue-400", "to-blue-600"];
  };

  const fallbackColor = getColorFromId(guild.id);
  const initials = getInitials(guild.name);
  const [gradientFrom, gradientTo] = getGradientColors(guild.id);

  // Create banner style based on whether banner exists
  const bannerStyle = hasBanner
    ? {
        backgroundImage: `url(https://cdn.discordapp.com/banners/${guild.id}/${guild.banner}.png?size=1024)`,
        backgroundSize: "cover",
        backgroundPosition: "center",
        height: "80px",
      }
    : {
        background: `linear-gradient(to right, var(--tw-gradient-stops))`,
        height: "80px",
      };

  return (
    <Link href={linkDestination}>
      <Card className={cardClass}>
        {/* Banner section */}
        <div
          className={`w-full ${
            !hasBanner ? `bg-gradient-to-r ${gradientFrom} ${gradientTo}` : ""
          }`}
          style={bannerStyle}
        />

        <CardHeader className="items-center pt-8 mt-[-40px]">
          {" "}
          {/* Negative margin to overlap the avatar with banner */}
          <div className="mb-4">
            {" "}
            {/* Avatar container */}
            <Avatar className="w-20 h-20 border-4 border-white dark:border-slate-800 shadow-md">
              {hasIcon ? (
                <AvatarImage
                  src={`https://cdn.discordapp.com/icons/${guild.id}/${guild.icon}.png?size=512`}
                  alt={guild.name}
                />
              ) : null}
              <AvatarFallback className={`text-white text-xl ${fallbackColor}`}>
                {initials}
              </AvatarFallback>
            </Avatar>
          </div>
          <CardTitle className="flex items-center gap-2 mt-2">
            {guild.name}
            {!botInGuild && (
              <Badge
                variant="outline"
                className="ml-2 bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-300 border-blue-200 dark:border-blue-800"
              >
                <Bot className="mr-1 h-3 w-3" />
                Setup Needed
              </Badge>
            )}
          </CardTitle>
          {!botInGuild && (
            <CardDescription className="text-center text-blue-600 dark:text-blue-400 flex items-center justify-center mt-1">
              Click to setup <ArrowRight className="ml-1 h-3 w-3" />
            </CardDescription>
          )}
        </CardHeader>

        <CardContent>
          <div className="text-center text-sm text-muted-foreground">
            {botInGuild ? "Manage server" : "Configure bot for this server"}
          </div>
        </CardContent>
      </Card>
    </Link>
  );
}
