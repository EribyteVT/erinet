import { useCallback, useRef } from "react";
import { Stream } from "../../types";
import {
  addStreamAction,
  deleteStreamAction,
  editStreamAction,
  fetchStreamsAction,
} from "@/app/actions/streamActions";

interface AddStreamParams {
  name: string;
  time: string;
  duration: string;
}

export const useStreams = (
  guildId: string,
  streamerId: number,
  apiBaseUrl: string
) => {
  // Get streamer ID only once and cache it
  function getStreamerId(): number {
    return streamerId;
  }

  const fetchStreams = useCallback(async (): Promise<Stream[] | null> => {
    try {
      if (!streamerId) return null;

      const streamerIdStr = streamerId.toString();
      const currentDate = new Date();

      const streamData = await fetchStreamsAction(streamerIdStr, currentDate);

      return streamData?.data || null;
    } catch (error) {
      console.error("Error fetching streams:", error);
      return null;
    }
  }, [streamerId]);

  const fetchStreamsArb = useCallback(
    async (dateStart: Date, dateEnd: Date): Promise<Stream[] | null> => {
      try {
        if (!streamerId) return null;
        console.log("FETCHING STREAMS");

        dateStart.setHours(0);
        dateStart.setMinutes(0);
        dateStart.setSeconds(0);
        dateStart.setMilliseconds(0);

        dateEnd.setHours(0);
        dateEnd.setMinutes(0);
        dateEnd.setSeconds(0);
        dateEnd.setMilliseconds(0);

        const streamerIdStr = streamerId.toString();
        const streamData = await fetchStreamsAction(
          streamerIdStr,
          dateStart,
          dateEnd
        );

        return streamData?.data || null;
      } catch (error) {
        console.error("Error fetching streams:", error);
        return null;
      }
    },
    [streamerId]
  );

  const addStream = useCallback(
    async ({
      name,
      time,
      duration,
    }: AddStreamParams): Promise<{
      success: boolean;
      data?: Stream | null;
    }> => {
      try {
        console.log(streamerId);
        if (!streamerId) {
          throw new Error("Failed to get streamer ID");
        }

        const streamData = await addStreamAction(
          streamerId,
          time,
          name,
          duration,
          guildId
        );

        if (streamData?.response === "OKAY") {
          return {
            success: true,
            data: streamData.data,
          };
        }

        throw new Error("Failed to add stream");
      } catch (error) {
        console.error("Error adding stream:", error);
        return { success: false };
      }
    },
    [guildId, streamerId]
  );

  const deleteStream = useCallback(
    async (streamId: string): Promise<boolean> => {
      try {
        const response = await deleteStreamAction(streamId, guildId);

        return response.response === "OKAY";
      } catch (error) {
        console.error("Error deleting stream:", error);
        return false;
      }
    },
    [guildId]
  );

  const updateStream = useCallback(
    async (
      streamId: string,
      guildId: string,
      newName: string,
      newTime: string,
      newDuration: number
    ): Promise<{ success: boolean; data?: Stream | null }> => {
      try {
        console.log("Updating stream with new data:", {
          streamId,
          guildId,
          newName,
          newTime,
          newDuration,
        });

        const response = await editStreamAction(
          streamId,
          guildId,
          newName,
          newTime,
          newDuration
        );

        console.log("Stream update response:", response);

        if (response.response === "OKAY") {
          return {
            success: true,
            data: response.data,
          };
        }

        throw new Error("Failed to update stream");
      } catch (error) {
        console.error("Error updating stream:", error);
        return { success: false };
      }
    },
    []
  );

  return {
    fetchStreams,
    fetchStreamsArb,
    addStream,
    deleteStream,
    updateStream,
  };
};
