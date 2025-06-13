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
import {
  MinimalPolygon,
  ScheduleDayGroup,
  OptimizedTemplateData,
  DEFAULT_POLYGON_STYLES,
  OFFSET_STREAM_TYPES,
} from "../types";

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
    applyOptimizedTemplateToCanvas,
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

  // Helper function to round coordinates to integers
  const roundPoint = (point: { x: number; y: number }) => ({
    x: Math.round(point.x),
    y: Math.round(point.y),
  });

  // Helper function to check if styles differ from defaults
  const hasCustomStyles = (fabricObject: Group): boolean => {
    const polygonObj = fabricObject
      .getObjects()
      .find((o) => o.type === "polygon");
    if (!polygonObj) return false;

    return (
      polygonObj.fill !== DEFAULT_POLYGON_STYLES.fill ||
      polygonObj.stroke !== DEFAULT_POLYGON_STYLES.stroke ||
      fabricObject.strokeWidth !== DEFAULT_POLYGON_STYLES.strokeWidth ||
      fabricObject.scaleX !== DEFAULT_POLYGON_STYLES.scaleX ||
      fabricObject.scaleY !== DEFAULT_POLYGON_STYLES.scaleY ||
      fabricObject.angle !== DEFAULT_POLYGON_STYLES.angle ||
      fabricObject.opacity !== DEFAULT_POLYGON_STYLES.opacity
    );
  };

  // Convert polygons to optimized format
  const convertPolygonsToOptimized = (): OptimizedTemplateData => {
    const scheduleDays: ScheduleDayGroup[] = [];
    const singularPolygons: MinimalPolygon[] = [];
    const styleOverrides: Record<
      string,
      Partial<typeof DEFAULT_POLYGON_STYLES>
    > = {};

    // Group polygons by day for schedule types
    const dayGroups: Record<number, ScheduleDayGroup> = {};

    polygons.forEach((polygon) => {
      const fabricObject = polygon.fabricObject;
      const polygonObj = fabricObject
        .getObjects()
        .find((o) => o.type === "polygon");
      if (!polygonObj) return;

      const points = ((polygonObj as any)?.points || []).map(roundPoint);
      const basePosition = {
        x: Math.round(fabricObject.left || 0),
        y: Math.round(fabricObject.top || 0),
      };

      // Check if this is a schedule type
      const dayMatch = polygon.type.match(/^day(\d)_(.+)$/);
      if (dayMatch) {
        const dayIndex = parseInt(dayMatch[1]);
        const fieldType = dayMatch[2] as keyof ScheduleDayGroup["polygons"];

        // Initialize day group if needed
        if (!dayGroups[dayIndex]) {
          dayGroups[dayIndex] = {
            dayIndex,
            baseX: basePosition.x,
            baseY: basePosition.y,
            polygons: {},
          };
        }

        // Store as offset from day's base position
        const dayGroup = dayGroups[dayIndex];
        dayGroup.polygons[fieldType] = {
          id: polygon.id,
          type: polygon.type,
          points,
          offsetX: basePosition.x - dayGroup.baseX,
          offsetY: basePosition.y - dayGroup.baseY,
        };

        // Update base position if this polygon is further left/up
        dayGroup.baseX = Math.min(dayGroup.baseX, basePosition.x);
        dayGroup.baseY = Math.min(dayGroup.baseY, basePosition.y);
      } else {
        // Singular polygon
        singularPolygons.push({
          id: polygon.id,
          type: polygon.type,
          points,
        });
      }

      // Check for custom styles
      if (hasCustomStyles(fabricObject)) {
        const customStyles: Partial<typeof DEFAULT_POLYGON_STYLES> = {};

        styleOverrides[polygon.id] = customStyles;
      }
    });

    // Convert day groups to array
    Object.values(dayGroups).forEach((group) => {
      scheduleDays.push(group);
    });

    // Sort schedule days by index
    scheduleDays.sort((a, b) => a.dayIndex - b.dayIndex);

    const canvas = (window as any).fabricCanvas;

    return {
      version: "2.0",
      canvas: {
        width: canvas?.width || 1280,
        height: canvas?.height || 720,
      },
      backgroundUrl: backgroundUrl.trim() || undefined,
      scheduleDays: scheduleDays.length > 0 ? scheduleDays : undefined,
      singularPolygons:
        singularPolygons.length > 0 ? singularPolygons : undefined,
      styleOverrides:
        Object.keys(styleOverrides).length > 0 ? styleOverrides : undefined,
    };
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

    // Use optimized format
    const optimizedData = convertPolygonsToOptimized();

    const result = await saveTemplate(templateData, optimizedData);

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

      // Log size savings
      console.log("💾 Template saved with optimized format v2.0");
      console.log(`📊 Polygons: ${polygons.length} total`);
      if (optimizedData.scheduleDays) {
        console.log(`📅 Schedule days: ${optimizedData.scheduleDays.length}`);
      }
      if (optimizedData.styleOverrides) {
        console.log(
          `🎨 Custom styles: ${
            Object.keys(optimizedData.styleOverrides).length
          }`
        );
      }
    } else {
      setMessage({
        type: "error",
        text: result.error || "Failed to save template",
      });
    }

    // Clear message after 5 seconds
    setTimeout(() => setMessage(null), 5000);
  };

  const handleLoadTemplate = async () => {
    console.log("🚀 Starting template load for guildId:", guildId);

    const result = await loadTemplate(guildId);
    console.log("📦 Load template result:", result);

    if (result.success && result.template) {
      const templateData = result.template.template_data;

      // Check template version
      const version = templateData.version || "1.0";
      console.log(`📌 Template version: ${version}`);

      let applied = false;

      if (version === "2.0") {
        // Use optimized loader
        applied = await applyOptimizedTemplateToCanvas(templateData);
      } else {
        // Use legacy loader for backward compatibility
        console.log("⚠️ Loading legacy template format");
        // You would keep the old applyTemplateToCanvas method for v1.0 templates
        // applied = await applyTemplateToCanvas(templateData);
      }

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
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Saving...
              </>
            ) : (
              <>
                <Save className="mr-2 h-4 w-4" />
                Save Template
              </>
            )}
          </Button>

          {templateInfo.exists && (
            <>
              <Button
                onClick={handleLoadTemplate}
                disabled={isLoading}
                className="w-full bg-blue-600 hover:bg-blue-700"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Loading...
                  </>
                ) : (
                  <>
                    <Upload className="mr-2 h-4 w-4" />
                    Load Template
                  </>
                )}
              </Button>

              <Button
                onClick={handleDeleteTemplate}
                disabled={isDeleting}
                variant="destructive"
                className="w-full"
              >
                {isDeleting ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Deleting...
                  </>
                ) : (
                  <>
                    <Trash2 className="mr-2 h-4 w-4" />
                    Delete Template
                  </>
                )}
              </Button>
            </>
          )}
        </div>

        {/* Status Messages */}
        {message && (
          <Alert
            className={
              message.type === "success"
                ? "bg-green-900/50 border-green-700"
                : message.type === "error"
                ? "bg-red-900/50 border-red-700"
                : "bg-blue-900/50 border-blue-700"
            }
          >
            {message.type === "success" ? (
              <Check className="h-4 w-4" />
            ) : message.type === "error" ? (
              <AlertCircle className="h-4 w-4" />
            ) : (
              <Info className="h-4 w-4" />
            )}
            <AlertDescription
              className={
                message.type === "success"
                  ? "text-green-100"
                  : message.type === "error"
                  ? "text-red-100"
                  : "text-blue-100"
              }
            >
              {message.text}
            </AlertDescription>
          </Alert>
        )}
      </CardContent>
    </Card>
  );
}
