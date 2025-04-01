import { GuildData } from "../Streams/types";

export default function DiscordApi(url_base: string) {
  async function send_data(
    url_extension: string,
    data: any,
    headers: {}
  ): Promise<any> {
    const url = url_base.concat(url_extension);

    const response = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(data),
    });

    let response_data = await response.json();

    return response_data["data"];
  }

  return {
    async getUsersGuildFromAuthToken(auth_token: string): Promise<GuildData[]> {
      const headers = {
        Authorization: "Bearer " + auth_token,
        "Content-Type": "application/json",
      };

      const response = await fetch(url_base + "users/@me/guilds", {
        method: "GET",
        headers: headers,
      });

      const response_data = await response.json();

      return response_data;
    },

    async getGuildData(
      auth_token: string,
      guild_id: string
    ): Promise<GuildData | null> {
      const headers = {
        Authorization: "Bearer " + auth_token,
        "Content-Type": "application/json",
      };

      const response = await fetch(url_base + "users/@me/guilds", {
        method: "GET",
        headers: headers,
      });

      let data: any[] = await response.json();

      let found_guild = null;

      data.forEach((guild) => {
        if (guild_id == guild.id) {
          found_guild = guild;
        }
      });

      return found_guild;
    },
  };
}
