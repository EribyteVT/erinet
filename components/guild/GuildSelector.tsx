import Guild from "@/components/guild/Guild";
import DiscordApi from "../Adapter/discord_funcs";
import type { Session } from "next-auth";
import ErinetCrudWrapper from "../Adapter/erinetCrudWrapper";

async function GuildData({ session }: { session: Session }) {
  const wrapper = ErinetCrudWrapper();

  const api = DiscordApi("https://discord.com/api/v10/");

  if (session.user.discordAccount == undefined) {
    return;
  }

  const guilds = await api.getUsersGuildFromAuthToken(
    session.user.discordAccount?.access_token!
  );

  const botGuilds = await wrapper.getBotGuilds();

  const botGuildIds = botGuilds.map((value) => {
    return value.id;
  });

  const admin_guilds = guilds.filter((value) => {
    // console.log(parseInt(value.permissions) & 0x0000000000000008);
    return (parseInt(value.permissions) & 0x0000000000000008) != 0;
  });

  admin_guilds.sort((a, b) => {
    let val_a = 0;
    let val_b = 0;
    if (botGuildIds.includes(a.id)) {
      val_a = -1;
    }
    if (botGuildIds.includes(b.id)) {
      val_b = -1;
    }

    return val_a - val_b;
  });

  return (
    <>
      {admin_guilds.map((data) => (
        <Guild key={data.id} guild={data} botGuilds={botGuildIds} />
      ))}
    </>
  );
}

export default async function GuildSelector({ session }: { session: Session }) {
  return (
    <div className="md:grids-col-2 grid md:gap-4 lg:grid-cols-3 xl:grid-cols-4 xl:gap-4 center sm:grids-col-1">
      <GuildData session={session} />
    </div>
  );
}
