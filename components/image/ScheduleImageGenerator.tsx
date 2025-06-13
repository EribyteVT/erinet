// components/image/ScheduleImageGenerator.tsx - Fixed version
"use client";

import { useState } from "react";
import { CanvasProvider } from "./hooks/useCanvas";
import { ScheduleDataProvider } from "./hooks/useScheduleData";
import { DrawingProvider } from "./hooks/useDrawing";
import { TopBar } from "./components/TopBar";
import { DesignModePanel } from "./components/DesignModePanel";
import { ScheduleModePanel } from "./components/ScheduleModePanel";
import { CanvasArea } from "./components/CanvasArea";

export type AppMode = "design" | "schedule";

interface ScheduleImageGeneratorProps {
  guildId: string;
  streamerId: number;
  defaultMode?: AppMode;
}

// Inner component that has access to template context
function ScheduleImageGeneratorInner({
  guildId,
  streamerId,
  defaultMode = "design",
}: ScheduleImageGeneratorProps) {
  const [mode, setMode] = useState<AppMode>(defaultMode);

  return (
    <div className="w-full h-screen flex flex-col bg-gray-900 text-white">
      <TopBar mode={mode} onModeChange={setMode} />
      <div className="flex flex-1 overflow-hidden">
        {mode === "design" ? (
          <DesignModePanel guildId={guildId} />
        ) : (
          <ScheduleModePanel guild={guildId} streamerId={streamerId} />
        )}
        <CanvasArea mode={mode} />
      </div>
    </div>
  );
}

export default function ScheduleImageGenerator({
  guildId,
  streamerId,
  defaultMode,
}: ScheduleImageGeneratorProps) {
  return (
    <CanvasProvider>
      <ScheduleDataProvider>
        <DrawingProvider>
          <ScheduleImageGeneratorInner
            guildId={guildId}
            streamerId={streamerId}
            defaultMode={defaultMode}
          />
        </DrawingProvider>
      </ScheduleDataProvider>
    </CanvasProvider>
  );
}
