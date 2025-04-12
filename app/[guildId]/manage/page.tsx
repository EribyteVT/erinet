import { auth } from "@/auth";
import { redirect } from "next/navigation";
import StreamPage from "@/components/Streams/StreamPage";
import { fetchSpecificUserGuild } from "@/app/actions/discordActions";
import { getStreamerByGuildAction } from "@/app/actions/streameractions";

export default async function Page({
  params,
}: {
  params: Promise<{ guildId: string }>;
}) {
  const guildId = (await params).guildId;
  const session = await auth();
  const apiTwitchUrl = process.env.TWITCH_REDIRECT_URI!;
  const crudUrl = process.env.NEXT_PUBLIC_CRUD_URL!;

  if (!session) redirect("/");

  const guild = (await fetchSpecificUserGuild(guildId)).data;

  let streamer = null;

  try {
    const streamerResponse = await getStreamerByGuildAction(guildId);
    if (streamerResponse?.data) {
      streamer = streamerResponse.data;
    }
  } catch (error) {
    console.error("Error fetching streamer ID:", error);
  }

  if (!streamer) redirect(`/${guildId}/onboarding`);

  if (guild == null) redirect("/");

  return (
    <StreamPage
      guild={guild}
      streamer_pass={streamer}
      apiTwitchUrl={apiTwitchUrl}
      crudUrl={crudUrl}
      avatarUrl={session.user.discordAccount?.avatar}
    ></StreamPage>
  );
}
