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
} from "lucide-react";
import { useCanvas } from "../hooks/useCanvas";
import { useScheduleData } from "../hooks/useScheduleData";
import {
  useTextFormatting,
  TextJustification,
  TimeFormat,
} from "../hooks/useTextFormatting";
import { getFieldFromType, getOffsetFromType } from "../types";
import { useState, useCallback } from "react";
import { Text, Polygon } from "fabric";

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
  } = useScheduleData();
  const { getTextSettings, updateTextSetting } = useTextFormatting();

  // State for tracking active tab
  const [activeTab, setActiveTab] = useState<TabType>("options");

  // State for tracking which text type sections are expanded
  const [expandedSections, setExpandedSections] = useState<Set<string>>(
    new Set()
  );

  const scheduleInputs = generateScheduleInputs();
  const groupedInputs = groupInputsByOffset();

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

      console.log(`Refreshing text formatting for type: ${textType}`);
      // Use override settings if provided, otherwise get current settings
      const currentSettings = getTextSettings(textType);
      const settings = overrideSettings
        ? { ...currentSettings, ...overrideSettings }
        : currentSettings;
      console.log(`Settings:`, settings);

      let textObjectsUpdated = 0;

      // Find all text objects linked to polygons of this text type
      canvas.getObjects().forEach((obj) => {
        if (obj.type === "text") {
          const textObj = obj as Text;
          const linkedPolygon = (textObj as any).linkedPolygon;

          if (linkedPolygon) {
            const field = getFieldFromType(linkedPolygon);
            if (field === textType) {
              console.log(`Updating text object for ${linkedPolygon}`);

              // Find the corresponding polygon to get bounds
              const polygon = canvas
                .getObjects()
                .find(
                  (polygonObj) =>
                    (polygonObj as any).polygonType === linkedPolygon
                ) as Polygon;

              if (polygon) {
                const bounds = polygon.getBoundingRect();
                const textPosition = getTextPosition(
                  bounds,
                  settings.justification
                );

                console.log(
                  `Text position for ${settings.justification}:`,
                  textPosition
                );

                // Update text formatting properties including position and alignment
                textObj.set({
                  fontSize: settings.fontSize,
                  textAlign: settings.justification,
                  left: textPosition.left,
                  top: bounds.top + bounds.height / 2,
                  originX: textPosition.originX,
                  originY: "center",
                });

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
                      const testLine = currentLine
                        ? `${currentLine} ${word}`
                        : word;
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

                // Ensure the text alignment is properly applied
                textObj.setCoords();

                textObjectsUpdated++;
              }
            }
          }
        }
      });

      console.log(`Updated ${textObjectsUpdated} text objects`);
      canvas.renderAll();
    },
    [canvas, getTextSettings, getTextPosition]
  );

  // Enhanced updateTextSetting that also refreshes canvas
  const handleTextSettingChange = useCallback(
    (
      textType: string,
      setting: "fontSize" | "justification" | "timeFormat",
      value: number | TextJustification | TimeFormat
    ) => {
      console.log(`Updating ${setting} to ${value} for ${textType}`);

      // Update the text setting
      updateTextSetting(textType, setting, value);

      // Create override settings with the new value
      const overrideSettings = { [setting]: value };

      // Refresh canvas formatting immediately with the new value
      refreshAllTextFormatting(textType, overrideSettings);
    },
    [updateTextSetting, refreshAllTextFormatting]
  );

  // Toggle section expansion
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

  // Get unique text types present on canvas
  const getTextTypes = () => {
    const types = new Set<string>();
    scheduleInputs.forEach((input) => {
      const field = getFieldFromType(input);
      if (field) {
        types.add(field);
      }
    });
    return Array.from(types).sort();
  };

  const formatFieldName = (field: string): string => {
    return field.replace(/_/g, " ").replace(/\b\w/g, (l) => l.toUpperCase());
  };

  const isTimeField = (field: string): boolean => {
    return field.includes("time");
  };

  const textTypes = getTextTypes();

  // Render Options Tab Content
  const renderOptionsTab = () => (
    <div className="space-y-6">
      {/* Text Formatting Controls */}
      {textTypes.length > 0 && (
        <Card className="bg-gray-700 border-gray-600">
          <CardHeader className="pb-3">
            <CardTitle className="text-white flex items-center gap-2">
              <Type className="h-4 w-4" />
              Text Formatting
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {textTypes.map((textType) => {
              const settings = getTextSettings(textType);
              const isExpanded = expandedSections.has(textType);

              return (
                <div
                  key={textType}
                  className="border border-gray-600 rounded-lg bg-gray-600"
                >
                  {/* Header */}
                  <button
                    onClick={() => toggleSection(textType)}
                    className="w-full flex items-center justify-between p-3 text-left hover:bg-gray-500 rounded-lg transition-colors"
                  >
                    <span className="text-white font-medium">
                      {formatFieldName(textType)}
                    </span>
                    {isExpanded ? (
                      <ChevronDown className="h-4 w-4 text-gray-300" />
                    ) : (
                      <ChevronRight className="h-4 w-4 text-gray-300" />
                    )}
                  </button>

                  {/* Collapsible Content */}
                  {isExpanded && (
                    <div className="px-3 pb-3 space-y-3">
                      {/* Font Size */}
                      <div className="space-y-1">
                        <Label className="text-xs text-gray-300">
                          Font Size
                        </Label>
                        <div className="flex items-center gap-2">
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
                            className="w-16 bg-gray-500 border-gray-400 text-white text-sm"
                          />
                          <span className="text-xs text-gray-400">px</span>
                        </div>
                      </div>

                      {/* Text Justification */}
                      <div className="space-y-1">
                        <Label className="text-xs text-gray-300">
                          Justification
                        </Label>
                        <div className="flex gap-1">
                          {(
                            ["left", "center", "right"] as TextJustification[]
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
            <Input
              type="date"
              className="bg-gray-600 border-gray-500 text-white"
              value={
                new Date(
                  new Date().getTime() - new Date().getTimezoneOffset() * 60000
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
                  selectedDate.getDate() - (dayOfWeek === 0 ? 6 : dayOfWeek - 1)
                );
                // setWeekStartDate(monday);
              }}
            />
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
