// components/image/components/tabs/ScheduleDataTab.tsx
"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Calendar, Clock, Database, RefreshCw } from "lucide-react";
import { getFieldFromType } from "../types";

interface ScheduleDataTabProps {
  weekStartDate: Date;
  setWeekStartDate: (date: Date) => void;
  loadScheduleDataFromDatabase: () => Promise<void>;
  isLoadingData: boolean;
  groupedInputs: Array<{
    offset: number;
    dayName: string;
    date: Date;
    inputs: string[];
  }>;
  scheduleData: Record<string, string>;
  updateScheduleData: (key: string, value: string) => void;
  formatFieldName: (field: string) => string;
}

export function ScheduleDataTab({
  weekStartDate,
  setWeekStartDate,
  loadScheduleDataFromDatabase,
  isLoadingData,
  groupedInputs,
  scheduleData,
  updateScheduleData,
  formatFieldName,
}: ScheduleDataTabProps) {
  return (
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
}
