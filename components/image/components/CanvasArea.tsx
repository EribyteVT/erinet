"use client";

import React, { useRef } from "react";
import { useCanvas } from "../hooks/useCanvas";
import { useDrawing } from "../hooks/useDrawing";
import { AppMode } from "../ScheduleImageGenerator";

interface CanvasAreaProps {
  mode: AppMode;
}

export function CanvasArea({ mode }: CanvasAreaProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const { initializeCanvas } = useCanvas();
  const { isDrawingMode } = useDrawing();

  // Initialize canvas when ref is available
  React.useEffect(() => {
    if (canvasRef.current) {
      initializeCanvas(canvasRef.current);
    }
  }, [initializeCanvas]);

  return (
    <div className="flex-1 bg-gray-900 flex items-center justify-center p-6">
      <div className="relative">
        <canvas
          ref={canvasRef}
          className={`rounded-lg border-2 ${
            isDrawingMode 
              ? 'border-green-500 cursor-crosshair' 
              : 'border-gray-600'
          }`}
        />
        
        {isDrawingMode && (
          <div className="absolute -top-12 left-1/2 transform -translate-x-1/2 bg-green-500 text-black px-3 py-1 rounded text-sm font-medium">
            Click to add points
          </div>
        )}
      </div>
    </div>
  );
}