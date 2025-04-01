"use client";
import React from "react";
import { GuildData } from "../types";
import { Card, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarImage, AvatarFallback } from "@radix-ui/react-avatar";

export const GuildHeader = ({ guild }: { guild: GuildData }) => (
  <Card className=" border-none p-0">
    <CardHeader className="flex flex-row items-center gap-4 py-6 px-2">
      <Avatar className="w-16 h-16">
        <AvatarImage
          src={`https://cdn.discordapp.com/icons/${guild.id}/${guild.icon}.png?size=512`}
          alt={guild.name}
        />
        <AvatarFallback>CN</AvatarFallback>
      </Avatar>
      <CardTitle className="text-2xl">{guild.name}</CardTitle>
    </CardHeader>
  </Card>
);

export default GuildHeader;
