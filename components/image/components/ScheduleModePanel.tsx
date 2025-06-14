// components/image/components/ScheduleModePanel.tsx
"use client";

import { Settings, Database } from "lucide-react";
import { useCanvas } from "../hooks/useCanvas";
import { useScheduleData } from "../hooks/useScheduleData";
import {
  useTextFormatting,
  TextJustification,
  TimeFormat,
} from "../hooks/useTextFormatting";
import {
  getFieldFromType,
  getOffsetFromType,
  getDateFromOffset,
  getDayName,
} from "../types";
import { useState, useCallback, useEffect } from "react";
import { Text, Polygon } from "fabric";
import { fetchStreamsArb } from "@/app/actions/streamActions";
import { format, startOfDay, addDays } from "date-fns";
import { Stream } from "@/components/Streams/types";
import { ScheduleOptionsTab } from "./ScheduleOptionsTab";
import { ScheduleDataTab } from "./ScheduleDataTab";

interface ScheduleModePanelProps {
  guild: string;
  streamerId: number;
}

type TabType = "options" | "data";

export function ScheduleModePanel({
  guild,
  streamerId,
}: ScheduleModePanelProps) {
  const { canvas } = useCanvas();
  const {
    generateScheduleInputs,
    groupInputsByOffset,
    scheduleData,
    updateScheduleData,
    batchUpdateScheduleData,
    weekStartDate,
    setWeekStartDate,
  } = useScheduleData();
  const { getTextSettings, updateTextSetting } = useTextFormatting();

  // State for tracking active tab
  const [activeTab, setActiveTab] = useState<TabType>("options");

  // State for tracking which text type sections are expanded
  const [expandedSections, setExpandedSections] = useState<Set<string>>(
    new Set()
  );

  // State for loading indicator
  const [isLoadingData, setIsLoadingData] = useState(false);

  const scheduleInputs = generateScheduleInputs();
  const groupedInputs = groupInputsByOffset();

  // Function to load schedule data from database (matching GenerateScheduleButton logic)
  const loadScheduleDataFromDatabase = useCallback(async () => {
    if (!streamerId || !weekStartDate || isLoadingData) return;

    setIsLoadingData(true);
    try {
      // Calculate date range for the week (exactly like GenerateScheduleButton)
      const fromDate = startOfDay(weekStartDate);
      const toDate = addDays(fromDate, 7); // 7 days total

      console.log(
        "Date range:",
        fromDate.toISOString(),
        "to",
        toDate.toISOString()
      );

      // Fetch streams for the week using the same function as GenerateScheduleButton
      const streams = await fetchStreamsArb(
        fromDate.toISOString(),
        toDate.toISOString(),
        guild,
        streamerId.toString()
      );

      console.log("STREAMS:");
      console.log(streams);

      // Create a map of streams by day (exactly like GenerateScheduleButton)
      const streamsByDay = new Map<number, Stream>();

      if (streams && streams.length > 0) {
        streams.forEach((stream) => {
          const streamDate = new Date(stream.stream_date);
          console.log("Processing stream:", stream.stream_name, streamDate);

          // Get the start of the week (Monday)
          const weekStart = startOfDay(weekStartDate);

          // Calculate the offset from the start of the week
          const dayOffset = Math.floor(
            (streamDate.getTime() - weekStart.getTime()) / (1000 * 60 * 60 * 24)
          );

          console.log(`Stream on day offset: ${dayOffset}`);

          // Only include streams within the 7-day range
          if (dayOffset >= 0 && dayOffset < 7) {
            streamsByDay.set(dayOffset, stream);
          }
        });
      }

      // Prepare batch updates for all schedule data
      const batchUpdates: Record<string, string> = {};

      // Process each day of the week (0-6)
      for (let dayOffset = 0; dayOffset < 7; dayOffset++) {
        const stream = streamsByDay.get(dayOffset);

        if (stream) {
          // Format time from stream_date (which includes time)
          const streamDateTime = new Date(stream.stream_date);
          const timeStr = format(streamDateTime, "HH:mm");

          // Calculate duration in hours
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
    } catch (error) {
      console.error("Error loading schedule data from database:", error);
    } finally {
      setIsLoadingData(false);
    }
  }, [streamerId, weekStartDate, guild]); // Removed batchUpdateScheduleData to prevent unnecessary re-runs

  // Auto-load data when component mounts
  useEffect(() => {
    loadScheduleDataFromDatabase();
  }, []); // Empty dependency array - only run on mount

  // Load data when week start date changes
  useEffect(() => {
    loadScheduleDataFromDatabase();
  }, [weekStartDate]); // Only when week date changes

  // Helper function to get text positioning based on justification
  const getTextPosition = useCallback(
    (bounds: any, justification: TextJustification) => {
      const padding = bounds.width * 0.05; // 5% padding

      switch (justification) {
        case "left":
          return {
            left: bounds.left + padding,
            originX: "left" as const,
          };
        case "right":
          return {
            left: bounds.left + bounds.width - padding,
            originX: "right" as const,
          };
        case "center":
        default:
          return {
            left: bounds.left + bounds.width / 2,
            originX: "center" as const,
          };
      }
    },
    []
  );

  // Custom function to update polygon text with override settings
  const updatePolygonTextWithSettings = useCallback(
    (
      dataType: string,
      value: string,
      overrideSettings?: Partial<{
        fontSize: number;
        justification: TextJustification;
        timeFormat: TimeFormat;
      }>
    ) => {
      if (!canvas) return;

      const objects = canvas.getObjects();
      const polygons = objects.filter(
        (obj) => obj.type === "polygon"
      ) as Polygon[];

      polygons.forEach((polygon) => {
        const polygonDataType = polygon.get("dataType");
        if (polygonDataType === dataType) {
          // Get current text settings for this data type
          const baseSettings = getTextSettings(dataType);
          const settings = { ...baseSettings, ...overrideSettings };

          // Remove existing text objects associated with this polygon
          const existingTexts = objects.filter(
            (obj) =>
              obj.type === "text" && obj.get("polygonId") === polygon.get("id")
          ) as Text[];

          existingTexts.forEach((text) => {
            canvas.remove(text);
          });

          // Handle time formatting for time fields
          let displayValue = value;
          if (
            dataType.includes("time") &&
            value &&
            settings.timeFormat === "12"
          ) {
            try {
              const [hours, minutes] = value.split(":");
              const hour24 = parseInt(hours, 10);
              const ampm = hour24 >= 12 ? "PM" : "AM";
              const hour12 = hour24 % 12 || 12;
              displayValue = `${hour12}:${minutes} ${ampm}`;
            } catch (e) {
              // If formatting fails, use original value
              displayValue = value;
            }
          }

          if (displayValue) {
            const bounds = polygon.getBoundingRect();
            const position = getTextPosition(bounds, settings.justification);

            const textObj = new Text(displayValue, {
              ...position,
              top: bounds.top + bounds.height / 2,
              originY: "center" as const,
              fontSize: settings.fontSize,
              fill: "#000000",
              fontFamily: "Arial",
              selectable: false,
              evented: false,
            });

            // Link text to polygon
            textObj.set("polygonId", polygon.get("id"));
            textObj.set("dataType", dataType);

            canvas.add(textObj);
          }
        }
      });

      canvas.requestRenderAll();
    },
    [canvas, getTextSettings, getTextPosition]
  );

  // Helper function to check if a field is a time field
  const isTimeField = (textType: string): boolean => {
    const field = getFieldFromType(textType);
    return field ? field.includes("time") : false;
  };

  // Helper function to format field names for display
  const formatFieldName = (field: string): string => {
    return field
      .replace(/_/g, " ")
      .replace(/\b\w/g, (l) => l.toUpperCase())
      .replace(/Time$/, "Time")
      .replace(/Id$/, "ID");
  };

  // Helper function to toggle section expansion
  const toggleSection = (textType: string) => {
    setExpandedSections((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(textType)) {
        newSet.delete(textType);
      } else {
        newSet.add(textType);
      }
      return newSet;
    });
  };

  // Helper function to update text settings and immediately apply to canvas
  const handleTextSettingChange = useCallback(
    (
      textType: string,
      setting: "fontSize" | "justification" | "timeFormat",
      value: number | TextJustification | TimeFormat
    ) => {
      console.log(`Changing ${setting} to ${value} for ${textType}`);

      // Update the stored setting for persistence
      updateTextSetting(textType, setting, value);

      // Apply the formatting immediately to existing text objects
      if (!canvas) return;

      // Find all text objects that match this field type
      const textObjects = canvas.getObjects().filter((obj): obj is Text => {
        if (obj.type !== "text") return false;

        const linkedPolygon = (obj as any).linkedPolygon;
        if (!linkedPolygon) return false;

        // Extract the field type from the linked polygon (e.g., "day0_stream_name" -> "stream_name")
        const field = getFieldFromType(linkedPolygon);
        return field === textType;
      });

      console.log(`Found ${textObjects.length} text objects for ${textType}`);

      // Update each matching text object
      textObjects.forEach((textObj) => {
        const linkedPolygon = (textObj as any).linkedPolygon;

        // Get the polygon to determine bounds and positioning
        const polygon = canvas
          .getObjects()
          .find((obj) => (obj as any).polygonType === linkedPolygon) as Polygon;

        if (!polygon) return;

        // Get polygon bounds
        const bounds = polygon.getBoundingRect();

        // Get current text settings with the new value
        const currentSettings = getTextSettings(textType);
        const updatedSettings = { ...currentSettings, [setting]: value };

        // Calculate text position based on justification
        const getTextPosition = (justification: TextJustification) => {
          const padding = bounds.width * 0.05;

          switch (justification) {
            case "left":
              return { left: bounds.left + padding, originX: "left" as const };
            case "right":
              return {
                left: bounds.left + bounds.width - padding,
                originX: "right" as const,
              };
            case "center":
            default:
              return {
                left: bounds.left + bounds.width / 2,
                originX: "center" as const,
              };
          }
        };

        // Handle time format changes
        if (setting === "timeFormat") {
          const currentValue = scheduleData[linkedPolygon] || "";
          if (currentValue && linkedPolygon.includes("time")) {
            let displayValue = currentValue;
            if (value === "12") {
              try {
                const [hours, minutes] = currentValue.split(":");
                const hour24 = parseInt(hours, 10);
                const ampm = hour24 >= 12 ? "PM" : "AM";
                const hour12 = hour24 % 12 || 12;
                displayValue = `${hour12}:${minutes} ${ampm}`;
              } catch (e) {
                displayValue = currentValue;
              }
            }
            textObj.set("text", displayValue);
          }
        }

        // Apply the updated settings
        const justification =
          setting === "justification"
            ? (value as TextJustification)
            : updatedSettings.justification;
        const fontSize =
          setting === "fontSize" ? (value as number) : updatedSettings.fontSize;
        const textPosition = getTextPosition(justification);

        textObj.set({
          fontSize: fontSize,
          left: textPosition.left,
          originX: textPosition.originX,
          top: bounds.top + bounds.height / 2,
          originY: "center",
          textAlign: justification,
        });

        // Auto-size text to fit within polygon bounds (the crucial missing part!)
        const fitTextToPolygon = (
          textObj: Text,
          bounds: any,
          initialFontSize: number
        ) => {
          const maxWidth = bounds.width * 0.9; // 90% of polygon width for padding
          const maxHeight = bounds.height * 0.9; // 90% of polygon height for padding

          let fontSize = initialFontSize;

          // Scale down font size until text fits
          while (fontSize > 8) {
            // Minimum font size
            textObj.set("fontSize", fontSize);

            const textBounds = textObj.getBoundingRect();

            if (
              textBounds.width <= maxWidth &&
              textBounds.height <= maxHeight
            ) {
              break;
            }

            fontSize -= 1;
          }

          // Handle text wrapping for long text
          const words = (textObj.text || "").split(" ");
          if (words.length > 1) {
            let wrappedText = "";
            let currentLine = "";

            for (const word of words) {
              const testLine = currentLine ? `${currentLine} ${word}` : word;
              textObj.set("text", testLine);

              const testBounds = textObj.getBoundingRect();

              if (testBounds.width > maxWidth && currentLine) {
                wrappedText += (wrappedText ? "\n" : "") + currentLine;
                currentLine = word;
              } else {
                currentLine = testLine;
              }
            }

            wrappedText += (wrappedText ? "\n" : "") + currentLine;
            textObj.set("text", wrappedText);

            // Check if wrapped text still fits, if not reduce font size more
            while (
              textObj.getBoundingRect().height > maxHeight &&
              fontSize > 8
            ) {
              fontSize -= 1;
              textObj.set("fontSize", fontSize);
            }
          }
        };

        // Apply the text fitting logic
        fitTextToPolygon(textObj, bounds, fontSize);

        // Update text coordinates
        textObj.setCoords();
      });

      // Re-render the canvas
      canvas.renderAll();
    },
    [updateTextSetting, canvas, getFieldFromType, getTextSettings, scheduleData]
  );

  // Get unique text types from schedule inputs
  const textTypes = Array.from(
    new Set(scheduleInputs.map((input) => getFieldFromType(input) || input))
  );

  return (
    <div className="w-100 bg-gray-800 border-r border-gray-700 overflow-y-auto">
      <div className="p-6 space-y-6">
        {/* Tab Navigation */}
        <div className="flex bg-gray-700 rounded-lg p-1">
          <button
            onClick={() => setActiveTab("options")}
            className={`flex-1 flex items-center justify-center gap-2 px-4 py-2 rounded-md text-sm font-medium transition-colors ${
              activeTab === "options"
                ? "bg-blue-600 text-white"
                : "text-gray-300 hover:text-white hover:bg-gray-600"
            }`}
          >
            <Settings className="h-4 w-4" />
            Options
          </button>
          <button
            onClick={() => setActiveTab("data")}
            className={`flex-1 flex items-center justify-center gap-2 px-4 py-2 rounded-md text-sm font-medium transition-colors ${
              activeTab === "data"
                ? "bg-blue-600 text-white"
                : "text-gray-300 hover:text-white hover:bg-gray-600"
            }`}
          >
            <Database className="h-4 w-4" />
            Data
          </button>
        </div>

        {/* Tab Content */}
        {activeTab === "options" ? (
          <ScheduleOptionsTab
            textTypes={textTypes}
            getTextSettings={getTextSettings}
            handleTextSettingChange={handleTextSettingChange}
            expandedSections={expandedSections}
            toggleSection={toggleSection}
            formatFieldName={formatFieldName}
            isTimeField={isTimeField}
          />
        ) : (
          <ScheduleDataTab
            weekStartDate={weekStartDate}
            setWeekStartDate={setWeekStartDate}
            loadScheduleDataFromDatabase={loadScheduleDataFromDatabase}
            isLoadingData={isLoadingData}
            groupedInputs={groupedInputs}
            scheduleData={scheduleData}
            updateScheduleData={updateScheduleData}
            formatFieldName={formatFieldName}
          />
        )}
      </div>
    </div>
  );
}
