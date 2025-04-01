// app/lib/auth.js
import { headers } from "next/headers";

export async function getUserGuilds(authToken: string) {
  try {
    const response = await fetch(
      "https://discord.com/api/v10/users/@me/guilds",
      {
        headers: {
          Authorization: authToken,
          "Content-Type": "application/json",
        },
      }
    );

    if (!response.ok) {
      throw new Error(`Discord API error: ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    console.error("Error fetching user guilds:", error);
    throw error;
  }
}

// piggy back on discord permissions
// I would rather die than implement good secure oauth
export async function isAllowedGuild(authToken: string, guildId: string) {
  const guilds = await getUserGuilds(`Bearer ${authToken}`);

  for (const guild of guilds) {
    if (guildId === guild.id) {
      // Check for ADMINISTRATOR permission (0x08)
      const permissions = BigInt(guild.permissions);
      return (permissions & BigInt(0x08)) !== BigInt(0);
    }
  }

  return false;
}
