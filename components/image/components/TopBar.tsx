"use client";

import { Button } from "@/components/ui/button";
import { useCanvas } from "../hooks/useCanvas";
import { AppMode } from "../ScheduleImageGenerator";

interface TopBarProps {
  mode: AppMode;
  onModeChange: (mode: AppMode) => void;
}

export function TopBar({ mode, onModeChange }: TopBarProps) {
  const { exportImage } = useCanvas();

  const switchMode = (newMode: AppMode) => {
    onModeChange(newMode);
  };

  return (
    <div className="h-16 bg-gray-800 flex items-center justify-between px-6 border-b border-gray-700">
      <div className="flex gap-2">
        <Button
          onClick={() => switchMode('design')}
          variant={mode === 'design' ? 'default' : 'outline'}
          className={mode === 'design' ? 'bg-green-500 text-black' : ''}
        >
          🎨 Design Template
        </Button>
        <Button
          onClick={() => switchMode('schedule')}
          variant={mode === 'schedule' ? 'default' : 'outline'}
          className={mode === 'schedule' ? 'bg-green-500 text-black' : ''}
        >
          📅 Weekly Schedule
        </Button>
      </div>
      
      <div className="flex gap-3">
        <Button variant="outline" onClick={() => {}}>
          Import Background
        </Button>
        <Button onClick={exportImage} className="bg-green-500 text-black hover:bg-green-600">
          Export PNG
        </Button>
      </div>
    </div>
  );
}