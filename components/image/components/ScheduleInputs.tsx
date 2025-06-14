"use client";

import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { useScheduleData } from "../hooks/useScheduleData";
import { getFieldFromType } from "../types";

export function ScheduleInputs() {
  const {
    scheduleData,
    updateScheduleData,
    groupInputsByOffset,
    weekStartDate,
    setWeekStartDate,
  } = useScheduleData();

  const groupedInputs = groupInputsByOffset();

  const getInputType = (dataType: string): string => {
    const field = getFieldFromType(dataType);
    switch (field) {
      case "stream_time":
        return "time";
      case "notes":
        return "textarea";
      case "duration":
        return "select";
      default:
        return "text";
    }
  };

  const formatFieldName = (dataType: string): string => {
    const field = getFieldFromType(dataType);
    if (!field) return dataType;

    return field.replace(/_/g, " ").replace(/\b\w/g, (l) => l.toUpperCase());
  };

  return (
    <div className="space-y-6">
      {/* Week Start Date Picker */}
      <div className="space-y-2">
        <Label className="text-sm font-medium text-green-400">
          Week Starting Date
        </Label>
        <Input
          type="date"
          value={weekStartDate.toISOString().split("T")[0]}
          onChange={(e) => setWeekStartDate(new Date(e.target.value))}
          className="bg-gray-600 border-gray-500 text-white"
        />
        <p className="text-xs text-gray-400">
          This will be Day 0. All other days will be calculated from this date.
        </p>
      </div>
    </div>
  );
}
