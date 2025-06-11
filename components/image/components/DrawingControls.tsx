"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useDrawing } from "../hooks/useDrawing";

export function DrawingControls() {
  const {
    isDrawingMode,
    toggleDrawingMode,
    drawingPoints,
    finishPolygon,
    cancelPolygon,
    currentDataType,
  } = useDrawing();

  return (
    <>
      <Button
        onClick={toggleDrawingMode}
        className={`w-full ${
          isDrawingMode
            ? "bg-red-500 hover:bg-red-600"
            : "bg-green-500 hover:bg-green-600 text-black"
        }`}
      >
        {isDrawingMode ? "Exit Drawing Mode" : "Draw Field"}
      </Button>

      {isDrawingMode && (
        <div className="bg-gray-600 border-2 border-green-500 rounded-lg p-4 text-center">
          <p className="text-green-400 font-semibold mb-2">
            Drawing Mode Active
          </p>
          <p className="text-sm text-gray-300 mb-3">
            Click on canvas to add points for your{" "}
            <span className="text-green-400">{currentDataType}</span> polygon
          </p>
          <div className="flex gap-2">
            <Button
              onClick={finishPolygon}
              disabled={drawingPoints.length < 3}
              className="flex-1 bg-green-500 text-black text-sm"
            >
              Finish ({drawingPoints.length})
            </Button>
            <Button
              onClick={cancelPolygon}
              variant="destructive"
              className="flex-1 text-sm"
            >
              Cancel
            </Button>
          </div>
        </div>
      )}
    </>
  );
}
