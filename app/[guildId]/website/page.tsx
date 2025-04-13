import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { fetchSpecificUserGuild } from "@/app/actions/discordActions";
import { getStreamerByGuildAction } from "@/app/actions/streameractions";
import { WebsiteGenerator } from "@/components/websiteGenerator/WebsiteGenerator";

export default async function Page({
  params,
}: {
  params: Promise<{ guildId: string }>;
}) {
  const guildId = (await params).guildId;
  const session = await auth();
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
    <WebsiteGenerator
      streamer={streamer}
      discordAvatar={session.user.discordAccount?.avatar}
      crudUrl={crudUrl}
    />
  );
}
