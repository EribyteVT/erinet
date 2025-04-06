// app/lib/auth.ts
import { getDiscordToken } from "@/app/lib/discordTokenService";
import { auth } from "@/auth";
import { getUserGuilds } from "./discord-api";

export async function isAllowedGuild(
  authToken: string | null,
  guildId: string
): Promise<boolean> {
  // // If authToken is directly provided in the function call (for backward compatibility)
  // if (authToken) {
  //   try {
  //     const guilds = await getUserGuilds(`Bearer ${authToken}`);

  //     for (const guild of guilds) {
  //       if (guildId === guild.id) {
  //         // Check for ADMINISTRATOR permission (0x08)
  //         const permissions = BigInt(guild.permissions);
  //         return (permissions & BigInt(0x08)) !== BigInt(0);
  //       }
  //     }
  //   } catch (error) {
  //     console.error(
  //       "Error checking guild permissions with provided token:",
  //       error
  //     );
  //   }

  //   return false;
  // }

  // If no authToken provided, check session and use stored token
  try {
    // Get the authenticated user
    const session = await auth();
    if (!session?.user?.id) {
      return false;
    }

    // Get the token from the database
    const token = await getDiscordToken(session.user.id);
    if (!token) {
      return false;
    }

    // Check guild permissions using the token
    const guilds = await getUserGuilds();

    for (const guild of guilds) {
      if (guildId === guild.id) {
        const permissions = BigInt(guild.permissions);
        return (permissions & BigInt(0x08)) !== BigInt(0);
      }
    }

    return false;
  } catch (error) {
    console.error("Error checking guild permissions:", error);
    return false;
  }
}
