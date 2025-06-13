"use client";

import { useCallback, useState } from "react";
import { useCanvas } from "./useCanvas";
import {
  TypedPolygon,
  OptimizedTemplateData,
  DEFAULT_POLYGON_STYLES,
  TYPE_COLORS,
  MinimalPolygon,
  ScheduleDayGroup,
} from "../types";
import {
  saveTemplate as saveTemplateAction,
  loadTemplate as loadTemplateAction,
  deleteTemplate as deleteTemplateAction,
  getTemplateInfo as getTemplateInfoAction,
  type SaveTemplateResult,
  type LoadTemplateResult,
} from "@/app/actions/template-actions";
import * as fabric from "fabric";

interface SaveTemplateData {
  guildId: string;
  templateName: string;
  backgroundUrl?: string;
}

export function useTemplateSave() {
  const { canvas } = useCanvas();
  const [isSaving, setIsSaving] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  // Extract polygon data from canvas (legacy method kept for backward compatibility)
  const extractPolygonData = useCallback((): TypedPolygon[] => {
    if (!canvas) return [];

    const polygons: TypedPolygon[] = [];

    canvas.getObjects().forEach((obj) => {
      const polygonType = (obj as any).polygonType;
      const polygonId = (obj as any).polygonId;

      if (polygonType && polygonId && obj.type === "group") {
        const group = obj as fabric.Group;
        const polygonObj = group.getObjects().find((o) => o.type === "polygon");
        const points = polygonObj ? (polygonObj as any).points || [] : [];

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
    });

    return polygons;
  }, [canvas]);

  // Extract background image from canvas
  const extractBackgroundImage = useCallback((): string | undefined => {
    if (!canvas) return undefined;

    const backgroundImage = canvas.backgroundImage;
    if (backgroundImage && backgroundImage.type === "image") {
      const imageObj = backgroundImage as fabric.Image;
      return imageObj.getSrc();
    }

    return undefined;
  }, [canvas]);

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
          backgroundUrl: data.backgroundUrl,
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
    []
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

        // Load background image if URL provided

        const img = await fabric.FabricImage.fromURL(
          "http://localhost:3000/template_test.png"
        );
        canvas.backgroundImage = img;

        canvas.renderAll();

        // Helper function to create polygon from minimal data
        const createPolygonFromMinimal = async (
          polygonData: MinimalPolygon,
          baseX: number = 0,
          baseY: number = 0
        ) => {
          const points = polygonData.points;
          const x = baseX + (polygonData.offsetX || 0);
          const y = baseY + (polygonData.offsetY || 0);

          // Get styles (custom or default)
          const styles = templateData.styleOverrides?.[polygonData.id] || {};
          const fill = styles.fill || DEFAULT_POLYGON_STYLES.fill;
          const stroke = styles.stroke || DEFAULT_POLYGON_STYLES.stroke;
          const color = TYPE_COLORS[polygonData.type] || stroke;

          // Create polygon
          const polygon = new fabric.Polygon(points, {
            fill: fill,
            stroke: color,
            strokeWidth:
              styles.strokeWidth || DEFAULT_POLYGON_STYLES.strokeWidth,
            objectCaching: false,
            transparentCorners: false,
            cornerStyle: "circle",
            cornerSize: 8,
            cornerColor: color,
            borderColor: color,
            selectable: false,
            evented: false,
          });

          // Create label
          const label = new fabric.FabricText(polygonData.type, {
            fontSize: 14,
            fill: "white",
            backgroundColor: color,
            padding: 5,
            selectable: false,
            evented: false,
          });

          // Create group
          const group = new fabric.Group([polygon, label], {
            left: x,
            top: y,
            selectable: true,
            evented: true,
            scaleX: styles.scaleX || DEFAULT_POLYGON_STYLES.scaleX,
            scaleY: styles.scaleY || DEFAULT_POLYGON_STYLES.scaleY,
            angle: styles.angle || DEFAULT_POLYGON_STYLES.angle,
            opacity: styles.opacity || DEFAULT_POLYGON_STYLES.opacity,
          });

          // Add metadata
          (group as any).polygonType = polygonData.type;
          (group as any).polygonId = polygonData.id;
          (group as any).points = points;

          return group;
        };

        // Load schedule day groups
        if (templateData.scheduleDays) {
          console.log(
            `📅 Loading ${templateData.scheduleDays.length} schedule days`
          );

          for (const dayGroup of templateData.scheduleDays) {
            console.log(`  Day ${dayGroup.dayIndex}:`, dayGroup);

            // Load each polygon in the day group
            for (const [fieldType, polygonData] of Object.entries(
              dayGroup.polygons
            )) {
              if (polygonData) {
                try {
                  const group = await createPolygonFromMinimal(
                    polygonData,
                    dayGroup.baseX,
                    dayGroup.baseY
                  );
                  canvas.add(group);
                } catch (error) {
                  console.error(
                    `❌ Error creating ${fieldType} polygon:`,
                    error
                  );
                }
              }
            }
          }
        }

        // Load singular polygons
        if (templateData.singularPolygons) {
          console.log(
            `🔷 Loading ${templateData.singularPolygons.length} singular polygons`
          );

          for (const polygonData of templateData.singularPolygons) {
            try {
              const group = await createPolygonFromMinimal(polygonData);
              canvas.add(group);
            } catch (error) {
              console.error(`❌ Error creating singular polygon:`, error);
            }
          }
        }

        canvas.renderAll();
        console.log("✅ Optimized template applied successfully!");
        return true;
      } catch (error) {
        console.error("❌ Error applying optimized template:", error);
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
    applyOptimizedTemplateToCanvas,
    extractPolygonData,
    extractBackgroundImage,
    isSaving,
    isLoading,
    isDeleting,
  };
}
