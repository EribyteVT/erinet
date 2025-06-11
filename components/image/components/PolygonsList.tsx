"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Trash2 } from "lucide-react";
import { useTemplate } from "../hooks/useTemplate";
import { useDrawing } from "../hooks/useDrawing";

export function PolygonsList() {
  const { savedPolygons } = useTemplate();
  const { selectedPolygon, deleteSelected } = useDrawing();

  return (
    <Card className="bg-gray-700 border-gray-600">
      <CardHeader className="pb-3">
        <CardTitle className="text-green-400 text-sm font-semibold uppercase tracking-wide">
          Template Polygons
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="max-h-64 overflow-y-auto space-y-2">
          {savedPolygons.length === 0 ? (
            <p className="text-gray-400 text-sm text-center py-4">No polygons yet</p>
          ) : (
            savedPolygons.map((polygon) => (
              <div
                key={polygon.id}
                className={`flex justify-between items-center p-3 bg-gray-600 rounded cursor-pointer transition-colors ${
                  selectedPolygon && (selectedPolygon as any).polygonId === polygon.id
                    ? 'bg-green-600'
                    : 'hover:bg-gray-500'
                }`}
              >
                <div>
                  <p className="text-sm font-medium">{polygon.type}</p>
                  <p className="text-xs text-gray-300">
                    {polygon.points.length} points
                  </p>
                </div>
                <Button
                  onClick={(e) => {
                    e.stopPropagation();
                    deleteSelected();
                  }}
                  variant="destructive"
                  size="sm"
                  className="h-8 w-8 p-0"
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            ))
          )}
        </div>
      </CardContent>
    </Card>
  );
}
