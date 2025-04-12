import { auth } from "@/auth";
import { redirect } from "next/navigation";
import OnboardingProcess from "@/components/onboarding/OnboardingProcess";
import { notFound } from "next/navigation";
import {
  fetchSpecificUserGuild,
  fetchUserGuilds,
  getBotGuilds,
} from "@/app/actions/discordActions";
import { getStreamerByGuildAction } from "@/app/actions/streameractions";
import { GuildData } from "@/components/Streams/types";

export default async function OnboardingPage({
  params,
}: {
  params: Promise<{ guildId: string }>;
}) {
  const guildId = (await params).guildId;
  const session = await auth();

  if (!session) return redirect("/");

  const botInviteBase = `https://discord.com/api/oauth2/authorize?client_id=${process.env.AUTH_DISCORD_ID}&permissions=17600775979008&integration_type=0&scope=bot+applications.commands&guild_id=`;

  // Get the guild data
  const guildResponse = await fetchSpecificUserGuild(guildId);
  const guild = guildResponse.data;

  //state = 0: no bot or streamer
  // state = 1: bot not in guild, streamer  set
  // state = 2: bot in guild, streamer not set
  // state = 3: bot in guild, streamer set
  let state = 0;

  // If guild not found, show 404
  if (!guild) return notFound();

  // Check if the user has admin permissions in the guild
  const guildsResponse = await fetchUserGuilds();
  const guilds = guildsResponse.data;

  const userHasPermission = guilds.some(
    (g: GuildData) => g.id === guildId && (parseInt(g.permissions) & 0x8) !== 0
  );

  if (!userHasPermission) return redirect("/guilds");

  // add 1 to mean streamer does exist
  const streamerResponse = await getStreamerByGuildAction(guildId);
  if (streamerResponse?.data) state += 1;

  // Get the bot guilds to check if the bot is already in this guild
  const botGuildsResponse = await getBotGuilds();
  const botInGuild = botGuildsResponse.data.some(
    (g: GuildData) => g.id === guildId
  );

  //add 2 to mean bot not in guild
  if (botInGuild) state += 2;

  //bot in guild, streamer in db, no onboarding needed
  if (state === 3) redirect(`/${guildId}/manage`);

  return (
    <OnboardingProcess
      guild={guild}
      botInviteBase={botInviteBase}
      state={state}
    />
  );
}
