"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { useDrawing } from "../hooks/useDrawing";
import { useTemplate } from "../hooks/useTemplate";
import { DataTypeSelector } from "./DataTypeSelector";
import { PolygonsList } from "./PolygonsList";
import { DrawingControls } from "./DrawingControls";

export function DesignModePanel() {
  const { currentTemplate, saveTemplate } = useTemplate();

  return (
    <div className="w-100 bg-gray-800 border-r border-gray-700 overflow-y-auto">
      <div className="p-6 space-y-6">
        
        {/* Data Type Selection */}
        <DataTypeSelector />

        

        {/* Polygon Management */}
        <PolygonsList />
      </div>
    </div>
  );
}