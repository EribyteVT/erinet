"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { useState } from "react";
import { useScheduleData } from "../hooks/useScheduleData";

export function QuickPresets() {
  const { loadPreset, clearAllScheduleData, groupInputsByOffset } = useScheduleData();
  const [selectedDay, setSelectedDay] = useState<string>("all");

  const groupedInputs = groupInputsByOffset();

  const dayOptions = [
    { value: "all", label: "All Days" },
    ...groupedInputs.map(day => ({
      value: day.offset.toString(),
      label: `Day ${day.offset}: ${day.dayName}`
    }))
  ];

  const handleLoadPreset = (presetType: string) => {
    // For now, apply to all days since the loadPreset function handles all days
    // In the future, you could modify loadPreset to accept a specific day parameter
    loadPreset(presetType);
  };

  return (
    <Card className="bg-gray-700 border-gray-600">
      <CardHeader className="pb-3">
        <CardTitle className="text-green-400 text-sm font-semibold uppercase tracking-wide">
          Quick Presets
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        
        {/* Day Selection (for future enhancement) */}
        <div className="space-y-2">
          <Label className="text-xs font-medium text-gray-300">Apply To</Label>
          <Select value={selectedDay} onValueChange={setSelectedDay}>
            <SelectTrigger className="bg-gray-600 border-gray-500 text-white text-sm">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {dayOptions.map(option => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Preset Buttons */}
        <div className="space-y-2">
          <Label className="text-xs font-medium text-gray-300">Stream Templates</Label>
          <div className="grid grid-cols-1 gap-2">
            <Button
              onClick={() => handleLoadPreset('gaming')}
              variant="outline"
              className="text-sm justify-start bg-gray-600 hover:bg-gray-500 border-gray-500"
            >
              🎮 Gaming Stream
            </Button>
            <Button
              onClick={() => handleLoadPreset('art')}
              variant="outline"
              className="text-sm justify-start bg-gray-600 hover:bg-gray-500 border-gray-500"
            >
              🎨 Art Stream
            </Button>
            <Button
              onClick={() => handleLoadPreset('variety')}
              variant="outline"
              className="text-sm justify-start bg-gray-600 hover:bg-gray-500 border-gray-500"
            >
              🎭 Variety Stream
            </Button>
          </div>
        </div>

        {/* Additional Preset Options */}
        <div className="space-y-2">
          <Label className="text-xs font-medium text-gray-300">Weekly Templates</Label>
          <div className="grid grid-cols-1 gap-2">
            <Button
              onClick={() => {
                // Apply gaming preset to weekdays, variety to weekends
                // This is a more advanced preset that could be implemented
                alert('Weekly template feature coming soon!');
              }}
              variant="outline"
              className="text-sm justify-start bg-gray-600 hover:bg-gray-500 border-gray-500"
              disabled
            >
              📅 Weekday Gaming + Weekend Variety
            </Button>
            <Button
              onClick={() => {
                alert('Custom weekly template feature coming soon!');
              }}
              variant="outline"
              className="text-sm justify-start bg-gray-600 hover:bg-gray-500 border-gray-500"
              disabled
            >
              ⚙️ Custom Weekly Template
            </Button>
          </div>
        </div>
        
        {/* Clear Button */}
        <div className="pt-2 border-t border-gray-600">
          <Button
            onClick={clearAllScheduleData}
            variant="destructive"
            className="w-full text-sm"
          >
            🗑️ Clear All Data
          </Button>
        </div>

        {/* Info */}
        {groupedInputs.length === 0 && (
          <div className="text-xs text-gray-400 p-3 bg-gray-600/50 rounded border border-gray-600">
            <p className="font-medium mb-1">💡 Tip:</p>
            <p>Create schedule polygons in Design Mode first, then use these presets to quickly fill in common stream data.</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}