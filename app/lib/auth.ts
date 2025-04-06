import { getDiscordToken } from "@/app/lib/discordTokenService";
import { auth } from "@/auth";
import { fetchUserGuilds } from "../actions/discordActions";

export async function isAllowedGuild(
  authToken: string | null,
  guildId: string
): Promise<boolean> {
  try {
    console.log("Checking guild permissions.");
    // Get the authenticated user
    const session = await auth();
    if (!session?.user?.id) {
      console.log("NO AUTH");
      return false;
    }

    // Get the token from the database
    const token = await getDiscordToken(session.user.id);
    if (!token) {
      console.log("NO TOKEN?");
      return false;
    }

    // Check guild permissions using the token
    const guilds = await fetchUserGuilds();

    console.log(guildId);

    let can = false;

    for (const guild of guilds) {
      if (guildId === guild.id) {
        console.log("found in auth", guildId, guild.id);
        const permissions = BigInt(guild.permissions);
        can = (permissions & BigInt(0x08)) !== BigInt(0);
        console.log(can);
      }
    }

    return can;
  } catch (error) {
    console.error("Error checking guild permissions:", error);
    return false;
  }
}
