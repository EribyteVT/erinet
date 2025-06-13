// components/image/hooks/useTemplateSave.tsx - Fixed version
"use client";

import { useCallback, useState } from "react";
import * as fabric from "fabric";
import {
  saveTemplateAction,
  loadTemplateAction,
  deleteTemplate,
  getTemplateInfoAction,
  getBackgroundImageAction,
} from "@/app/actions/template-actions";

// Types
interface SaveTemplateData {
  guildId: string;
  templateName: string;
}

interface OptimizedTemplateData {
  version: "2.0";
  canvas: {
    width: number;
    height: number;
  };
  scheduleDays?: any[];
  singularPolygons?: any[];
  styleOverrides?: any;
}

interface SaveTemplateResult {
  success: boolean;
  message?: string;
  error?: string;
  template?: any;
}

interface LoadTemplateResult {
  success: boolean;
  template?: any;
  error?: string;
}

export function useTemplateSave(canvas?: fabric.Canvas) {
  const [isSaving, setIsSaving] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  // Extract polygons from canvas - FIXED VERSION
  const extractPolygons = useCallback((): any[] => {
    if (!canvas) return [];

    const polygons: any[] = [];

    canvas.getObjects().forEach((obj) => {
      if (obj.type === "group") {
        const group = obj as fabric.Group;
        const polygonObj = group.getObjects().find((o) => o.type === "polygon");

        if (polygonObj && polygonObj.type === "polygon") {
          const polygonId = (group as any).polygonId || `polygon_${Date.now()}`;
          const polygonType = (group as any).polygonType || "default";

          // ✅ PROPERLY extract points from the polygon and round to integers
          const points = (polygonObj as any).points
            ? (polygonObj as any).points.map((p: any) => ({
                x: Math.round(p.x),
                y: Math.round(p.y),
              }))
            : [];

          // ✅ Only save if we have actual points
          if (points.length > 0) {
            polygons.push({
              id: polygonId,
              points: points,
              type: polygonType,
              left: Math.round(group.left || 0),
              top: Math.round(group.top || 0),
              fill: polygonObj.fill || "rgba(255, 0, 0, 0.3)",
              stroke: polygonObj.stroke || "#ff0000",
              strokeWidth: Math.round(polygonObj.strokeWidth || 2),
              scaleX: group.scaleX || 1,
              scaleY: group.scaleY || 1,
              angle: Math.round(group.angle || 0),
              opacity: group.opacity || 1,
            });
          }
        }
      }
    });

    console.log(
      `📊 Extracted ${polygons.length} polygons for saving:`,
      polygons
    );
    return polygons;
  }, [canvas]);

  // Get current polygons
  const polygons = extractPolygons();

  // Save template with optimized data
  const saveTemplate = useCallback(
    async (
      data: SaveTemplateData,
      templateData: OptimizedTemplateData
    ): Promise<SaveTemplateResult> => {
      if (!canvas) {
        return { success: false, error: "Canvas not initialized" };
      }

      setIsSaving(true);

      try {
        // ✅ Use the properly extracted polygons instead of the passed templateData
        const actualPolygons = extractPolygons();

        const payload = {
          guildId: data.guildId,
          templateName: data.templateName,
          templateData: {
            ...templateData,
            singularPolygons: actualPolygons, // Use the real extracted data
          },
        };

        console.log("💾 Saving template with data:", payload);
        const result = await saveTemplateAction(payload);
        return result;
      } catch (error) {
        console.error("Error saving template:", error);
        return {
          success: false,
          error:
            error instanceof Error ? error.message : "Unknown error occurred",
        };
      } finally {
        setIsSaving(false);
      }
    },
    [canvas, extractPolygons]
  );

  // Load template
  const loadTemplate = useCallback(
    async (guildId: string): Promise<LoadTemplateResult> => {
      setIsLoading(true);

      try {
        const result = await loadTemplateAction({ guildId });

        if (result.success && canvas) {
          console.log("🔄 Loading template:", result.template);

          // Apply template to canvas
          await applyOptimizedTemplateToCanvas(result.template.template_data);

          // Load background image if available
          if (result.template.backgroundImage) {
            try {
              const img = await fabric.FabricImage.fromURL(
                result.template.backgroundImage
              );
              canvas.backgroundImage = img;
              canvas.renderAll();
            } catch (imgError) {
              console.warn("Could not load background image:", imgError);
            }
          }
        }

        return result;
      } catch (error) {
        console.error("Error loading template:", error);
        return {
          success: false,
          error:
            error instanceof Error ? error.message : "Unknown error occurred",
        };
      } finally {
        setIsLoading(false);
      }
    },
    [canvas]
  );

  // Delete template
  const deleteTemplate = useCallback(async (guildId: string) => {
    setIsDeleting(true);

    try {
      const result = await deleteTemplateAction({ guildId });
      return result;
    } catch (error) {
      console.error("Error deleting template:", error);
      return {
        success: false,
        error:
          error instanceof Error ? error.message : "Unknown error occurred",
      };
    } finally {
      setIsDeleting(false);
    }
  }, []);

  // Get template info
  const getTemplateInfo = useCallback(async (guildId: string) => {
    try {
      const result = await getTemplateInfoAction({ guildId });
      return result;
    } catch (error) {
      console.error("Error getting template info:", error);
      return {
        success: false,
        exists: false,
        error:
          error instanceof Error ? error.message : "Unknown error occurred",
      };
    }
  }, []);

  // Get background image info
  const getBackgroundImage = useCallback(async (guildId: string) => {
    try {
      const result = await getBackgroundImageAction(guildId);
      return result;
    } catch (error) {
      console.error("Error getting background image:", error);
      return {
        success: false,
        error:
          error instanceof Error ? error.message : "Unknown error occurred",
      };
    }
  }, []);

  // Apply optimized template to canvas - FIXED VERSION
  const applyOptimizedTemplateToCanvas = useCallback(
    async (templateData: OptimizedTemplateData): Promise<boolean> => {
      if (!canvas || !templateData) {
        console.error("❌ Canvas not initialized or no template data");
        return false;
      }

      try {
        console.log(
          "🎨 Applying optimized template v2.0 to canvas...",
          templateData
        );

        // Clear existing objects (but keep background if any)
        const backgroundImg = canvas.backgroundImage;
        canvas.clear();
        if (backgroundImg) {
          canvas.backgroundImage = backgroundImg;
        }

        // Set canvas dimensions
        if (templateData.canvas) {
          canvas.setDimensions({
            width: templateData.canvas.width,
            height: templateData.canvas.height,
          });
        }

        // ✅ FIXED: Helper function to create polygon from saved data
        const createPolygonFromSavedData = async (
          polygonData: any,
          baseX: number = 0,
          baseY: number = 0
        ) => {
          console.log("🔧 Creating polygon from data:", polygonData);

          if (!polygonData.points || polygonData.points.length === 0) {
            console.warn("⚠️ No points found for polygon:", polygonData.id);
            return null;
          }

          const points = polygonData.points;
          const x = baseX + (polygonData.left || 0);
          const y = baseY + (polygonData.top || 0);

          // Create polygon with saved properties
          const polygon = new fabric.Polygon(points, {
            left: x,
            top: y,
            fill: polygonData.fill || "rgba(255, 0, 0, 0.3)",
            stroke: polygonData.stroke || "#ff0000",
            strokeWidth: polygonData.strokeWidth || 2,
            scaleX: polygonData.scaleX || 1,
            scaleY: polygonData.scaleY || 1,
            angle: polygonData.angle || 0,
            opacity: polygonData.opacity || 1,
            selectable: true,
            evented: true,
          });

          // Create text label
          const text = new fabric.Text(polygonData.id, {
            left: x,
            top: y - 20,
            fontSize: 12,
            fill: "#000",
            selectable: false,
            evented: false,
          });

          // Group polygon and text
          const group = new fabric.Group([polygon, text], {
            left: x,
            top: y,
            selectable: true,
            evented: true,
          });

          // ✅ Restore metadata
          (group as any).polygonId = polygonData.id;
          (group as any).polygonType = polygonData.type || "default";

          console.log(
            "✅ Created polygon group:",
            polygonData.id,
            polygonData.type
          );
          return group;
        };

        // Process singular polygons
        if (
          templateData.singularPolygons &&
          templateData.singularPolygons.length > 0
        ) {
          console.log(
            `📐 Processing ${templateData.singularPolygons.length} singular polygons`
          );

          for (const polygonData of templateData.singularPolygons) {
            const group = await createPolygonFromSavedData(polygonData);
            if (group) {
              canvas.add(group);
            }
          }
        }

        // Process schedule day groups (if any)
        if (templateData.scheduleDays && templateData.scheduleDays.length > 0) {
          console.log(
            `📅 Processing ${templateData.scheduleDays.length} schedule day groups`
          );

          for (const dayGroup of templateData.scheduleDays) {
            const baseX = dayGroup.basePosition?.x || 0;
            const baseY = dayGroup.basePosition?.y || 0;

            for (const polygonData of dayGroup.polygons) {
              const group = await createPolygonFromSavedData(
                polygonData,
                baseX,
                baseY
              );
              if (group) {
                canvas.add(group);
              }
            }
          }
        }

        canvas.renderAll();
        console.log("✅ Template applied successfully");
        return true;
      } catch (error) {
        console.error("❌ Error applying template to canvas:", error);
        return false;
      }
    },
    [canvas]
  );

  return {
    saveTemplate,
    loadTemplate,
    deleteTemplate,
    getTemplateInfo,
    getBackgroundImage,
    applyOptimizedTemplateToCanvas,
    isSaving,
    isLoading,
    isDeleting,
    polygons,
  };
}
