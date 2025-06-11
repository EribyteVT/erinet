"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useScheduleData } from "../hooks/useScheduleData";

export function QuickPresets() {
  const { loadPreset, clearAllScheduleData } = useScheduleData();

  return (
    <Card className="bg-gray-700 border-gray-600">
      <CardHeader className="pb-3">
        <CardTitle className="text-green-400 text-sm font-semibold uppercase tracking-wide">
          Quick Presets
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="grid grid-cols-1 gap-2">
          <Button
            onClick={() => loadPreset('gaming')}
            variant="outline"
            className="text-sm justify-start"
          >
            🎮 Gaming Stream
          </Button>
          <Button
            onClick={() => loadPreset('art')}
            variant="outline"
            className="text-sm justify-start"
          >
            🎨 Art Stream
          </Button>
          <Button
            onClick={() => loadPreset('variety')}
            variant="outline"
            className="text-sm justify-start"
          >
            🎭 Variety Stream
          </Button>
        </div>
        
        <Button
          onClick={clearAllScheduleData}
          variant="destructive"
          className="w-full text-sm"
        >
          🗑️ Clear All
        </Button>
      </CardContent>
    </Card>
  );
}