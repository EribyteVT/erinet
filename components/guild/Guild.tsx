"use client";

import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { PlaceholderValue } from "next/dist/shared/lib/get-img-props";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import Link from "next/link";
import { Bot, ArrowRight } from "lucide-react";

export default function Guild(props: any) {
  const placeholder_img: PlaceholderValue = "data:image/";
  const botGuilds = props.botGuilds;
  const guild = props.guild;

  // Check if the bot is in this guild
  const botInGuild = botGuilds.includes(guild.id);

  // Determine link destination - onboarding if bot not in guild, manage if it is
  const linkDestination = botInGuild
    ? `/${guild.id}/manage`
    : `/${guild.id}/onboarding`;

  // Apply different styles based on whether the bot is in the guild
  const cardClass = `w-full justify-center center transition-all duration-200 hover:shadow-md ${
    botInGuild ? "dark:bg-slate-800/50" : "border-dashed"
  }`;

  return (
    <Link href={linkDestination}>
      <Card className={cardClass}>
        <CardHeader className="items-center">
          <CardTitle className="flex items-center gap-2">
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
          <div className="center">
            <Avatar className="w-32 h-auto center-size">
              <AvatarImage
                className=""
                src={
                  "https://cdn.discordapp.com/icons/" +
                  guild.id +
                  "/" +
                  guild.icon +
                  ".png?size=512"
                }
                alt={guild.name}
              />
              <AvatarFallback>CN</AvatarFallback>
            </Avatar>
          </div>
        </CardContent>
      </Card>
    </Link>
  );
}
