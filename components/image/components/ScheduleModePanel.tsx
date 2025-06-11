"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useScheduleData } from "../hooks/useScheduleData";
import { ScheduleInputs } from "../hooks/ScheduleInputs";
import { QuickPresets } from "./QuickPresets";


export function ScheduleModePanel() {
  const { generateScheduleInputs } = useScheduleData();

  return (
    <div className="w-80 bg-gray-800 border-r border-gray-700 overflow-y-auto">
      <div className="p-6 space-y-6">
        {/* Quick Presets */}
        <QuickPresets />

        {/* Schedule Inputs */}
        <Card className="bg-gray-700 border-gray-600">
          <CardHeader className="pb-3">
            <CardTitle className="text-green-400 text-sm font-semibold uppercase tracking-wide">
              Schedule Data
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ScheduleInputs />
          </CardContent>
        </Card>

        {/* Generate Actions */}
        <div className="space-y-3">
          <Button
            onClick={() => alert('Schedule image generated!')}
            className="w-full bg-green-500 text-black hover:bg-green-600"
          >
            📸 Generate Final Image
          </Button>
          <Button
            variant="outline"
            className="w-full"
          >
            💾 Save This Week
          </Button>
        </div>
      </div>
    </div>
  );
}
