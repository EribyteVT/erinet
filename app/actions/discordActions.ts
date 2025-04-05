"use server";

import { auth } from "@/auth";
import { getDiscordToken } from "@/app/lib/discordTokenService";
import { GuildData } from "@/components/Streams/types";

export async function fetchUserGuilds(): Promise<GuildData[]> {
  const session = await auth();

  if (!session?.user?.id) {
    throw new Error("User not authenticated");
  }

  const token = await getDiscordToken(session.user.id);
  if (!token) {
    throw new Error("Discord token not found or expired");
  }

  const response = await fetch("https://discord.com/api/v10/users/@me/guilds", {
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
  });

  if (!response.ok) {
    throw new Error(`Discord API error: ${response.status}`);
  }

  return await response.json();
}

export async function fetchSpecificUserGuild(
  guildId: string
): Promise<GuildData[]> {
  const session = await auth();

  if (!session?.user?.id) {
    throw new Error("User not authenticated");
  }

  const token = await getDiscordToken(session.user.id);
  if (!token) {
    throw new Error("Discord token not found or expired");
  }

  const response = await fetch("https://discord.com/api/v10/users/@me/guilds", {
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
  });

  let guilds = await response.json();

  //   console.log(guilds);

  guilds.forEach((element: GuildData) => {
    if (guildId == element.id) {
      console.log("FOUND");
      return element;
    }
  });

  if (!response.ok) {
    throw new Error(`Discord API error: ${response.status}`);
  }

  console.log("JERE");

  //   return await response.json();
}

export async function checkGuildPermission(guildId: string) {
  // Get the authenticated user's session
  const session = await auth();
  if (!session?.user?.id) {
    return { hasPermission: false };
  }

  // Get the token from the database
  const token = await getDiscordToken(session.user.id);
  if (!token) {
    return { hasPermission: false };
  }

  try {
    const guilds = await fetch("https://discord.com/api/v10/users/@me/guilds", {
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
    }).then((res) => res.json());

    for (const guild of guilds) {
      if (guildId === guild.id) {
        // Check for ADMINISTRATOR permission (0x08)
        const permissions = BigInt(guild.permissions);
        return {
          hasPermission: (permissions & BigInt(0x08)) !== BigInt(0),
        };
      }
    }

    return { hasPermission: false };
  } catch (error) {
    console.error("Error checking guild permissions:", error);
    return { hasPermission: false, error: "Failed to check permissions" };
  }
}
