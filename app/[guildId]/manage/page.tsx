import { auth } from "@/auth";
import DiscordApi from "@/components/Adapter/discord_funcs";
import { redirect } from "next/navigation";
import StreamPage from "@/components/Streams/StreamPage";
import ErinetCrudWrapper from "@/components/Adapter/erinetCrudWrapper";

export default async function Page({
  params,
}: {
  params: Promise<{ guildId: string }>;
}) {
  const wrapper = ErinetCrudWrapper();
  const guildId = (await params).guildId;
  const session = await auth();
  const apiBaseUrl = process.env.NEXT_PUBLIC_API_BASE_URL!;

  const api = DiscordApi("https://discord.com/api/v10/");

  if (
    !session ||
    !session.user.discordAccount ||
    !session.user.discordAccount.access_token
  )
    redirect("/");

  const guild = await api.getGuildData(
    session.user.discordAccount.access_token,
    guildId
  );

  let streamer = null;

  try {
    const streamerResponse = await wrapper.getStreamerByGuildId(guildId);
    if (streamerResponse?.data) {
      streamer = streamerResponse.data;
    }
  } catch (error) {
    console.error("Error fetching streamer ID:", error);
  }

  if (!streamer) redirect("/");

  if (guild == null) redirect("/");

  return (
    <StreamPage
      session={session}
      guild={guild}
      streamer_pass={streamer}
      apiBaseUrl={apiBaseUrl}
    ></StreamPage>
  );
}
