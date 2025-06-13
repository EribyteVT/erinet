// components/image/hooks/useTemplateSave.tsx - Updated for file-based backgrounds
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

  // Extract polygons from canvas
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

          const points = (polygonObj as any).points
            ? (polygonObj as any).points.map((p: any) => ({ x: p.x, y: p.y }))
            : (polygonObj as any).points || [];

          polygons.push({
            id: polygonId,
            points: points,
            type: polygonType,
            left: group.left || 0,
            top: group.top || 0,
            fill: "rgba(255, 0, 0, 0.3)",
            stroke: "#ff0000",
            strokeWidth: group.strokeWidth || 2,
            scaleX: group.scaleX || 1,
            scaleY: group.scaleY || 1,
            angle: group.angle || 0,
            opacity: group.opacity || 1,
          });
        }
      }
    });

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
        const payload = {
          guildId: data.guildId,
          templateName: data.templateName,
          templateData,
        };

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
    [canvas]
  );

  // Load template
  const loadTemplate = useCallback(
    async (guildId: string): Promise<LoadTemplateResult> => {
      setIsLoading(true);

      try {
        const result = await loadTemplateAction({ guildId });

        if (result.success && canvas) {
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

  // Apply optimized template to canvas
  const applyOptimizedTemplateToCanvas = useCallback(
    async (templateData: OptimizedTemplateData): Promise<boolean> => {
      if (!canvas || !templateData) {
        console.error("❌ Canvas not initialized or no template data");
        return false;
      }

      try {
        console.log("🎨 Applying optimized template v2.0 to canvas...");

        // Clear existing objects
        canvas.clear();

        // Set canvas dimensions
        if (templateData.canvas) {
          canvas.setDimensions({
            width: templateData.canvas.width,
            height: templateData.canvas.height,
          });
        }

        // Helper function to create polygon from minimal data
        const createPolygonFromMinimal = async (
          polygonData: any,
          baseX: number = 0,
          baseY: number = 0
        ) => {
          const points = polygonData.points;
          const x = baseX + (polygonData.offsetX || 0);
          const y = baseY + (polygonData.offsetY || 0);

          // Get styles (custom or default)
          const styles = templateData.styleOverrides?.[polygonData.id] || {
            fill: "rgba(255, 0, 0, 0.3)",
            stroke: "#ff0000",
            strokeWidth: 2,
          };

          // Create polygon
          const polygon = new fabric.Polygon(points, {
            left: x,
            top: y,
            fill: styles.fill,
            stroke: styles.stroke,
            strokeWidth: styles.strokeWidth,
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

          // Add metadata
          (group as any).polygonId = polygonData.id;
          (group as any).polygonType = polygonData.type || "default";

          return group;
        };

        // Process singular polygons
        if (templateData.singularPolygons) {
          for (const polygonData of templateData.singularPolygons) {
            const group = await createPolygonFromMinimal(polygonData);
            canvas.add(group);
          }
        }

        // Process schedule day groups
        if (templateData.scheduleDays) {
          for (const dayGroup of templateData.scheduleDays) {
            const baseX = dayGroup.basePosition?.x || 0;
            const baseY = dayGroup.basePosition?.y || 0;

            for (const polygonData of dayGroup.polygons) {
              const group = await createPolygonFromMinimal(
                polygonData,
                baseX,
                baseY
              );
              canvas.add(group);
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
