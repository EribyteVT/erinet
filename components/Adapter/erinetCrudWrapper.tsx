import {
  StreamsDataResponse,
  Stream,
  StreamDataResponse,
  StreamerDataResponse,
  GuildData,
} from "../Streams/types";
import dayjs from "dayjs";

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

    async addStream(
      streamerId: number,
      timestamp: string,
      streamName: string,
      duration: string,
      authToken: string,
      guildId: string
    ): Promise<StreamDataResponse> {
      const data = {
        streamerId,
        timestamp,
        streamName,
        duration,
        authToken,
        guildId,
      };

      const response = await fetch(`${baseUrl}/streams`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      });

      return await response.json();
    },

    async deleteStream(
      streamId: string,
      authToken: string,
      guildId: string
    ): Promise<StreamDataResponse> {
      const data = {
        authToken,
        guildId,
      };

      const response = await fetch(`${baseUrl}/streams/${streamId}`, {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      });

      return await response.json();
    },

    async editStream(
      streamId: string,
      authToken: string,
      guildId: string,
      newName: string,
      newTime: string,
      newDuration: number
    ): Promise<StreamDataResponse> {
      const data = {
        authToken,
        guildId,
        newTimestamp: newTime,
        newName,
        newDuration,
      };

      console.log(
        `Sending update request to ${baseUrl}/streams/${streamId}`,
        data
      );

      const response = await fetch(`${baseUrl}/streams/${streamId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      });

      const responseData = await response.json();
      console.log("Response from stream update:", responseData);

      return responseData;
    },

    async addEventToGuild(
      stream: Stream,
      authToken: string,
      guildId: string
    ): Promise<StreamDataResponse> {
      const endDate = dayjs(new Date(stream.stream_date)).add(
        stream.duration!,
        "minutes"
      );

      const data = {
        streamId: stream.stream_id,
        name: stream.stream_name,
        startTime: stream.stream_date,
        endTime: endDate.toISOString(),
        authToken,
        guildId,
      };

      const response = await fetch(`${baseUrl}/discord/events`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      });

      return await response.json();
    },

    async addEventToTwitch(
      stream: Stream,
      discordAuthToken: string,
      broadcastId: string,
      guildId: string
    ): Promise<StreamDataResponse> {
      const data = {
        streamId: stream.stream_id,
        name: stream.stream_name,
        startTime: stream.stream_date,
        duration: stream.duration,
        broadcastId,
        discordAuthToken,
        guildId,
      };

      const response = await fetch(`${baseUrl}/twitch/events`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      });

      return await response.json();
    },

    async getBotGuilds(): Promise<Array<GuildData>> {
      let url = `${baseUrl}/discord/guilds`;
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

    async setAutos(
      streamerId: number,
      authToken: string,
      guildId: string,
      setDiscord: string,
      setTwitch: string
    ): Promise<any> {
      const data = {
        streamerId,
        authToken,
        guildId,
        setDiscord,
        setTwitch,
      };

      const response = await fetch(`${baseUrl}/streamers/autos`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      });

      const result = await response.json();
      return result.data;
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

    async setStreamerTwitch(
      streamerId: number,
      twitchId: string,
      guild_id: string,
      authToken: string
    ) {
      const data = {
        streamerId,
        twitchId,
        guild_id,
        authToken,
      };

      const response = await fetch(`${baseUrl}/streamers/twitch`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
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
  };
}
