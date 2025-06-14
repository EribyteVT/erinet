// components/image/components/tabs/ScheduleOptionsTab.tsx
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
  Type,
  AlignLeft,
  AlignCenter,
  AlignRight,
  ChevronDown,
  ChevronRight,
} from "lucide-react";
import { TextJustification, TimeFormat } from "../hooks/useTextFormatting";
import { getFieldFromType } from "../types";

interface ScheduleOptionsTabProps {
  textTypes: string[];
  getTextSettings: (textType: string) => any;
  handleTextSettingChange: (
    textType: string,
    setting: string,
    value: any
  ) => void;
  expandedSections: Set<string>;
  toggleSection: (textType: string) => void;
  formatFieldName: (field: string) => string;
  isTimeField: (textType: string) => boolean;
}

const justificationIcons = {
  left: AlignLeft,
  center: AlignCenter,
  right: AlignRight,
};

export function ScheduleOptionsTab({
  textTypes,
  getTextSettings,
  handleTextSettingChange,
  expandedSections,
  toggleSection,
  formatFieldName,
  isTimeField,
}: ScheduleOptionsTabProps) {
  return (
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
                    <div className="mt-3 space-y-4 pl-4">
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
}
