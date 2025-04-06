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
  const apiBaseUrl = process.env.NEXT_PUBLIC_API_BASE_URL!;
  const crudUrl = process.env.NEXT_PUBLIC_CRUD_URL!;

  if (!session) redirect("/");

  const guild = await fetchSpecificUserGuild(guildId);

  let streamer = null;

  try {
    const streamerResponse = await getStreamerByGuildAction(guildId);
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
      guild={guild}
      streamer_pass={streamer}
      apiBaseUrl={apiBaseUrl}
      crudUrl={crudUrl}
      avatarUrl={session.user.discordAccount?.avatar}
    ></StreamPage>
  );
}
