// components/image/components/ScheduleModePanel.tsx
"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Calendar,
  Type,
  AlignLeft,
  AlignCenter,
  AlignRight,
  Clock,
  ChevronDown,
  ChevronRight,
  Settings,
  Database,
  RefreshCw,
} from "lucide-react";
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

interface ScheduleModePanelProps {
  guild: string;
  streamerId: number;
}

type TabType = "options" | "data";

const justificationIcons = {
  left: AlignLeft,
  center: AlignCenter,
  right: AlignRight,
};

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

      // Prepare batch updates for all days (exactly like GenerateScheduleButton)
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

      canvas.getObjects().forEach((obj) => {
        if ((obj as any).polygonType === dataType) {
          const polygon = obj as Polygon;

          // Get polygon bounds
          const bounds = polygon.getBoundingRect();

          // Get field type and combine current settings with overrides
          const field = getFieldFromType(dataType);
          const currentSettings = field
            ? getTextSettings(field)
            : getTextSettings("default");

          const settings = overrideSettings
            ? { ...currentSettings, ...overrideSettings }
            : currentSettings;

          // Get text position based on justification
          const textPosition = getTextPosition(bounds, settings.justification);

          // Create or find existing text object for this polygon
          let textObj = canvas
            .getObjects()
            .find(
              (o) => o.type === "text" && (o as any).linkedPolygon === dataType
            ) as Text;

          if (!textObj) {
            console.log(`Creating new text object for ${dataType}`);
            // Create new text object if it doesn't exist
            const textContent =
              value !== undefined && value !== null ? value : `[${dataType}]`;

            textObj = new Text(textContent, {
              left: textPosition.left,
              top: bounds.top + bounds.height / 2,
              originX: textPosition.originX,
              originY: "center",
              fontSize: settings.fontSize,
              fill: "#000000",
              fontFamily: "Arial",
              textAlign: settings.justification,
              selectable: false,
              evented: false,
            });

            // Link the text to this polygon
            (textObj as any).linkedPolygon = dataType;
            canvas.add(textObj);
          } else {
            console.log(`Updating existing text object for ${dataType}`);
            // Update existing text with new formatting
            const textContent =
              value !== undefined && value !== null ? value : `[${dataType}]`;

            textObj.set({
              text: textContent,
              fontSize: settings.fontSize,
              textAlign: settings.justification,
              left: textPosition.left,
              top: bounds.top + bounds.height / 2,
              originX: textPosition.originX,
              originY: "center",
            });
          }

          // Auto-size text to fit within polygon bounds
          const fitTextToPolygon = (textObj: Text, bounds: any) => {
            const maxWidth = bounds.width * 0.9; // 90% of polygon width for padding
            const maxHeight = bounds.height * 0.9; // 90% of polygon height for padding

            let fontSize = settings.fontSize;

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

          fitTextToPolygon(textObj, bounds);

          // Ensure the text coordinates are updated
          textObj.setCoords();
        }
      });

      canvas.renderAll();
    },
    [canvas, getTextSettings, getTextPosition]
  );

  // Function to refresh all text objects on canvas with new formatting
  const refreshAllTextFormatting = useCallback(
    (
      textType: string,
      overrideSettings?: Partial<{
        fontSize: number;
        justification: TextJustification;
        timeFormat: TimeFormat;
      }>
    ) => {
      if (!canvas) return;

      console.log(
        `Refreshing text formatting for type: ${textType}`,
        overrideSettings
      );

      // Find all text objects that are linked to polygons of this field type
      const matchingTexts = canvas.getObjects().filter((obj): obj is Text => {
        if (obj.type !== "text") return false;

        const linkedPolygon = (obj as any).linkedPolygon;
        if (!linkedPolygon) return false;

        // Extract the field type from the linked polygon (e.g., "day0_stream_name" -> "stream_name")
        const field = getFieldFromType(linkedPolygon);
        return field === textType;
      });

      console.log(`Found ${matchingTexts.length} text objects for ${textType}`);

      // For each matching text object, use our custom function with override settings
      matchingTexts.forEach((textObj) => {
        const linkedPolygon = (textObj as any).linkedPolygon;
        const currentValue = scheduleData[linkedPolygon] || "";

        // Use our custom function that accepts override settings directly
        updatePolygonTextWithSettings(
          linkedPolygon,
          currentValue,
          overrideSettings
        );
      });
    },
    [canvas, getFieldFromType, scheduleData, updatePolygonTextWithSettings]
  );

  // Helper function to update text settings and refresh display
  const handleTextSettingChange = useCallback(
    (
      textType: string,
      setting: "fontSize" | "justification" | "timeFormat",
      value: number | TextJustification | TimeFormat
    ) => {
      console.log(`Changing ${setting} to ${value} for ${textType}`);

      // Update the stored setting for persistence
      updateTextSetting(textType, setting, value);

      // Apply the formatting immediately by passing the new setting directly
      refreshAllTextFormatting(textType, { [setting]: value } as any);
    },
    [updateTextSetting, refreshAllTextFormatting]
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

  // Get unique text types from schedule inputs
  const textTypes = Array.from(
    new Set(scheduleInputs.map((input) => getFieldFromType(input) || input))
  );

  // Render Options Tab Content
  const renderOptionsTab = () => (
    <div className="space-y-6">
      {textTypes.length > 0 && (
        <Card className="bg-gray-700 border-gray-600">
          <CardHeader className="pb-3">
            <CardTitle className="text-white flex items-center gap-2">
              <Type className="h-4 w-4" />
              Text Formatting Options
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {textTypes.map((textType) => {
              const settings = getTextSettings(textType);
              const isExpanded = expandedSections.has(textType);

              return (
                <div key={textType} className="border-b border-gray-600 pb-4">
                  <button
                    onClick={() => toggleSection(textType)}
                    className="w-full flex items-center justify-between text-left text-white hover:text-blue-400 transition-colors"
                  >
                    <span className="font-medium">
                      {formatFieldName(textType)}
                    </span>
                    {isExpanded ? (
                      <ChevronDown className="h-4 w-4" />
                    ) : (
                      <ChevronRight className="h-4 w-4" />
                    )}
                  </button>

                  {isExpanded && (
                    <div className="mt-3 space-y-3 pl-4">
                      {/* Font Size */}
                      <div className="space-y-1">
                        <Label className="text-xs text-gray-300">
                          Font Size
                        </Label>
                        <Input
                          type="number"
                          min="8"
                          max="72"
                          value={settings.fontSize}
                          onChange={(e) =>
                            handleTextSettingChange(
                              textType,
                              "fontSize",
                              parseInt(e.target.value)
                            )
                          }
                          className="bg-gray-500 border-gray-400 text-white text-sm"
                        />
                      </div>

                      {/* Text Justification */}
                      <div className="space-y-1">
                        <Label className="text-xs text-gray-300">
                          Text Alignment
                        </Label>
                        <div className="flex gap-1">
                          {(
                            Object.keys(
                              justificationIcons
                            ) as TextJustification[]
                          ).map((justify) => {
                            const IconComponent = justificationIcons[justify];
                            return (
                              <Button
                                key={justify}
                                variant={
                                  settings.justification === justify
                                    ? "default"
                                    : "outline"
                                }
                                size="sm"
                                className={`flex-1 h-8 ${
                                  settings.justification === justify
                                    ? "bg-blue-600 hover:bg-blue-700 border-blue-600"
                                    : "bg-gray-500 hover:bg-gray-400 border-gray-400 text-gray-200"
                                }`}
                                onClick={() =>
                                  handleTextSettingChange(
                                    textType,
                                    "justification",
                                    justify
                                  )
                                }
                              >
                                <IconComponent className="h-3 w-3" />
                              </Button>
                            );
                          })}
                        </div>
                      </div>

                      {/* Time Format (only for time fields) */}
                      {isTimeField(textType) && (
                        <div className="space-y-1">
                          <Label className="text-xs text-gray-300">
                            Time Format
                          </Label>
                          <Select
                            value={settings.timeFormat}
                            onValueChange={(value: TimeFormat) =>
                              handleTextSettingChange(
                                textType,
                                "timeFormat",
                                value
                              )
                            }
                          >
                            <SelectTrigger className="bg-gray-500 border-gray-400 text-white text-sm">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="24">
                                24-hour (14:30)
                              </SelectItem>
                              <SelectItem value="12">
                                12-hour (2:30 PM)
                              </SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              );
            })}
          </CardContent>
        </Card>
      )}
    </div>
  );

  // Render Data Tab Content
  const renderDataTab = () => (
    <div className="space-y-6">
      {/* Week Start Date */}
      <Card className="bg-gray-700 border-gray-600">
        <CardHeader className="pb-3">
          <CardTitle className="text-white flex items-center gap-2">
            <Calendar className="h-4 w-4" />
            Week Configuration
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            <Label className="text-gray-300">Week Start Date (Monday)</Label>
            <div className="flex gap-2">
              <Input
                type="date"
                className="bg-gray-600 border-gray-500 text-white flex-1"
                value={
                  new Date(
                    weekStartDate.getTime() -
                      weekStartDate.getTimezoneOffset() * 60000
                  )
                    .toISOString()
                    .split("T")[0]
                }
                onChange={(e) => {
                  const selectedDate = new Date(e.target.value);
                  // Ensure it's a Monday
                  const dayOfWeek = selectedDate.getDay();
                  const monday = new Date(selectedDate);
                  monday.setDate(
                    selectedDate.getDate() -
                      (dayOfWeek === 0 ? 6 : dayOfWeek - 1)
                  );
                  setWeekStartDate(monday);
                }}
              />
              <Button
                onClick={loadScheduleDataFromDatabase}
                disabled={isLoadingData}
                className="bg-blue-600 hover:bg-blue-700"
                size="sm"
              >
                {isLoadingData ? (
                  <RefreshCw className="h-4 w-4 animate-spin" />
                ) : (
                  <RefreshCw className="h-4 w-4" />
                )}
              </Button>
            </div>
            {isLoadingData && (
              <p className="text-sm text-blue-400">Loading schedule data...</p>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Schedule Data Inputs */}
      <Card className="bg-gray-700 border-gray-600">
        <CardHeader className="pb-3">
          <CardTitle className="text-white flex items-center gap-2">
            <Database className="h-4 w-4" />
            Schedule Data
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {groupedInputs.map((group) => (
            <div key={group.offset} className="space-y-3">
              <div className="flex items-center gap-2 pb-2 border-b border-gray-600">
                <Clock className="h-4 w-4 text-blue-400" />
                <span className="text-white font-medium">
                  {group.dayName} - {group.date.toLocaleDateString()}
                </span>
              </div>
              <div className="grid gap-3">
                {group.inputs.map((input) => {
                  const field = getFieldFromType(input);
                  const fieldName = field
                    ? formatFieldName(field)
                    : formatFieldName(input);

                  return (
                    <div key={input} className="space-y-1">
                      <Label className="text-gray-300 text-sm">
                        {fieldName}
                      </Label>
                      <Input
                        type={field?.includes("time") ? "time" : "text"}
                        value={scheduleData[input] || ""}
                        onChange={(e) =>
                          updateScheduleData(input, e.target.value)
                        }
                        className="bg-gray-600 border-gray-500 text-white"
                        placeholder={`Enter ${fieldName.toLowerCase()}`}
                      />
                    </div>
                  );
                })}
              </div>
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
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
        {activeTab === "options" ? renderOptionsTab() : renderDataTab()}
      </div>
    </div>
  );
}
