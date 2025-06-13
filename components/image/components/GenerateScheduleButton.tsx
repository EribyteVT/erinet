// components/image/components/GenerateScheduleButton.tsx
"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Calendar, Loader2, Download } from "lucide-react";
import { useCanvas } from "../hooks/useCanvas";
import { useScheduleData } from "../hooks/useScheduleData";
import { format, startOfDay, addDays } from "date-fns";
import { Stream } from "@/components/Streams/types";
import { fetchStreamsArb } from "@/app/actions/streamActions";

interface GenerateScheduleButtonProps {
  guild: string;
  streamerId: number;
  mode?: "schedule" | "design";
}

export function GenerateScheduleButton({
  guild,
  streamerId,
  mode = "schedule",
}: GenerateScheduleButtonProps) {
  const { canvas } = useCanvas();
  const { updateScheduleData, weekStartDate } = useScheduleData();
  const [isGenerating, setIsGenerating] = useState(false);

  const generateScheduleImage = async () => {
    if (!canvas) {
      console.error("Canvas not available");
      return;
    }

    setIsGenerating(true);

    try {
      // Calculate date range for the week
      const fromDate = startOfDay(weekStartDate);
      const toDate = addDays(fromDate, 6); // 7 days total

      // Fetch streams for the week
      const streams = await fetchStreamsArb(
        fromDate.toISOString(),
        toDate.toISOString(),
        guild,
        streamerId.toString()
      );

      console.log("STREAMS:");
      console.log(streams);

      // Create a map of streams by day
      const streamsByDay = new Map<number, Stream>();

      if (streams && streams.length > 0) {
        streams.forEach((stream) => {
          const streamDate = new Date(stream.stream_date);
          console.log(streamDate);
          const dayOffset = Math.floor(
            (streamDate.getTime() - fromDate.getTime()) / (1000 * 60 * 60 * 24)
          );

          // Only include streams within our 7-day window
          if (dayOffset >= 0 && dayOffset <= 6) {
            // If there's already a stream for this day, keep the earlier one
            if (
              !streamsByDay.has(dayOffset) ||
              streamDate < new Date(streamsByDay.get(dayOffset)!.stream_date)
            ) {
              streamsByDay.set(dayOffset, stream);
            }
          }
        });
      }

      // Update canvas with stream data for each day
      for (let dayOffset = 0; dayOffset <= 6; dayOffset++) {
        const stream = streamsByDay.get(dayOffset);

        if (stream) {
          console.log("YES STREAM");
          console.log(`day${dayOffset}_stream_time`);

          // Update with actual stream data
          const streamDate = new Date(stream.stream_date);
          const timeStr = format(streamDate, "HH:mm");
          const durationHours = stream.duration
            ? Math.round(stream.duration / 60)
            : 0;
          console.log(timeStr);
          updateScheduleData(`day${dayOffset}_stream_name`, stream.stream_name);
          updateScheduleData(`day${dayOffset}_stream_time`, timeStr);
          updateScheduleData(
            `day${dayOffset}_game`,
            stream.category_id || "Just Chatting"
          );
          updateScheduleData(`day${dayOffset}_duration`, `${durationHours}`);
          updateScheduleData(`day${dayOffset}_notes`, ""); // You can customize this
        } else {
          // No stream for this day
          updateScheduleData(`day${dayOffset}_stream_name`, "No stream");
          updateScheduleData(`day${dayOffset}_stream_time`, "");
          updateScheduleData(`day${dayOffset}_game`, "");
          updateScheduleData(`day${dayOffset}_duration`, "");
          updateScheduleData(`day${dayOffset}_notes`, "");
        }
      }

      // Render the canvas to ensure all updates are visible
      canvas.renderAll();

      // Small delay to ensure rendering is complete
      await new Promise((resolve) => setTimeout(resolve, 100));

      // Export the image
      exportScheduleImage();
    } catch (error) {
      console.error("Error generating schedule image:", error);
      alert("Failed to generate schedule image. Please try again.");
    } finally {
      setIsGenerating(false);
    }
  };

  const exportScheduleImage = () => {
    if (!canvas) return;

    canvas.discardActiveObject();
    canvas.renderAll();

    const polygons = canvas
      .getObjects()
      .filter((obj) => obj.type === "polygon");
    polygons.forEach((polygon) => polygon.set("visible", false));

    // Generate image
    const dataURL = canvas.toDataURL();

    polygons.forEach((polygon) => polygon.set("visible", true));
    canvas.renderAll();

    const link = document.createElement("a");
    link.download = `schedule-${format(weekStartDate, "yyyy-MM-dd")}.png`;
    link.href = dataURL;
    link.click();
  };

  return (
    <Button
      onClick={generateScheduleImage}
      disabled={isGenerating}
      className={
        mode === "schedule"
          ? "bg-green-600 hover:bg-green-700"
          : "bg-blue-600 hover:bg-blue-700"
      }
    >
      {isGenerating ? (
        <>
          <Loader2 className="h-4 w-4 mr-2 animate-spin" />
          Generating...
        </>
      ) : (
        <>
          <Calendar className="h-4 w-4 mr-2" />
          Generate Schedule Image
        </>
      )}
    </Button>
  );
}
