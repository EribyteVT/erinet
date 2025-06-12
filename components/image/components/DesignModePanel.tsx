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

export function DesignModePanel() {
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

          polygons.push({
            id: polygonId,
            type: polygonType,
            pointsCount,
            fabricObject: group,
          });
        }
      });

      setSavedPolygons(polygons);
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
      </div>
      <TemplateSave guildId="54326" polygons={savedPolygons} />
    </div>
  );
}
