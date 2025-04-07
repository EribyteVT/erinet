import Guild from "@/components/guild/Guild";
import { fetchUserGuilds, getBotGuilds } from "@/app/actions/discordActions";
import { GuildData } from "../Streams/types";

async function GetGuildData({}: {}) {
  const guilds = (await fetchUserGuilds()).data;

  const botGuilds = (await getBotGuilds()).data;

  const botGuildIds = botGuilds.map((value: GuildData) => {
    return value.id;
  });

  const admin_guilds = guilds.filter((value: GuildData) => {
    // console.log(parseInt(value.permissions) & 0x0000000000000008);
    return (parseInt(value.permissions) & 0x0000000000000008) != 0;
  });

  admin_guilds.sort((a: GuildData, b: GuildData) => {
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
      {admin_guilds.map((data: GuildData) => (
        <Guild key={data.id} guild={data} botGuilds={botGuildIds} />
      ))}
    </>
  );
}

export default async function GuildSelector({}: {}) {
  return (
    <div className="md:grids-col-2 grid md:gap-4 lg:grid-cols-3 xl:grid-cols-4 xl:gap-4 center sm:grids-col-1">
      <GetGuildData />
    </div>
  );
}
