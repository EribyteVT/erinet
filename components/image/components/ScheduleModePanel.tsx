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
} from "lucide-react";
import { useCanvas } from "../hooks/useCanvas";
import { useScheduleData } from "../hooks/useScheduleData";
import {
  useTextFormatting,
  TextJustification,
  TimeFormat,
} from "../hooks/useTextFormatting";
import { getFieldFromType } from "../types";
import { useState } from "react";

interface ScheduleModePanelProps {
  guild: string;
  streamerId: number;
}

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
  const { generateScheduleInputs, groupInputsByOffset } = useScheduleData();
  const { getTextSettings, updateTextSetting } = useTextFormatting();

  // State for tracking which text type sections are expanded
  const [expandedSections, setExpandedSections] = useState<Set<string>>(
    new Set()
  );

  const scheduleInputs = generateScheduleInputs();
  const groupedInputs = groupInputsByOffset();

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

  return (
    <div className="w-80 bg-gray-800 border-r border-gray-700 overflow-y-auto">
      <div className="p-6 space-y-6">
        {/* Header */}
        <div className="flex items-center gap-2">
          <Calendar className="h-5 w-5 text-green-400" />
          <h2 className="text-lg font-semibold text-white">Schedule Mode</h2>
        </div>

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
                                updateTextSetting(
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
                                      : "bg-gray-500 hover:bg-gray-400 border-gray-400"
                                  }`}
                                  onClick={() =>
                                    updateTextSetting(
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
                        {isTime && (
                          <div className="space-y-1">
                            <Label className="text-xs text-gray-300 flex items-center gap-1">
                              <Clock className="h-3 w-3" />
                              Time Format
                            </Label>
                            <Select
                              value={settings.timeFormat}
                              onValueChange={(value: TimeFormat) =>
                                updateTextSetting(textType, "timeFormat", value)
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
      </div>
    </div>
  );
}
