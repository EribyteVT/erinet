// components/image/components/ScheduleModePanel.tsx
"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useScheduleData } from "../hooks/useScheduleData";
import { ScheduleInputs } from "../hooks/ScheduleInputs";
import { QuickPresets } from "./QuickPresets";
import { useState } from "react";
import { Loader2, Save, Download, Trash2 } from "lucide-react";

export function ScheduleModePanel() {
  const { generateScheduleInputs } = useScheduleData();

  const [isGenerating, setIsGenerating] = useState(false);

  const handleGenerateImage = async () => {
    setIsGenerating(true);
    try {
      // Add your image generation logic here
      await new Promise((resolve) => setTimeout(resolve, 2000)); // Simulate generation
      alert("Schedule image generated!");
    } catch (error) {
      console.error("Error generating image:", error);
      alert("Error generating image. Please try again.");
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="w-80 bg-gray-800 border-r border-gray-700 overflow-y-auto">
      <div className="p-6 space-y-6">
        {/* Template Management */}
        <Card className="bg-gray-700 border-gray-600">
          <CardHeader className="pb-3">
            <CardTitle className="text-blue-400 text-sm font-semibold uppercase tracking-wide">
              Template Management
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label
                htmlFor="template-name"
                className="text-xs font-medium text-gray-300"
              >
                Template Name
              </Label>
              <Input
                id="template-name"
                value={currentTemplate}
                onChange={(e) => setCurrentTemplate(e.target.value)}
                placeholder="Enter template name..."
                className="bg-gray-600 border-gray-500 text-white placeholder-gray-400"
              />
            </div>

            <div className="grid grid-cols-1 gap-2">
              <Button
                onClick={handleSaveTemplate}
                disabled={isLoading}
                className="w-full bg-green-600 hover:bg-green-700 text-white"
              >
                {isLoading ? (
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                ) : (
                  <Save className="h-4 w-4 mr-2" />
                )}
                Save Template
              </Button>

              <Button
                onClick={handleLoadTemplate}
                disabled={isLoading}
                variant="outline"
                className="w-full bg-gray-600 hover:bg-gray-500 border-gray-500"
              >
                {isLoading ? (
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                ) : (
                  <Download className="h-4 w-4 mr-2" />
                )}
                Load Template
              </Button>

              <Button
                onClick={handleDeleteTemplate}
                disabled={isLoading}
                variant="destructive"
                className="w-full"
              >
                {isLoading ? (
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                ) : (
                  <Trash2 className="h-4 w-4 mr-2" />
                )}
                Delete Template
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Quick Presets */}
        <QuickPresets />

        {/* Schedule Inputs */}
        <Card className="bg-gray-700 border-gray-600">
          <CardHeader className="pb-3">
            <CardTitle className="text-green-400 text-sm font-semibold uppercase tracking-wide">
              Schedule Data
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ScheduleInputs />
          </CardContent>
        </Card>

        {/* Generate Actions */}
        <div className="space-y-3">
          <Button
            onClick={handleGenerateImage}
            disabled={isGenerating}
            className="w-full bg-green-500 text-black hover:bg-green-600"
          >
            {isGenerating ? (
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
            ) : (
              "📸"
            )}
            {isGenerating ? "Generating..." : "Generate Final Image"}
          </Button>

          <Button
            variant="outline"
            className="w-full"
            onClick={() => alert("Export functionality coming soon!")}
          >
            💾 Export This Week
          </Button>
        </div>

        {/* Template Status */}
        {isLoading && (
          <div className="text-xs text-gray-400 p-3 bg-gray-600/50 rounded border border-gray-600">
            <div className="flex items-center gap-2">
              <Loader2 className="h-3 w-3 animate-spin" />
              <span>Processing template operation...</span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
