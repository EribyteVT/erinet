import {
  StreamsDataResponse,
  StreamerDataResponse,
  GuildData,
} from "../Streams/types";

export default function createStreamApiClient(baseUrlClient?: string) {
  const baseUrl = baseUrlClient
    ? baseUrlClient
    : process.env.NEXT_PUBLIC_API_BASE_URL;

  return {
    async getStreamerByGuildId(guildId: string): Promise<StreamerDataResponse> {
      const url = `${baseUrl}/streamers/guild/${guildId}`;

      const response = await fetch(url, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
      });

      return await response.json();
    },

    async getStreams(
      streamerId: number,
      timestampStart: string,
      timestampEnd?: string
    ): Promise<StreamsDataResponse> {
      let url = `${baseUrl}/streams?streamerId=${streamerId}&dateStart=${timestampStart}`;

      // Add the dateEnd parameter only if it's provided
      if (timestampEnd) {
        url += `&dateEnd=${timestampEnd}`;
      }

      console.log(url);

      const response = await fetch(url, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
      });
      return await response.json();
    },


    async getBotGuilds(): Promise<Array<GuildData>> {
      let url = `${baseUrl}/discord/botGuilds`;
      console.log(url);
      const response = await fetch(url, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
      });
      let data = await response.json();

      return data;
    },

    async findTwitchUser(twitchUserName: string): Promise<any> {
      const response = await fetch(
        `${baseUrl}/twitch/users/${twitchUserName}`,
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
          },
        }
      );

      const result = await response.json();
      return result.data;
    },

    async findTwitchId(twitchId: string): Promise<any> {
      const response = await fetch(`${baseUrl}/twitch/id/${twitchId}`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
      });

      return await response.json();
    },


    async guildHasAuthTokens(guild_id: string): Promise<boolean> {
      const response = await fetch(`${baseUrl}/twitch/tokens/${guild_id}`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
      });

      return (await response.json()).data;
    },

    async getUsersGuildNOAUTHTOKEN(): Promise<GuildData[]> {
      const response = await fetch(`${baseUrl}/discord/guilds`, {
        method: "GET",
      });

      console.log(response);

      const response_data = await response.json();

      return response_data;
    },
  };
}
