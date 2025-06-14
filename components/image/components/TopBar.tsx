// components/image/components/TopBar.tsx
"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { AppMode } from "../ScheduleImageGenerator";
import { Settings, Palette, Calendar, Server } from "lucide-react";
import { GenerateScheduleButton } from "./GenerateScheduleButton";
import { useScheduleData } from "../hooks/useScheduleData";

interface TopBarProps {
  mode: AppMode;
  onModeChange: (mode: AppMode) => void;
  guildId: string;
  streamerId: number;
}

export function TopBar({
  mode,
  onModeChange,
  guildId,
  streamerId,
}: TopBarProps) {
  const { weekStartDate, setWeekStartDate } = useScheduleData();

  return (
    <div className="bg-gray-800 border-b border-gray-700 px-6 py-3">
      <div className="flex items-center justify-between">
        {/* Left Side - Title and Guild Info */}
        <div className="flex items-center gap-4">
          <h1 className="text-xl font-bold text-white">
            Schedule Image Generator
          </h1>
        </div>

        {/* Center - Mode Toggle */}
        <div className="flex items-center gap-2">
          <Button
            variant={mode === "design" ? "default" : "outline"}
            onClick={() => onModeChange("design")}
            className={`${
              mode === "design"
                ? "bg-blue-600 hover:bg-blue-700"
                : "border-gray-600 hover:bg-gray-700"
            }`}
          >
            <Palette className="h-4 w-4 mr-2" />
            Design Mode
          </Button>

          <Button
            variant={mode === "schedule" ? "default" : "outline"}
            onClick={() => onModeChange("schedule")}
            className={`${
              mode === "schedule"
                ? "bg-green-600 hover:bg-green-700"
                : "border-gray-600 hover:bg-gray-700"
            }`}
          >
            <Calendar className="h-4 w-4 mr-2" />
            Schedule Mode
          </Button>
        </div>

        {/* Right Side - Week Selector, Generate Button, and Settings */}
        <div className="flex items-center gap-4">
          {/* Week Selector - only show in schedule mode */}
          {mode === "schedule" && (
            <div className="flex items-center gap-2">
              <Label className="text-sm font-medium text-green-400 whitespace-nowrap">
                Week Start:
              </Label>
              <Input
                type="date"
                value={weekStartDate.toISOString().split("T")[0]}
                onChange={(e) => setWeekStartDate(new Date(e.target.value))}
                className="bg-gray-600 border-gray-500 text-white w-36"
              />
            </div>
          )}

          {/* Generate Button - only show in schedule mode */}
          {mode === "schedule" && (
            <GenerateScheduleButton
              guild={guildId}
              streamerId={streamerId}
              mode="schedule"
            />
          )}

          {/* Settings Button */}
          <Button
            variant="outline"
            size="sm"
            className="border-gray-600 hover:bg-gray-700"
            onClick={() => alert("Settings coming soon!")}
          >
            <Settings className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  );
}
