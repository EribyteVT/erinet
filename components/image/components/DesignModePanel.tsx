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
    <div className="w-80 bg-gray-800 border-r border-gray-700 overflow-y-auto">
      <div className="p-6 space-y-6">
        {/* Template Management */}
        <Card className="bg-gray-700 border-gray-600">
          <CardHeader className="pb-3">
            <CardTitle className="text-green-400 text-sm font-semibold uppercase tracking-wide">
              Template Management
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <Input
              value={currentTemplate}
              onChange={(e) => {/* Handle template name change */}}
              placeholder="Template name..."
              className="bg-gray-600 border-gray-500"
            />
            <div className="flex gap-2">
              <Button onClick={saveTemplate} className="flex-1 bg-green-500 text-black text-xs">
                💾 Save
              </Button>
              <Button variant="outline" className="flex-1 text-xs">
                📁 Load
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Data Type Selection */}
        <DataTypeSelector />

        {/* Drawing Controls */}
        <DrawingControls />

        {/* Polygon Management */}
        <PolygonsList />
      </div>
    </div>
  );
}