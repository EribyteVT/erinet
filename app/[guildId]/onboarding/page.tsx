import { auth } from "@/auth";
import { redirect } from "next/navigation";
import OnboardingProcess from "@/components/onboarding/OnboardingProcess";
import ErinetCrudWrapper from "@/components/Adapter/erinetCrudWrapper";
import { notFound } from "next/navigation";
import {
  fetchSpecificUserGuild,
  fetchUserGuilds,
} from "@/app/actions/discordActions";

export default async function OnboardingPage({
  params,
}: {
  params: Promise<{ guildId: string }>;
}) {
  const wrapper = ErinetCrudWrapper();
  const guildId = (await params).guildId;
  const session = await auth();
  const apiBaseUrl = process.env.NEXT_PUBLIC_API_BASE_URL!;

  // const api = DiscordApi("https://discord.com/api/v10/");

  const botInviteBase = `https://discord.com/api/oauth2/authorize?client_id=${process.env.AUTH_DISCORD_ID}&permissions=17600775979008&integration_type=0&scope=bot+applications.commands&guild_id=`;

  // Check authentication first
  if (!session) {
    // Use return here to avoid multiple redirects
    redirect("/");
  }

  // Get the guild data
  const guild = await fetchSpecificUserGuild(guildId);

  // If guild not found, show 404 instead of redirect
  if (!guild) {
    return notFound();
  }

  // Check if the user has admin permissions in the guild
  const guilds = await fetchUserGuilds();

  const userHasPermission = guilds.some(
    (g) => g.id === guildId && (parseInt(g.permissions) & 0x8) !== 0
  );

  if (!userHasPermission) {
    // Return the redirect instead of just calling it
    redirect("/guilds");
  }

  // Check if a streamer already exists for this guild
  try {
    const streamerResponse = await wrapper.getStreamerByGuildId(guildId);
    if (streamerResponse?.data) {
      // If a streamer already exists, redirect to the manage page
      redirect(`/${guildId}/manage`);
    }
  } catch (error) {
    // An error likely means no streamer exists, which is expected
    console.error("Error fetching streamer:", error);
  }

  // Get the bot guilds to check if the bot is already in this guild
  const botGuilds = await wrapper.getBotGuilds();
  const botInGuild = botGuilds.some((g) => g.id === guildId);

  // If the bot is already in this guild but no streamer exists,
  // we'll still show the onboarding to create the streamer

  return (
    <OnboardingProcess
      guild={guild}
      apiBaseUrl={apiBaseUrl}
      botInviteBase={botInviteBase}
    />
  );
}
