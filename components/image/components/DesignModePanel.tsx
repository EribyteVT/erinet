// components/image/components/DesignModePanel.tsx - Fixed version
"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { useState, useEffect } from "react";
import { useDrawing } from "../hooks/useDrawing";
import { useCanvas } from "../hooks/useCanvas";
import { DataTypeSelector } from "./DataTypeSelector";
import { PolygonsList } from "./PolygonsList";
import { DrawingControls } from "./DrawingControls";
import { TemplateSave } from "./TemplateSave";
import { Group } from "fabric";

// Define the polygon interface for display purposes
interface PolygonDisplay {
  id: string;
  type: string;
  pointsCount: number;
  fabricObject: Group;
}

interface DesignModePanelProps {
  guildId?: string;
}

export function DesignModePanel({
  guildId = "1298744996199137290",
}: DesignModePanelProps) {
  const { canvas } = useCanvas();
  const [savedPolygons, setSavedPolygons] = useState<PolygonDisplay[]>([]);

  // Get polygons from canvas - lifted up from PolygonsList
  useEffect(() => {
    if (!canvas) return;

    const updatePolygonsList = () => {
      const polygons: PolygonDisplay[] = [];

      canvas.getObjects().forEach((obj) => {
        // Check if object has polygon metadata
        const polygonType = (obj as any).polygonType;
        const polygonId = (obj as any).polygonId;

        if (polygonType && polygonId && obj.type === "group") {
          const group = obj as Group;

          // Get the actual polygon from the group to count points
          const polygonObj = group
            .getObjects()
            .find((o) => o.type === "polygon");

          const pointsCount = polygonObj
            ? (polygonObj as any).points?.length || 0
            : 0;

          // Only add if we actually found polygon points
          if (pointsCount > 0) {
            polygons.push({
              id: polygonId,
              type: polygonType,
              pointsCount,
              fabricObject: group,
            });
          }
        }
      });

      setSavedPolygons(polygons);
      console.log(`📊 Updated polygon count: ${polygons.length}`); // Debug log
    };

    // Update list initially
    updatePolygonsList();

    // Listen for canvas changes
    const handleCanvasChange = () => {
      updatePolygonsList();
    };

    canvas.on("object:added", handleCanvasChange);
    canvas.on("object:removed", handleCanvasChange);
    canvas.on("object:modified", handleCanvasChange);

    return () => {
      canvas.off("object:added", handleCanvasChange);
      canvas.off("object:removed", handleCanvasChange);
      canvas.off("object:modified", handleCanvasChange);
    };
  }, [canvas]);

  return (
    <div className="w-100 bg-gray-800 border-r border-gray-700 overflow-y-auto">
      <div className="p-6 space-y-6">
        {/* Data Type Selection */}
        <DataTypeSelector />

        {/* Polygon Management */}
        <PolygonsList polygons={savedPolygons} />

        {/* Debug Info */}
        {process.env.NODE_ENV === "development" && (
          <Card className="bg-gray-700 border-gray-600">
            <CardHeader>
              <CardTitle className="text-white text-sm">Debug Info</CardTitle>
            </CardHeader>
            <CardContent className="text-xs text-gray-300">
              <div>Canvas Objects: {canvas?.getObjects().length || 0}</div>
              <div>Detected Polygons: {savedPolygons.length}</div>
              <div>Canvas Initialized: {canvas ? "Yes" : "No"}</div>
              {canvas && canvas.getObjects().length > 0 && (
                <div className="mt-2">
                  <div className="font-semibold">Object Types:</div>
                  {canvas.getObjects().map((obj, i) => (
                    <div key={i} className="ml-2">
                      {i}: {obj.type}
                      {obj.type === "group" && (
                        <span>
                          {" "}
                          (id: {(obj as any).polygonId || "none"}, type:{" "}
                          {(obj as any).polygonType || "none"})
                        </span>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        )}
      </div>

      {/* Template Save Section - Fixed with proper props */}
      <TemplateSave guildId={guildId} polygons={savedPolygons} />
    </div>
  );
}
