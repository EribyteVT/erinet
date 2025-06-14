// components/image/components/GenerateScheduleButton.tsx
"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Calendar, Loader2 } from "lucide-react";
import { useCanvas } from "../hooks/useCanvas";
import { useScheduleData } from "../hooks/useScheduleData";
import { format, startOfDay, addDays } from "date-fns";
import { Stream } from "@/components/Streams/types";
import { fetchStreamsArb } from "@/app/actions/streamActions";
import { getDateFromOffset, getDayName } from "../types";

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
  const { batchUpdateScheduleData, weekStartDate } = useScheduleData();
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
      const toDate = addDays(fromDate, 7); // 7 days total

      console.log(
        "Date range:",
        fromDate.toISOString(),
        "to",
        toDate.toISOString()
      );

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
          console.log("Processing stream:", streamDate, stream.stream_name);
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

      // Prepare batch updates for all days
      const batchUpdates: Record<string, string> = {};

      // Update canvas with data for each day (0-6)
      for (let dayOffset = 0; dayOffset <= 6; dayOffset++) {
        const stream = streamsByDay.get(dayOffset);

        // Calculate the date for this day offset
        const dayDate = getDateFromOffset(weekStartDate, dayOffset);
        const dayName = getDayName(dayOffset, weekStartDate);
        const formattedDate = format(dayDate, "MM/dd");

        // Add basic day info to batch updates
        batchUpdates[`day${dayOffset}_stream_date`] = formattedDate;
        batchUpdates[`day${dayOffset}_day_name`] = dayName;

        if (stream) {
          console.log(
            `Processing stream for day ${dayOffset}:`,
            stream.stream_name
          );

          // Update with actual stream data
          const streamDate = new Date(stream.stream_date);
          const timeStr = format(streamDate, "HH:mm");
          const durationHours = stream.duration
            ? Math.round(stream.duration / 60)
            : 0;

          console.log(
            `Day ${dayOffset} - Time: ${timeStr}, Duration: ${durationHours}h`
          );

          // Add stream data to batch updates
          batchUpdates[`day${dayOffset}_stream_name`] =
            stream.stream_name || "";
          batchUpdates[`day${dayOffset}_stream_time`] = timeStr;
          batchUpdates[`day${dayOffset}_game`] =
            stream.category_id || "Just Chatting";
          batchUpdates[`day${dayOffset}_duration`] = `${durationHours}h`;
          batchUpdates[`day${dayOffset}_notes`] = "";
        } else {
          console.log(`No stream for day ${dayOffset}`);
          // No stream for this day - clear the fields
          batchUpdates[`day${dayOffset}_stream_name`] = "No stream";
          batchUpdates[`day${dayOffset}_stream_time`] = "";
          batchUpdates[`day${dayOffset}_game`] = "";
          batchUpdates[`day${dayOffset}_duration`] = "";
          batchUpdates[`day${dayOffset}_notes`] = "";
        }
      }

      console.log("Batch updates to apply:", batchUpdates);

      // Apply all updates at once
      batchUpdateScheduleData(batchUpdates);

      // Wait a bit for canvas to update
      await new Promise((resolve) => setTimeout(resolve, 300));

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

    // Hide all polygons before generating the image
    const polygons = canvas
      .getObjects()
      .filter((obj) => (obj as any).polygonType);
    polygons.forEach((polygon) => polygon.set("visible", false));

    // Re-render canvas to ensure polygons are hidden
    canvas.renderAll();

    // Generate image without polygons
    const dataURL = canvas.toDataURL();

    // Restore polygon visibility after image generation
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
