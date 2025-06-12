// components/image/components/ScheduleModePanel.tsx
"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Calendar, Download } from "lucide-react";
import { useCanvas } from "../hooks/useCanvas";
import { useScheduleData } from "../hooks/useScheduleData";
// import { ScheduleInputs } from "./ScheduleInputs";
// import { WeekSelector } from "./WeekSelector";
import { GenerateScheduleButton } from "./GenerateScheduleButton";

interface ScheduleModePanelProps {
  guild: string;
  streamerId: number;
}

export function ScheduleModePanel({
  guild,
}: //   streamerId,
ScheduleModePanelProps) {
  const streamerId = 3;
  const { exportImage } = useCanvas();
  const { groupInputsByOffset } = useScheduleData();

  const groupedInputs = groupInputsByOffset();

  return (
    <div className="w-100 bg-gray-800 border-r border-gray-700 overflow-y-auto">
      <div className="p-6 space-y-6">
        {/* Week Selection */}
        <Card className="bg-gray-700 border-gray-600">
          <CardHeader className="pb-3">
            <CardTitle className="text-lg flex items-center gap-2">
              <Calendar className="h-5 w-5" />
              Schedule Week
            </CardTitle>
          </CardHeader>
          <CardContent>{/* <WeekSelector /> */}</CardContent>
        </Card>

        {/* Action Buttons */}
        <Card className="bg-gray-700 border-gray-600">
          <CardHeader className="pb-3">
            <CardTitle className="text-lg">Actions</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <GenerateScheduleButton
              guild={guild}
              streamerId={streamerId}
              mode="schedule"
            />
            <Button
              onClick={exportImage}
              variant="outline"
              className="w-full border-gray-500 hover:bg-gray-600"
            >
              <Download className="h-4 w-4 mr-2" />
              Export Current Image
            </Button>
          </CardContent>
        </Card>

        {/* Schedule Inputs */}
        {groupedInputs.length > 0 && (
          <Card className="bg-gray-700 border-gray-600">
            <CardHeader className="pb-3">
              <CardTitle className="text-lg">Schedule Data</CardTitle>
            </CardHeader>
            <CardContent>{/* <ScheduleInputs /> */}</CardContent>
          </Card>
        )}

        {/* Instructions */}
        {groupedInputs.length === 0 && (
          <Card className="bg-gray-700 border-gray-600">
            <CardContent className="pt-6">
              <p className="text-sm text-gray-400 text-center">
                Switch to Design Mode to create schedule polygons, then return
                here to fill in your schedule data.
              </p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
