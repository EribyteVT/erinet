"use client";

import { useState } from "react";
import { CanvasProvider } from "./hooks/useCanvas";
import { TemplateProvider } from "./hooks/useTemplate";
import { ScheduleDataProvider } from "./hooks/useScheduleData";
import { DrawingProvider } from "./hooks/useDrawing";
import { TopBar } from "./components/TopBar";
import { DesignModePanel } from "./components/DesignModePanel";
import { ScheduleModePanel } from "./components/ScheduleModePanel";
import { CanvasArea } from "./components/CanvasArea";

export type AppMode = 'design' | 'schedule';

export default function ScheduleImageGenerator() {
  const [mode, setMode] = useState<AppMode>('design');

  return (
    <CanvasProvider>
      <TemplateProvider>
        <ScheduleDataProvider>
          <DrawingProvider>
            <div className="w-full h-screen flex flex-col bg-gray-900 text-white">
              <TopBar mode={mode} onModeChange={setMode} />
              
              <div className="flex flex-1 overflow-hidden">
                {mode === 'design' ? (
                  <DesignModePanel />
                ) : (
                  <ScheduleModePanel />
                )}
                <CanvasArea mode={mode} />
              </div>
            </div>
          </DrawingProvider>
        </ScheduleDataProvider>
      </TemplateProvider>
    </CanvasProvider>
  );
}