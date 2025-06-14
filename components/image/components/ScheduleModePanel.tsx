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

  // Function to refresh all text objects on canvas with new formatting
  const refreshAllTextFormatting = useCallback(
    (textType: string) => {
      if (!canvas) return;

      const settings = getTextSettings(textType);

      // Find all text objects linked to polygons of this text type
      canvas.getObjects().forEach((obj) => {
        if (obj.type === "text") {
          const textObj = obj as Text;
          const linkedPolygon = (textObj as any).linkedPolygon;

          if (linkedPolygon) {
            const field = getFieldFromType(linkedPolygon);
            if (field === textType) {
              // Find the corresponding polygon to get bounds
              const polygon = canvas
                .getObjects()
                .find(
                  (polygonObj) =>
                    (polygonObj as any).polygonType === linkedPolygon
                ) as Polygon;

              if (polygon) {
                const bounds = polygon.getBoundingRect();

                // Update text formatting properties
                textObj.set({
                  fontSize: settings.fontSize,
                  textAlign: settings.justification,
                  left: bounds.left + bounds.width / 2,
                  top: bounds.top + bounds.height / 2,
                  originX: "center",
                  originY: "center",
                });

                // Auto-size text to fit within polygon bounds
                const fitTextToPolygon = (textObj: Text, bounds: any) => {
                  const maxWidth = bounds.width * 0.9;
                  const maxHeight = bounds.height * 0.9;
                  let fontSize = settings.fontSize;

                  // Scale down font size until text fits
                  while (fontSize > 8) {
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
              }
            }
          }
        }
      });

      canvas.renderAll();
    },
    [canvas, getTextSettings]
  );

  // Enhanced updateTextSetting that also refreshes canvas
  const handleTextSettingChange = useCallback(
    (
      textType: string,
      setting: "fontSize" | "justification" | "timeFormat",
      value: number | TextJustification | TimeFormat
    ) => {
      // Update the text setting
      updateTextSetting(textType, setting, value);

      // Refresh canvas formatting for this text type
      refreshAllTextFormatting(textType);
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
            <CardTitle className="text-sm text-blue-400 flex items-center gap-2">
              <Type className="h-4 w-4" />
              Text Formatting
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {textTypes.map((textType) => {
              const settings = getTextSettings(textType);
              const fieldName = formatFieldName(textType);
              const isTime = isTimeField(textType);
              const isExpanded = expandedSections.has(textType);

              return (
                <div
                  key={textType}
                  className="overflow-hidden border rounded-lg"
                >
                  {/* Collapsible Header */}
                  <button
                    onClick={() => toggleSection(textType)}
                    className="w-full p-3 flex items-center justify-between hover:bg-gray-500 transition-colors"
                  >
                    <h4 className="text-sm font-medium text-white">
                      {fieldName}
                    </h4>
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
                                    ? "bg-blue-600 hover:bg-blue-700"
                                    : "bg-gray-600 hover:bg-gray-500"
                                }`}
                                onClick={() =>
                                  handleTextSettingChange(
                                    textType,
                                    "justification",
                                    justify
                                  )
                                }
                              >
                                <IconComponent className="h-4 w-4" />
                              </Button>
                            );
                          })}
                        </div>
                      </div>

                      {/* Time Format (only for time fields) */}
                      {isTime && (
                        <div className="space-y-1">
                          <Label className="text-xs text-gray-300 flex items-center gap-1">
                            <Clock className="h-3 w-3" />
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
                            <SelectContent className="bg-gray-600 border-gray-500">
                              <SelectItem
                                value="24"
                                className="text-white hover:bg-gray-500"
                              >
                                24 Hour (14:30)
                              </SelectItem>
                              <SelectItem
                                value="12"
                                className="text-white hover:bg-gray-500"
                              >
                                12 Hour (2:30 PM)
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

      {/* Quick Actions */}
      <Card className="bg-gray-700 border-gray-600">
        <CardHeader className="pb-3">
          <CardTitle className="text-sm text-purple-400">
            Quick Actions
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          <Button
            onClick={() => {
              // Refresh all text formatting on canvas
              textTypes.forEach((textType) => {
                refreshAllTextFormatting(textType);
              });
            }}
            className="w-full bg-purple-600 hover:bg-purple-700 text-white text-sm"
          >
            Refresh All Text Formatting
          </Button>
        </CardContent>
      </Card>
    </div>
  );

  // Render Data Tab Content
  const renderDataTab = () => (
    <div className="space-y-6">
      {/* Schedule Data by Day */}
      {groupedInputs.length > 0 ? (
        <Card className="bg-gray-700 border-gray-600">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm text-green-400 flex items-center gap-2">
              <Clock className="h-4 w-4" />
              Weekly Schedule
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {groupedInputs.map((dayData) => (
              <div key={dayData.offset} className="space-y-3">
                <div className="flex items-center justify-between">
                  <h4 className="text-sm font-medium text-white">
                    {dayData.dayName}
                  </h4>
                  <span className="text-xs text-gray-400">
                    {dayData.date.toLocaleDateString()}
                  </span>
                </div>

                <div className="space-y-2">
                  {dayData.inputs.map((inputType) => {
                    const field = getFieldFromType(inputType);
                    const fieldName = field
                      ? formatFieldName(field)
                      : inputType;

                    return (
                      <div key={inputType} className="space-y-1">
                        <Label className="text-xs text-gray-300">
                          {fieldName}
                        </Label>
                        <Input
                          type={field === "stream_time" ? "time" : "text"}
                          value={scheduleData[inputType] || ""}
                          onChange={(e) => {
                            updateScheduleData(inputType, e.target.value);
                          }}
                          placeholder={`Enter ${fieldName.toLowerCase()}`}
                          className="bg-gray-500 border-gray-400 text-white text-sm"
                        />
                      </div>
                    );
                  })}
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      ) : (
        <Card className="bg-gray-700 border-gray-600">
          <CardContent className="p-6 text-center">
            <p className="text-gray-400 text-sm">
              No schedule polygons found. Switch to Design Mode to create
              schedule template polygons.
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );

  return (
    <div className="w-80 bg-gray-800 border-r border-gray-700 overflow-y-auto">
      <div className="p-6 space-y-6">
        {/* Header */}
        <div className="flex items-center gap-2">
          <Calendar className="h-5 w-5 text-green-400" />
          <h2 className="text-lg font-semibold text-white">Schedule Mode</h2>
        </div>

        {/* Tab Navigation */}
        <div className="flex space-x-1 bg-gray-700 p-1 rounded-lg">
          <button
            onClick={() => setActiveTab("options")}
            className={`flex-1 flex items-center justify-center gap-2 px-3 py-2 text-sm font-medium rounded-md transition-colors ${
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
            className={`flex-1 flex items-center justify-center gap-2 px-3 py-2 text-sm font-medium rounded-md transition-colors ${
              activeTab === "data"
                ? "bg-green-600 text-white"
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
