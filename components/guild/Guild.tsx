"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

import { PlaceholderValue } from "next/dist/shared/lib/get-img-props";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import Link from "next/link";

export default function Guild(props: any) {
  const placeholder_img: PlaceholderValue = "data:image/";
  const botGuilds = props.botGuilds;
  const guild = props.guild;

  let card_class = "w-full justify-center center ";
  if (botGuilds.includes(guild.id)) {
    card_class += "dark:bg-slate-800/50";
  }

  return (
    <Link href={"/" + guild.id + "/manage"}>
      <Card className={card_class}>
        <CardHeader className="items-center">
          <CardTitle>{guild.name}</CardTitle>
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
