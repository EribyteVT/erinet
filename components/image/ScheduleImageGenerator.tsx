// components/image/ScheduleImageGenerator.tsx
"use client";

import { useState, useEffect } from "react";
import { CanvasProvider } from "./hooks/useCanvas";
import { ScheduleDataProvider } from "./hooks/useScheduleData";
import { DrawingProvider } from "./hooks/useDrawing";
import { TopBar } from "./components/TopBar";
import { DesignModePanel } from "./components/DesignModePanel";
import { CanvasArea } from "./components/CanvasArea";

export type AppMode = "design" | "schedule";

interface ScheduleImageGeneratorProps {
  guildId?: string;
  defaultMode?: AppMode;
}

// Inner component that has access to template context
function ScheduleImageGeneratorInner({
  guildId,
  defaultMode = "design",
}: ScheduleImageGeneratorProps) {
  const [mode, setMode] = useState<AppMode>(defaultMode);

  return (
    <div className="w-full h-screen flex flex-col bg-gray-900 text-white">
      <TopBar mode={mode} onModeChange={setMode} />
      <div className="flex flex-1 overflow-hidden">
        {mode === "design" ? <DesignModePanel /> : <></>}
        <CanvasArea mode={mode} />
      </div>
    </div>
  );
}

export default function ScheduleImageGenerator({
  guildId,
  defaultMode,
}: ScheduleImageGeneratorProps) {
  return (
    <CanvasProvider>
      <ScheduleDataProvider>
        <DrawingProvider>
          <ScheduleImageGeneratorInner
            guildId={guildId}
            defaultMode={defaultMode}
          />
        </DrawingProvider>
      </ScheduleDataProvider>
    </CanvasProvider>
  );
}
