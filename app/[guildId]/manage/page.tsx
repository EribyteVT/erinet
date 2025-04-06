import { auth } from "@/auth";
// import DiscordApi from "@/components/Adapter/discord_funcs";
import { redirect } from "next/navigation";
import StreamPage from "@/components/Streams/StreamPage";
import ErinetCrudWrapper from "@/components/Adapter/erinetCrudWrapper";
import { fetchSpecificUserGuild } from "@/app/actions/discordActions";

export default async function Page({
  params,
}: {
  params: Promise<{ guildId: string }>;
}) {
  const wrapper = ErinetCrudWrapper();
  const guildId = (await params).guildId;
  const session = await auth();
  const apiBaseUrl = process.env.NEXT_PUBLIC_API_BASE_URL!;
  const crudUrl = process.env.NEXT_PUBLIC_CRUD_URL!;

  // const api = DiscordApi("https://discord.com/api/v10/");

  if (!session) redirect("/");

  const guild = await fetchSpecificUserGuild(guildId);

  let streamer = null;

  try {
    const streamerResponse = await wrapper.getStreamerByGuildId(guildId);
    if (streamerResponse?.data) {
      streamer = streamerResponse.data;
    }
  } catch (error) {
    console.error("Error fetching streamer ID:", error);
  }

  // console.log("HERE", streamer)

  if (!streamer) redirect("/");

  // console.log("there", guild);

  if (guild == null) redirect("/");

  return (
    <StreamPage
      guild={guild}
      streamer_pass={streamer}
      apiBaseUrl={apiBaseUrl}
      crudUrl={crudUrl}
      avatarUrl={session.user.discordAccount?.avatar}
    ></StreamPage>
  );
}
