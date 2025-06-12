// components/image/components/TemplateSave.tsx
"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useTemplateSave } from "../hooks/useTemplateSave";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  Loader2,
  Save,
  Upload,
  Check,
  AlertCircle,
  Trash2,
  Info,
} from "lucide-react";
import { Group } from "fabric";
import { TypedPolygon } from "../types";

interface PolygonDisplay {
  id: string;
  type: string;
  pointsCount: number;
  fabricObject: Group;
}

interface TemplateSaveProps {
  guildId: string;
  polygons: PolygonDisplay[];
}

export function TemplateSave({ guildId, polygons }: TemplateSaveProps) {
  const {
    saveTemplate,
    loadTemplate,
    deleteTemplate,
    getTemplateInfo,
    applyTemplateToCanvas,
    extractBackgroundImage,
    isSaving,
    isLoading,
    isDeleting,
  } = useTemplateSave();

  const [templateName, setTemplateName] = useState("");
  const [backgroundUrl, setBackgroundUrl] = useState("");
  const [message, setMessage] = useState<{
    type: "success" | "error" | "info";
    text: string;
  } | null>(null);
  const [templateInfo, setTemplateInfo] = useState<{
    exists: boolean;
    templateName?: string;
    lastUpdated?: Date;
  }>({ exists: false });

  // Convert PolygonDisplay to TypedPolygon for saving
  const convertPolygonsForSaving = (): TypedPolygon[] => {
    return polygons.map((polygon) => {
      const fabricObject = polygon.fabricObject;

      // Get the actual polygon from the group to extract points
      const polygonObj = fabricObject
        .getObjects()
        .find((o) => o.type === "polygon");

      const points = (polygonObj as any)?.points || [];

      return {
        id: polygon.id,
        points: points,
        type: polygon.type,
        left: fabricObject.left || 0,
        top: fabricObject.top || 0,
        // Include additional Fabric.js properties with fallbacks for null values
        fill: fabricObject.fill || "rgba(255, 0, 0, 0.3)",
        stroke: fabricObject.stroke || "#ff0000",
        strokeWidth: fabricObject.strokeWidth || 2,
        scaleX: fabricObject.scaleX || 1,
        scaleY: fabricObject.scaleY || 1,
        angle: fabricObject.angle || 0,
        opacity: fabricObject.opacity || 1,
      };
    });
  };

  // Load template info on component mount
  useEffect(() => {
    const loadTemplateInfo = async () => {
      const info = await getTemplateInfo(guildId);
      if (info.success) {
        setTemplateInfo({
          exists: info.exists,
          templateName: info.templateName,
          lastUpdated: info.lastUpdated,
        });

        // Pre-fill template name if it exists
        if (info.templateName) {
          setTemplateName(info.templateName);
        }
      }
    };

    loadTemplateInfo();
  }, [guildId, getTemplateInfo]);

  const handleSaveTemplate = async () => {
    if (!templateName.trim()) {
      setMessage({ type: "error", text: "Please enter a template name" });
      return;
    }

    // Check if there are polygons to save
    if (polygons.length === 0) {
      setMessage({
        type: "error",
        text: "No polygons found. Create some schedule areas first!",
      });
      return;
    }

    const templateData = {
      guildId,
      templateName: templateName.trim(),
      backgroundUrl: backgroundUrl.trim() || undefined,
    };

    // Use the converted polygons instead of extractPolygonData
    const polygonData = convertPolygonsForSaving();

    const result = await saveTemplate(templateData, polygonData);

    if (result.success) {
      setMessage({
        type: "success",
        text: `Template "${templateName}" saved successfully!`,
      });

      // Update template info
      setTemplateInfo({
        exists: true,
        templateName: templateName,
        lastUpdated: new Date(),
      });
    } else {
      setMessage({
        type: "error",
        text: result.error || "Failed to save template",
      });
    }

    // Clear message after 5 seconds
    setTimeout(() => setMessage(null), 5000);
  };

  // Add this debugging to your handleLoadTemplate function
  const handleLoadTemplate = async () => {
    console.log("🚀 Starting template load for guildId:", guildId);

    const result = await loadTemplate(guildId);
    console.log("📦 Load template result:", result);

    if (result.success && result.template) {
      console.log("📊 Template data structure:", {
        hasTemplateData: !!result.template.template_data,
        templateDataType: typeof result.template.template_data,
        templateDataKeys: result.template.template_data
          ? Object.keys(result.template.template_data)
          : [],
      });

      // Log the actual template data
      console.log("🔍 Raw template data:", result.template.template_data);

      const applied = await applyTemplateToCanvas(
        result.template.template_data
      );
      console.log("✅ Template application result:", applied);

      if (applied) {
        setMessage({
          type: "success",
          text: "Template loaded successfully!",
        });

        // Update form with loaded data
        if (result.template.template_name) {
          setTemplateName(result.template.template_name);
        }
        if (result.template.background_url) {
          setBackgroundUrl(result.template.background_url);
        }
      } else {
        setMessage({
          type: "error",
          text: "Failed to apply template to canvas",
        });
      }
    } else {
      console.error("❌ Template load failed:");
      setMessage({
        type: "error",
        text: "Failed to load template",
      });
    }

    // Clear message after 5 seconds
    setTimeout(() => setMessage(null), 5000);
  };

  const handleDeleteTemplate = async () => {
    if (
      !confirm(
        "Are you sure you want to delete this template? This action cannot be undone."
      )
    ) {
      return;
    }

    const result = await deleteTemplate(guildId);

    if (result.success) {
      setMessage({
        type: "success",
        text: "Template deleted successfully!",
      });

      // Reset form and template info
      setTemplateName("");
      setBackgroundUrl("");
      setTemplateInfo({ exists: false });
    } else {
      setMessage({
        type: "error",
        text: result.error || "Failed to delete template",
      });
    }

    // Clear message after 5 seconds
    setTimeout(() => setMessage(null), 5000);
  };

  return (
    <Card className="bg-gray-700 border-gray-600 m-6">
      <CardHeader className="pb-3">
        <CardTitle className="text-blue-400 text-sm font-semibold uppercase tracking-wide">
          Template Management
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Template Info Display */}
        {templateInfo.exists && (
          <Alert className="bg-blue-900/50 border-blue-700">
            <Info className="h-4 w-4" />
            <AlertDescription className="text-blue-100">
              Existing template: <strong>{templateInfo.templateName}</strong>
              {templateInfo.lastUpdated && (
                <div className="text-xs mt-1 text-blue-200">
                  Last updated: {templateInfo.lastUpdated.toLocaleString()}
                </div>
              )}
            </AlertDescription>
          </Alert>
        )}

        {/* Template Name Input */}
        <div className="space-y-2">
          <Label htmlFor="templateName" className="text-gray-200">
            Template Name
          </Label>
          <Input
            id="templateName"
            value={templateName}
            onChange={(e) => setTemplateName(e.target.value)}
            placeholder="Enter template name..."
            className="bg-gray-600 border-gray-500 text-white"
          />
        </div>

        {/* Background URL Input */}
        <div className="space-y-2">
          <Label htmlFor="backgroundUrl" className="text-gray-200">
            Background Image URL (optional)
          </Label>
          <Input
            id="backgroundUrl"
            value={backgroundUrl}
            onChange={(e) => setBackgroundUrl(e.target.value)}
            placeholder="https://example.com/image.jpg"
            className="bg-gray-600 border-gray-500 text-white"
          />
        </div>

        {/* Polygons Count Display */}
        <div className="text-sm text-gray-300">
          Current polygons:{" "}
          <span className="font-semibold">{polygons.length}</span>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col space-y-2">
          <Button
            onClick={handleSaveTemplate}
            disabled={isSaving || !templateName.trim()}
            className="w-full bg-green-600 hover:bg-green-700"
          >
            {isSaving ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : (
              <Save className="mr-2 h-4 w-4" />
            )}
            {templateInfo.exists ? "Update Template" : "Save Template"}
          </Button>

          <Button
            onClick={handleLoadTemplate}
            disabled={isLoading}
            variant="outline"
            className="w-full border-gray-500 text-gray-200 hover:bg-gray-600"
          >
            {isLoading ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : (
              <Upload className="mr-2 h-4 w-4" />
            )}
            Load Template
          </Button>

          {templateInfo.exists && (
            <Button
              onClick={handleDeleteTemplate}
              disabled={isDeleting}
              variant="destructive"
              className="w-full"
            >
              {isDeleting ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                <Trash2 className="mr-2 h-4 w-4" />
              )}
              Delete Template
            </Button>
          )}
        </div>

        {/* Status Messages */}
        {message && (
          <Alert
            className={`${
              message.type === "success"
                ? "bg-green-900/50 border-green-700"
                : message.type === "error"
                ? "bg-red-900/50 border-red-700"
                : "bg-blue-900/50 border-blue-700"
            }`}
          >
            {message.type === "success" ? (
              <Check className="h-4 w-4" />
            ) : (
              <AlertCircle className="h-4 w-4" />
            )}
            <AlertDescription
              className={`${
                message.type === "success"
                  ? "text-green-100"
                  : message.type === "error"
                  ? "text-red-100"
                  : "text-blue-100"
              }`}
            >
              {message.text}
            </AlertDescription>
          </Alert>
        )}
      </CardContent>
    </Card>
  );
}
